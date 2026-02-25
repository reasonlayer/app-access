import { httpActionGeneric } from "convex/server";
import type { HttpRouter } from "convex/server";
import { authenticateRequest } from "../component/lib/auth";
import { isActionAllowed, getAllowedActions } from "../component/lib/actions";

declare const process: { env: Record<string, string | undefined> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponentApi = any;

const JSON_HEADERS = { "content-type": "application/json" } as const;

function requireComposioApiKey(overrideKey?: string): string {
  const key = overrideKey ?? process.env.COMPOSIO_API_KEY;
  if (!key) throw new Error("Missing COMPOSIO_API_KEY environment variable");
  return key;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export class AppAccess {
  component: AnyComponentApi;
  private _composioApiKey?: string;
  private _validateLinkingToken?: (
    ctx: any,
    token: string,
    apiKeyId: string,
  ) => Promise<{ externalAccountId: string } | { error: string }>;

  constructor(
    component: AnyComponentApi,
    options?: {
      COMPOSIO_API_KEY?: string;
      validateLinkingToken?: (
        ctx: any,
        token: string,
        apiKeyId: string,
      ) => Promise<{ externalAccountId: string } | { error: string }>;
    },
  ) {
    this.component = component;
    this._composioApiKey = options?.COMPOSIO_API_KEY;
    this._validateLinkingToken = options?.validateLinkingToken;
  }

  private get composioApiKey(): string {
    return requireComposioApiKey(this._composioApiKey);
  }

  registerRoutes(http: HttpRouter) {
    // POST /app-access/v1/signup
    http.route({
      path: "/app-access/v1/signup",
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        let body: { agent_name?: string };
        try {
          body = await request.json();
        } catch {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Invalid JSON body" } },
            400,
          );
        }

        if (!body.agent_name || typeof body.agent_name !== "string") {
          return jsonResponse(
            { error: { code: "invalid_request", message: "agent_name is required" } },
            400,
          );
        }

        const result = await ctx.runMutation(
          this.component.public.createApiKey,
          { agentName: body.agent_name },
        );

        return jsonResponse({
          api_key: result.apiKey,
          agent_id: result.apiKeyId,
        });
      }),
    });

    // POST /app-access/v1/connect
    http.route({
      path: "/app-access/v1/connect",
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const bearerToken = extractBearerToken(request);
        if (!bearerToken) {
          return jsonResponse(
            { error: { code: "unauthorized", message: "Missing authorization header" } },
            401,
          );
        }

        const auth = await authenticateRequest(
          ctx,
          this.component.public.getApiKeyByHash,
          bearerToken,
        );
        if ("error" in auth) return auth.error;

        let body: { app?: string };
        try {
          body = await request.json();
        } catch {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Invalid JSON body" } },
            400,
          );
        }

        if (body.app !== "gmail") {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Unsupported app. Supported: gmail" } },
            400,
          );
        }

        // Check for existing active connection
        const existing = await ctx.runQuery(
          this.component.public.getActiveConnectionByApiKeyAndApp,
          { apiKeyId: auth.apiKey._id, app: body.app },
        );
        if (existing) {
          return jsonResponse({
            connection_id: existing._id,
            status: existing.status,
            app: existing.app,
            message: "Active connection already exists",
          });
        }

        // Initiate via Composio
        const entityId = `rl_${auth.apiKey._id}`;
        const composioResult = await ctx.runAction(
          this.component.actions.initiateComposioConnection,
          { composioApiKey: this.composioApiKey, entityId, app: body.app },
        );

        // Store connection record
        const now = Date.now();
        const connectionId = await ctx.runMutation(
          this.component.public.insertConnection,
          {
            apiKeyId: auth.apiKey._id,
            app: body.app,
            composioConnectionId: composioResult.connectionId,
            composioEntityId: entityId,
            status: "initiated" as const,
            createdAt: now,
            updatedAt: now,
          },
        );

        return jsonResponse({
          connection_id: connectionId,
          auth_url: composioResult.authUrl,
          status: "initiated",
        });
      }),
    });

    // GET /app-access/v1/connect/* (status) and POST /app-access/v1/connect/* (refresh)
    http.route({
      pathPrefix: "/app-access/v1/connect/",
      method: "GET",
      handler: httpActionGeneric(async (ctx, request) => {
        const bearerToken = extractBearerToken(request);
        if (!bearerToken) {
          return jsonResponse(
            { error: { code: "unauthorized", message: "Missing authorization header" } },
            401,
          );
        }

        const auth = await authenticateRequest(
          ctx,
          this.component.public.getApiKeyByHash,
          bearerToken,
        );
        if ("error" in auth) return auth.error;

        // Parse connection ID from URL: /app-access/v1/connect/<id>/status
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/").filter(Boolean);
        // ["app-access", "v1", "connect", "<id>", "status"]
        const connectionId = pathParts[3];
        if (!connectionId) {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Missing connection ID" } },
            400,
          );
        }

        let connection;
        try {
          connection = await ctx.runQuery(
            this.component.public.getConnectionById,
            { id: connectionId },
          );
        } catch {
          return jsonResponse(
            { error: { code: "not_found", message: "Connection not found" } },
            404,
          );
        }

        if (!connection || connection.apiKeyId !== auth.apiKey._id) {
          return jsonResponse(
            { error: { code: "not_found", message: "Connection not found" } },
            404,
          );
        }

        // Check Composio for latest status if initiated
        if (connection.status === "initiated" && connection.composioConnectionId) {
          const composioStatus = await ctx.runAction(
            this.component.actions.checkComposioConnectionStatus,
            { composioApiKey: this.composioApiKey, composioConnectionId: connection.composioConnectionId },
          );

          if (composioStatus.status !== "initiated") {
            await ctx.runMutation(
              this.component.public.updateConnectionStatus,
              {
                id: connection._id,
                status: composioStatus.status as "active" | "expired" | "failed",
                updatedAt: Date.now(),
              },
            );
            return jsonResponse({
              connection_id: connection._id,
              status: composioStatus.status,
              app: connection.app,
            });
          }
        }

        return jsonResponse({
          connection_id: connection._id,
          status: connection.status,
          app: connection.app,
        });
      }),
    });

    http.route({
      pathPrefix: "/app-access/v1/connect/",
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const bearerToken = extractBearerToken(request);
        if (!bearerToken) {
          return jsonResponse(
            { error: { code: "unauthorized", message: "Missing authorization header" } },
            401,
          );
        }

        const auth = await authenticateRequest(
          ctx,
          this.component.public.getApiKeyByHash,
          bearerToken,
        );
        if ("error" in auth) return auth.error;

        // Parse connection ID from URL: /app-access/v1/connect/<id>/refresh
        const url = new URL(request.url);
        const pathParts = url.pathname.split("/").filter(Boolean);
        const connectionId = pathParts[3];
        if (!connectionId) {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Missing connection ID" } },
            400,
          );
        }

        let connection;
        try {
          connection = await ctx.runQuery(
            this.component.public.getConnectionById,
            { id: connectionId },
          );
        } catch {
          return jsonResponse(
            { error: { code: "not_found", message: "Connection not found" } },
            404,
          );
        }

        if (!connection || connection.apiKeyId !== auth.apiKey._id) {
          return jsonResponse(
            { error: { code: "not_found", message: "Connection not found" } },
            404,
          );
        }

        // Re-initiate via Composio
        const entityId = connection.composioEntityId || `rl_${auth.apiKey._id}`;
        const composioResult = await ctx.runAction(
          this.component.actions.initiateComposioConnection,
          { composioApiKey: this.composioApiKey, entityId, app: connection.app },
        );

        await ctx.runMutation(
          this.component.public.updateConnectionStatus,
          {
            id: connection._id,
            status: "initiated" as const,
            updatedAt: Date.now(),
            composioConnectionId: composioResult.connectionId,
          },
        );

        return jsonResponse({
          connection_id: connection._id,
          auth_url: composioResult.authUrl,
          status: "initiated",
        });
      }),
    });

    // POST /app-access/v1/action
    http.route({
      path: "/app-access/v1/action",
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const bearerToken = extractBearerToken(request);
        if (!bearerToken) {
          return jsonResponse(
            { error: { code: "unauthorized", message: "Missing authorization header" } },
            401,
          );
        }

        const auth = await authenticateRequest(
          ctx,
          this.component.public.getApiKeyByHash,
          bearerToken,
        );
        if ("error" in auth) return auth.error;

        let body: { app?: string; action?: string; params?: Record<string, unknown> };
        try {
          body = await request.json();
        } catch {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Invalid JSON body" } },
            400,
          );
        }

        if (!body.app || typeof body.app !== "string") {
          return jsonResponse(
            { error: { code: "invalid_request", message: "app is required" } },
            400,
          );
        }

        if (body.app !== "gmail") {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Unsupported app. Supported: gmail" } },
            400,
          );
        }

        if (!body.action || typeof body.action !== "string") {
          return jsonResponse(
            { error: { code: "invalid_request", message: "action is required" } },
            400,
          );
        }

        if (!isActionAllowed(body.app, body.action)) {
          return jsonResponse(
            {
              error: {
                code: "invalid_request",
                message: `Unsupported action. Allowed for ${body.app}: ${getAllowedActions(body.app).join(", ")}`,
              },
            },
            400,
          );
        }

        // Check scope overrides
        const scopeOverride = await ctx.runQuery(
          this.component.public.getScopeOverrideForAction,
          { apiKeyId: auth.apiKey._id, app: body.app, action: body.action },
        );
        if (scopeOverride && !scopeOverride.allowed) {
          return jsonResponse(
            {
              error: {
                code: "scope_denied",
                message: `Action ${body.action} is not permitted for this agent. Your account owner has restricted this action.`,
              },
            },
            403,
          );
        }

        // Look up active connection
        const connection = await ctx.runQuery(
          this.component.public.getActiveConnectionByApiKeyAndApp,
          { apiKeyId: auth.apiKey._id, app: body.app },
        );

        if (!connection || !connection.composioConnectionId) {
          return jsonResponse(
            {
              error: {
                code: "no_connection",
                message: `No active ${body.app} connection. Call /app-access/v1/connect first.`,
              },
            },
            400,
          );
        }

        const result = await ctx.runAction(
          this.component.actions.executeComposioAction,
          {
            composioApiKey: this.composioApiKey,
            actionName: body.action,
            composioConnectionId: connection.composioConnectionId,
            composioEntityId: connection.composioEntityId || `rl_${auth.apiKey._id}`,
            params: body.params ?? {},
          },
        );

        return jsonResponse({
          success: result.success,
          result: result.result,
        });
      }),
    });

    // POST /app-access/v1/link
    http.route({
      path: "/app-access/v1/link",
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        if (!this._validateLinkingToken) {
          return jsonResponse(
            {
              error: {
                code: "not_implemented",
                message: "Account linking is not configured",
              },
            },
            501,
          );
        }

        const bearerToken = extractBearerToken(request);
        if (!bearerToken) {
          return jsonResponse(
            { error: { code: "unauthorized", message: "Missing authorization header" } },
            401,
          );
        }

        const auth = await authenticateRequest(
          ctx,
          this.component.public.getApiKeyByHash,
          bearerToken,
        );
        if ("error" in auth) return auth.error;

        let body: { linking_token?: string };
        try {
          body = await request.json();
        } catch {
          return jsonResponse(
            { error: { code: "invalid_request", message: "Invalid JSON body" } },
            400,
          );
        }

        if (!body.linking_token || typeof body.linking_token !== "string") {
          return jsonResponse(
            { error: { code: "invalid_request", message: "linking_token is required" } },
            400,
          );
        }

        const validationResult = await this._validateLinkingToken(
          ctx,
          body.linking_token,
          auth.apiKey._id,
        );

        if ("error" in validationResult) {
          return jsonResponse(
            { error: { code: "invalid_token", message: validationResult.error } },
            400,
          );
        }

        await ctx.runMutation(this.component.public.linkAccount, {
          apiKeyId: auth.apiKey._id,
          externalAccountId: validationResult.externalAccountId,
          linkedAt: Date.now(),
        });

        return jsonResponse({ status: "linked" });
      }),
    });
  }
}
