import { hashApiKey } from "./keys";

type ApiKeyDoc = {
  _id: string;
  status: "active" | "revoked";
  createdAt: number;
};

type AuthCtx = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runQuery: (...args: any[]) => Promise<any>;
};

export async function authenticateRequest(
  ctx: AuthCtx,
  getApiKeyByHashRef: unknown,
  bearerToken: string,
): Promise<{ error: Response } | { apiKey: ApiKeyDoc }> {
  const apiKeyHash = await hashApiKey(bearerToken);
  const result = (await ctx.runQuery(getApiKeyByHashRef, {
    apiKeyHash,
  })) as ApiKeyDoc | null;

  if (!result || result.status !== "active") {
    return {
      error: new Response(
        JSON.stringify({
          error: { code: "unauthorized", message: "Invalid or revoked API key" },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      ),
    };
  }

  return { apiKey: result };
}
