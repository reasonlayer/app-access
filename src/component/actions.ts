import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  initiateConnection,
  getConnectionStatus,
  executeAction,
} from "./lib/composio";

export const initiateComposioConnection = action({
  args: { composioApiKey: v.string(), entityId: v.string(), app: v.string() },
  returns: v.object({
    connectionId: v.string(),
    authUrl: v.string(),
  }),
  handler: async (_ctx, args) => {
    return await initiateConnection({
      composioApiKey: args.composioApiKey,
      entityId: args.entityId,
      app: args.app,
    });
  },
});

export const checkComposioConnectionStatus = action({
  args: { composioApiKey: v.string(), composioConnectionId: v.string() },
  returns: v.object({ status: v.string() }),
  handler: async (_ctx, args) => {
    return await getConnectionStatus({
      composioApiKey: args.composioApiKey,
      connectionId: args.composioConnectionId,
    });
  },
});

export const executeComposioAction = action({
  args: {
    composioApiKey: v.string(),
    actionName: v.string(),
    composioConnectionId: v.string(),
    composioEntityId: v.string(),
    params: v.any(),
  },
  returns: v.object({
    success: v.boolean(),
    result: v.any(),
  }),
  handler: async (_ctx, args) => {
    return await executeAction({
      composioApiKey: args.composioApiKey,
      actionName: args.actionName,
      connectionId: args.composioConnectionId,
      entityId: args.composioEntityId,
      params: args.params,
    });
  },
});
