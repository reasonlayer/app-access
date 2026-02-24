import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

interface ImportMetaWithGlob extends ImportMeta {
  glob(pattern: string): Record<string, () => Promise<unknown>>;
}

const modules = (import.meta as ImportMetaWithGlob).glob("./**/*.*s");

describe("createApiKey", () => {
  it("returns a key starting with rl_ak_", async () => {
    const t = convexTest(schema, modules);
    const result = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });
    expect(result.apiKey.startsWith("rl_ak_")).toBe(true);
    expect(result.apiKey).toHaveLength(70);
    expect(result.apiKeyId).toBeTruthy();
  });
});

describe("getApiKeyByHash", () => {
  it("round-trips: create then lookup by hash", async () => {
    const t = convexTest(schema, modules);
    const { apiKey } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const { hashApiKey } = await import("./lib/keys");
    const hash = await hashApiKey(apiKey);

    const result = await t.query(api.public.getApiKeyByHash, {
      apiKeyHash: hash,
    });
    expect(result).not.toBeNull();
    expect(result!.agentName).toBe("test-agent");
    expect(result!.status).toBe("active");
  });

  it("returns null for unknown hash", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.public.getApiKeyByHash, {
      apiKeyHash: "0".repeat(64),
    });
    expect(result).toBeNull();
  });
});

describe("insertConnection + getConnectionById", () => {
  it("round-trips: insert then get", async () => {
    const t = convexTest(schema, modules);

    // Create an API key first
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const now = Date.now();
    const connectionId = await t.mutation(api.public.insertConnection, {
      apiKeyId,
      app: "gmail",
      composioConnectionId: "composio_123",
      composioEntityId: "entity_abc",
      status: "initiated",
      createdAt: now,
      updatedAt: now,
    });

    const result = await t.query(api.public.getConnectionById, {
      id: connectionId,
    });
    expect(result).not.toBeNull();
    expect(result!.app).toBe("gmail");
    expect(result!.status).toBe("initiated");
    expect(result!.composioConnectionId).toBe("composio_123");
  });
});

describe("getActiveConnectionByApiKeyAndApp", () => {
  it("returns active connection", async () => {
    const t = convexTest(schema, modules);

    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const now = Date.now();
    await t.mutation(api.public.insertConnection, {
      apiKeyId,
      app: "gmail",
      composioConnectionId: "composio_123",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const result = await t.query(
      api.public.getActiveConnectionByApiKeyAndApp,
      { apiKeyId, app: "gmail" },
    );
    expect(result).not.toBeNull();
    expect(result!.status).toBe("active");
  });

  it("returns null when no active connection", async () => {
    const t = convexTest(schema, modules);

    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const now = Date.now();
    await t.mutation(api.public.insertConnection, {
      apiKeyId,
      app: "gmail",
      composioConnectionId: "composio_123",
      status: "initiated",
      createdAt: now,
      updatedAt: now,
    });

    const result = await t.query(
      api.public.getActiveConnectionByApiKeyAndApp,
      { apiKeyId, app: "gmail" },
    );
    expect(result).toBeNull();
  });
});

describe("updateConnectionStatus", () => {
  it("updates status", async () => {
    const t = convexTest(schema, modules);

    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const now = Date.now();
    const connectionId = await t.mutation(api.public.insertConnection, {
      apiKeyId,
      app: "gmail",
      composioConnectionId: "composio_123",
      status: "initiated",
      createdAt: now,
      updatedAt: now,
    });

    await t.mutation(api.public.updateConnectionStatus, {
      id: connectionId,
      status: "active",
      updatedAt: now + 1000,
    });

    const result = await t.query(api.public.getConnectionById, {
      id: connectionId,
    });
    expect(result!.status).toBe("active");
    expect(result!.updatedAt).toBe(now + 1000);
  });
});
