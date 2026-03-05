import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  apiKeys: defineTable({
    apiKeyHash: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
    // Deprecated — removed via migration. Keep optional until migration completes.
    agentName: v.optional(v.string()),
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

  scope_overrides: defineTable({
    apiKeyId: v.id("apiKeys"),
    app: v.string(),
    action: v.string(),
    allowed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_api_key_app", ["apiKeyId", "app"])
    .index("by_api_key_app_action", ["apiKeyId", "app", "action"]),

  account_links: defineTable({
    apiKeyId: v.id("apiKeys"),
    externalAccountId: v.string(),
    linkedAt: v.number(),
  })
    .index("by_api_key", ["apiKeyId"])
    .index("by_external_account", ["externalAccountId"]),
});
