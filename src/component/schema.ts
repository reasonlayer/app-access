import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  apiKeys: defineTable({
    agentName: v.string(),
    apiKeyHash: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
  }).index("by_api_key_hash", ["apiKeyHash"]),

  connections: defineTable({
    apiKeyId: v.id("apiKeys"),
    app: v.string(),
    composioConnectionId: v.optional(v.string()),
    composioEntityId: v.optional(v.string()),
    status: v.union(
      v.literal("initiated"),
      v.literal("active"),
      v.literal("expired"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_api_key", ["apiKeyId"])
    .index("by_api_key_app", ["apiKeyId", "app"]),
});
