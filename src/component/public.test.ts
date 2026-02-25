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

describe("setScopeOverride + getScopeOverrides", () => {
  it("creates and retrieves scope overrides", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    await t.mutation(api.public.setScopeOverride, {
      apiKeyId,
      app: "gmail",
      action: "GMAIL_SEND_EMAIL",
      allowed: false,
      updatedAt: Date.now(),
    });

    const overrides = await t.query(api.public.getScopeOverrides, {
      apiKeyId,
      app: "gmail",
    });
    expect(overrides).toHaveLength(1);
    expect(overrides[0].action).toBe("GMAIL_SEND_EMAIL");
    expect(overrides[0].allowed).toBe(false);
  });

  it("upserts on duplicate", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    await t.mutation(api.public.setScopeOverride, {
      apiKeyId,
      app: "gmail",
      action: "GMAIL_SEND_EMAIL",
      allowed: false,
      updatedAt: 1000,
    });

    await t.mutation(api.public.setScopeOverride, {
      apiKeyId,
      app: "gmail",
      action: "GMAIL_SEND_EMAIL",
      allowed: true,
      updatedAt: 2000,
    });

    const overrides = await t.query(api.public.getScopeOverrides, {
      apiKeyId,
      app: "gmail",
    });
    expect(overrides).toHaveLength(1);
    expect(overrides[0].allowed).toBe(true);
  });
});

describe("getScopeOverrideForAction", () => {
  it("returns null when no override exists", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const result = await t.query(api.public.getScopeOverrideForAction, {
      apiKeyId,
      app: "gmail",
      action: "GMAIL_SEND_EMAIL",
    });
    expect(result).toBeNull();
  });

  it("returns override when one exists", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    await t.mutation(api.public.setScopeOverride, {
      apiKeyId,
      app: "gmail",
      action: "GMAIL_SEND_EMAIL",
      allowed: false,
      updatedAt: Date.now(),
    });

    const result = await t.query(api.public.getScopeOverrideForAction, {
      apiKeyId,
      app: "gmail",
      action: "GMAIL_SEND_EMAIL",
    });
    expect(result).not.toBeNull();
    expect(result!.allowed).toBe(false);
  });
});

describe("linkAccount + getAccountLink", () => {
  it("links and retrieves account", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const now = Date.now();
    await t.mutation(api.public.linkAccount, {
      apiKeyId,
      externalAccountId: "user_123",
      linkedAt: now,
    });

    const link = await t.query(api.public.getAccountLink, { apiKeyId });
    expect(link).not.toBeNull();
    expect(link!.externalAccountId).toBe("user_123");
    expect(link!.linkedAt).toBe(now);
  });

  it("upserts on duplicate link", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    await t.mutation(api.public.linkAccount, {
      apiKeyId,
      externalAccountId: "user_123",
      linkedAt: 1000,
    });

    await t.mutation(api.public.linkAccount, {
      apiKeyId,
      externalAccountId: "user_456",
      linkedAt: 2000,
    });

    const link = await t.query(api.public.getAccountLink, { apiKeyId });
    expect(link!.externalAccountId).toBe("user_456");
  });
});

describe("getLinkedApiKeys", () => {
  it("returns linked API keys for an account", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId: key1 } = await t.mutation(api.public.createApiKey, {
      agentName: "agent-1",
    });
    const { apiKeyId: key2 } = await t.mutation(api.public.createApiKey, {
      agentName: "agent-2",
    });

    const now = Date.now();
    await t.mutation(api.public.linkAccount, {
      apiKeyId: key1,
      externalAccountId: "user_123",
      linkedAt: now,
    });
    await t.mutation(api.public.linkAccount, {
      apiKeyId: key2,
      externalAccountId: "user_123",
      linkedAt: now,
    });

    const links = await t.query(api.public.getLinkedApiKeys, {
      externalAccountId: "user_123",
    });
    expect(links).toHaveLength(2);
  });
});

describe("unlinkAccount", () => {
  it("removes account link", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    await t.mutation(api.public.linkAccount, {
      apiKeyId,
      externalAccountId: "user_123",
      linkedAt: Date.now(),
    });

    await t.mutation(api.public.unlinkAccount, { apiKeyId });

    const link = await t.query(api.public.getAccountLink, { apiKeyId });
    expect(link).toBeNull();
  });

  it("is a no-op when no link exists", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    // Should not throw
    await t.mutation(api.public.unlinkAccount, { apiKeyId });
  });
});

describe("getApiKeyById", () => {
  it("returns API key by ID", async () => {
    const t = convexTest(schema, modules);
    const { apiKeyId } = await t.mutation(api.public.createApiKey, {
      agentName: "test-agent",
    });

    const result = await t.query(api.public.getApiKeyById, { id: apiKeyId });
    expect(result).not.toBeNull();
    expect(result!.agentName).toBe("test-agent");
    expect(result!.status).toBe("active");
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
