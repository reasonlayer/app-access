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
  args: { agentName: v.string() },
  returns: v.object({ apiKey: v.string(), apiKeyId: v.string() }),
  handler: async (ctx, args) => {
    const apiKey = generateApiKey();
    const apiKeyHash = await hashApiKey(apiKey);
    const id = await ctx.db.insert("apiKeys", {
      agentName: args.agentName,
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
      agentName: v.string(),
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
      agentName: doc.agentName,
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
