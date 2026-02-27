import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateApiKey, hashApiKey } from "./lib/keys";

const connectionStatusValidator = v.union(
  v.literal("initiated"),
  v.literal("active"),
  v.literal("expired"),
  v.literal("failed"),
);

export const createApiKey = mutation({
  args: {},
  returns: v.object({ apiKey: v.string(), apiKeyId: v.string() }),
  handler: async (ctx) => {
    const apiKey = generateApiKey();
    const apiKeyHash = await hashApiKey(apiKey);
    const id = await ctx.db.insert("apiKeys", {
      apiKeyHash,
      status: "active",
      createdAt: Date.now(),
    });
    return { apiKey, apiKeyId: id };
  },
});

export const getApiKeyByHash = query({
  args: { apiKeyHash: v.string() },
  returns: v.union(
    v.object({
      _id: v.string(),
      status: v.union(v.literal("active"), v.literal("revoked")),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("apiKeys")
      .withIndex("by_api_key_hash", (q) => q.eq("apiKeyHash", args.apiKeyHash))
      .first();
    if (!doc) return null;
    return {
      _id: doc._id,
      status: doc.status,
      createdAt: doc.createdAt,
    };
  },
});

// --- Connection functions ---

export const insertConnection = mutation({
  args: {
    apiKeyId: v.id("apiKeys"),
    app: v.string(),
    composioConnectionId: v.optional(v.string()),
    composioEntityId: v.optional(v.string()),
    status: connectionStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  returns: v.id("connections"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("connections", args);
  },
});

export const getConnectionById = query({
  args: { id: v.id("connections") },
  returns: v.union(
    v.object({
      _id: v.id("connections"),
      apiKeyId: v.id("apiKeys"),
      app: v.string(),
      composioConnectionId: v.optional(v.string()),
      composioEntityId: v.optional(v.string()),
      status: connectionStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return {
      _id: doc._id,
      apiKeyId: doc.apiKeyId,
      app: doc.app,
      composioConnectionId: doc.composioConnectionId,
      composioEntityId: doc.composioEntityId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

export const getActiveConnectionByApiKeyAndApp = query({
  args: { apiKeyId: v.id("apiKeys"), app: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("connections"),
      apiKeyId: v.id("apiKeys"),
      app: v.string(),
      composioConnectionId: v.optional(v.string()),
      composioEntityId: v.optional(v.string()),
      status: connectionStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("connections")
      .withIndex("by_api_key_app", (q) =>
        q.eq("apiKeyId", args.apiKeyId).eq("app", args.app),
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (!doc) return null;
    return {
      _id: doc._id,
      apiKeyId: doc.apiKeyId,
      app: doc.app,
      composioConnectionId: doc.composioConnectionId,
      composioEntityId: doc.composioEntityId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

export const getPendingConnectionByApiKeyAndApp = query({
  args: { apiKeyId: v.id("apiKeys"), app: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("connections"),
      apiKeyId: v.id("apiKeys"),
      app: v.string(),
      composioConnectionId: v.optional(v.string()),
      composioEntityId: v.optional(v.string()),
      status: connectionStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("connections")
      .withIndex("by_api_key_app", (q) =>
        q.eq("apiKeyId", args.apiKeyId).eq("app", args.app),
      )
      .filter((q) => q.eq(q.field("status"), "initiated"))
      .first();
    if (!doc) return null;
    return {
      _id: doc._id,
      apiKeyId: doc.apiKeyId,
      app: doc.app,
      composioConnectionId: doc.composioConnectionId,
      composioEntityId: doc.composioEntityId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

// --- Scope override functions ---

export const setScopeOverride = mutation({
  args: {
    apiKeyId: v.id("apiKeys"),
    app: v.string(),
    action: v.string(),
    allowed: v.boolean(),
    updatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scope_overrides")
      .withIndex("by_api_key_app_action", (q) =>
        q
          .eq("apiKeyId", args.apiKeyId)
          .eq("app", args.app)
          .eq("action", args.action),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        allowed: args.allowed,
        updatedAt: args.updatedAt,
      });
    } else {
      await ctx.db.insert("scope_overrides", {
        apiKeyId: args.apiKeyId,
        app: args.app,
        action: args.action,
        allowed: args.allowed,
        updatedAt: args.updatedAt,
      });
    }
    return null;
  },
});

export const getScopeOverrides = query({
  args: { apiKeyId: v.id("apiKeys"), app: v.string() },
  returns: v.array(v.object({ action: v.string(), allowed: v.boolean() })),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("scope_overrides")
      .withIndex("by_api_key_app", (q) =>
        q.eq("apiKeyId", args.apiKeyId).eq("app", args.app),
      )
      .collect();
    return docs.map((d) => ({ action: d.action, allowed: d.allowed }));
  },
});

export const getScopeOverrideForAction = query({
  args: {
    apiKeyId: v.id("apiKeys"),
    app: v.string(),
    action: v.string(),
  },
  returns: v.union(v.object({ allowed: v.boolean() }), v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("scope_overrides")
      .withIndex("by_api_key_app_action", (q) =>
        q
          .eq("apiKeyId", args.apiKeyId)
          .eq("app", args.app)
          .eq("action", args.action),
      )
      .first();
    if (!doc) return null;
    return { allowed: doc.allowed };
  },
});

// --- Account link functions ---

export const linkAccount = mutation({
  args: {
    apiKeyId: v.id("apiKeys"),
    externalAccountId: v.string(),
    linkedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("account_links")
      .withIndex("by_api_key", (q) => q.eq("apiKeyId", args.apiKeyId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        externalAccountId: args.externalAccountId,
        linkedAt: args.linkedAt,
      });
    } else {
      await ctx.db.insert("account_links", {
        apiKeyId: args.apiKeyId,
        externalAccountId: args.externalAccountId,
        linkedAt: args.linkedAt,
      });
    }
    return null;
  },
});

export const getAccountLink = query({
  args: { apiKeyId: v.id("apiKeys") },
  returns: v.union(
    v.object({ externalAccountId: v.string(), linkedAt: v.number() }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("account_links")
      .withIndex("by_api_key", (q) => q.eq("apiKeyId", args.apiKeyId))
      .first();
    if (!doc) return null;
    return {
      externalAccountId: doc.externalAccountId,
      linkedAt: doc.linkedAt,
    };
  },
});

export const getLinkedApiKeys = query({
  args: { externalAccountId: v.string() },
  returns: v.array(
    v.object({ apiKeyId: v.id("apiKeys"), linkedAt: v.number() }),
  ),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("account_links")
      .withIndex("by_external_account", (q) =>
        q.eq("externalAccountId", args.externalAccountId),
      )
      .collect();
    return docs.map((d) => ({ apiKeyId: d.apiKeyId, linkedAt: d.linkedAt }));
  },
});

export const getApiKeyById = query({
  args: { id: v.id("apiKeys") },
  returns: v.union(
    v.object({
      _id: v.id("apiKeys"),
      status: v.union(v.literal("active"), v.literal("revoked")),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return {
      _id: doc._id,
      status: doc.status,
      createdAt: doc.createdAt,
    };
  },
});

export const getConnectionsByApiKey = query({
  args: { apiKeyId: v.id("apiKeys") },
  returns: v.array(
    v.object({
      _id: v.id("connections"),
      app: v.string(),
      status: connectionStatusValidator,
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("connections")
      .withIndex("by_api_key", (q) => q.eq("apiKeyId", args.apiKeyId))
      .collect();
    return docs.map((d) => ({
      _id: d._id,
      app: d.app,
      status: d.status,
      createdAt: d.createdAt,
    }));
  },
});

export const unlinkAccount = mutation({
  args: { apiKeyId: v.id("apiKeys") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("account_links")
      .withIndex("by_api_key", (q) => q.eq("apiKeyId", args.apiKeyId))
      .first();
    if (doc) {
      await ctx.db.delete(doc._id);
    }
    return null;
  },
});

export const updateConnectionStatus = mutation({
  args: {
    id: v.id("connections"),
    status: connectionStatusValidator,
    updatedAt: v.number(),
    composioConnectionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: args.updatedAt,
    };
    if (args.composioConnectionId !== undefined) {
      patch.composioConnectionId = args.composioConnectionId;
    }
    await ctx.db.patch(args.id, patch);
    return null;
  },
});
