/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    actions: {
      checkComposioConnectionStatus: FunctionReference<
        "action",
        "internal",
        { composioApiKey: string; composioConnectionId: string },
        { status: string },
        Name
      >;
      executeComposioAction: FunctionReference<
        "action",
        "internal",
        {
          actionName: string;
          composioApiKey: string;
          composioConnectionId: string;
          composioEntityId: string;
          params: any;
        },
        { result: any; success: boolean },
        Name
      >;
      initiateComposioConnection: FunctionReference<
        "action",
        "internal",
        { app: string; composioApiKey: string; entityId: string },
        { authUrl: string; connectionId: string },
        Name
      >;
    };
    dataMigrations: {
      removeAgentNames: FunctionReference<
        "mutation",
        "internal",
        any,
        any,
        Name
      >;
    };
    public: {
      createApiKey: FunctionReference<
        "mutation",
        "internal",
        {},
        { apiKey: string; apiKeyId: string },
        Name
      >;
      getAccountLink: FunctionReference<
        "query",
        "internal",
        { apiKeyId: string },
        { externalAccountId: string; linkedAt: number } | null,
        Name
      >;
      getActiveConnectionByApiKeyAndApp: FunctionReference<
        "query",
        "internal",
        { apiKeyId: string; app: string },
        {
          _id: string;
          apiKeyId: string;
          app: string;
          composioConnectionId?: string;
          composioEntityId?: string;
          createdAt: number;
          status: "initiated" | "active" | "expired" | "failed";
          updatedAt: number;
        } | null,
        Name
      >;
      getApiKeyByHash: FunctionReference<
        "query",
        "internal",
        { apiKeyHash: string },
        { _id: string; createdAt: number; status: "active" | "revoked" } | null,
        Name
      >;
      getApiKeyById: FunctionReference<
        "query",
        "internal",
        { id: string },
        { _id: string; createdAt: number; status: "active" | "revoked" } | null,
        Name
      >;
      getConnectionById: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          _id: string;
          apiKeyId: string;
          app: string;
          composioConnectionId?: string;
          composioEntityId?: string;
          createdAt: number;
          status: "initiated" | "active" | "expired" | "failed";
          updatedAt: number;
        } | null,
        Name
      >;
      getConnectionsByApiKey: FunctionReference<
        "query",
        "internal",
        { apiKeyId: string },
        Array<{
          _id: string;
          app: string;
          createdAt: number;
          status: "initiated" | "active" | "expired" | "failed";
        }>,
        Name
      >;
      getLinkedApiKeys: FunctionReference<
        "query",
        "internal",
        { externalAccountId: string },
        Array<{ apiKeyId: string; linkedAt: number }>,
        Name
      >;
      getPendingConnectionByApiKeyAndApp: FunctionReference<
        "query",
        "internal",
        { apiKeyId: string; app: string },
        {
          _id: string;
          apiKeyId: string;
          app: string;
          composioConnectionId?: string;
          composioEntityId?: string;
          createdAt: number;
          status: "initiated" | "active" | "expired" | "failed";
          updatedAt: number;
        } | null,
        Name
      >;
      getScopeOverrideForAction: FunctionReference<
        "query",
        "internal",
        { action: string; apiKeyId: string; app: string },
        { allowed: boolean } | null,
        Name
      >;
      getScopeOverrides: FunctionReference<
        "query",
        "internal",
        { apiKeyId: string; app: string },
        Array<{ action: string; allowed: boolean }>,
        Name
      >;
      insertConnection: FunctionReference<
        "mutation",
        "internal",
        {
          apiKeyId: string;
          app: string;
          composioConnectionId?: string;
          composioEntityId?: string;
          createdAt: number;
          status: "initiated" | "active" | "expired" | "failed";
          updatedAt: number;
        },
        string,
        Name
      >;
      linkAccount: FunctionReference<
        "mutation",
        "internal",
        { apiKeyId: string; externalAccountId: string; linkedAt: number },
        null,
        Name
      >;
      setScopeOverride: FunctionReference<
        "mutation",
        "internal",
        {
          action: string;
          allowed: boolean;
          apiKeyId: string;
          app: string;
          updatedAt: number;
        },
        null,
        Name
      >;
      unlinkAccount: FunctionReference<
        "mutation",
        "internal",
        { apiKeyId: string },
        null,
        Name
      >;
      updateConnectionStatus: FunctionReference<
        "mutation",
        "internal",
        {
          composioConnectionId?: string;
          id: string;
          status: "initiated" | "active" | "expired" | "failed";
          updatedAt: number;
        },
        null,
        Name
      >;
    };
  };
