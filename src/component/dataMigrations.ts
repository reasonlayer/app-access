import { mutationGeneric } from "convex/server";

/**
 * Removes the deprecated `agentName` field from all apiKeys documents.
 * Called from the main app after deploy. Safe to run multiple times.
 */
export const removeAgentNames = mutationGeneric(async (ctx) => {
  const docs = await ctx.db.query("apiKeys").collect();
  let patched = 0;
  for (const doc of docs) {
    if ((doc as Record<string, unknown>).agentName !== undefined) {
      await ctx.db.patch(doc._id, { agentName: undefined });
      patched++;
    }
  }
  return { patched, total: docs.length };
});
