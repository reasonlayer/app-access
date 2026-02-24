const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3";

async function composioFetch(
  apiKey: string,
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${COMPOSIO_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...options.headers,
    },
  });
  return res;
}

export async function initiateConnection(args: {
  composioApiKey: string;
  entityId: string;
  app: string;
}): Promise<{ connectionId: string; authUrl: string }> {
  // Step 1: Look up auth_config_id for the app
  const configRes = await composioFetch(
    args.composioApiKey,
    `/auth_configs?toolkit_slugs[]=${encodeURIComponent(args.app)}`,
    { method: "GET" },
  );

  if (!configRes.ok) {
    const text = await configRes.text();
    throw new Error(`Composio auth_configs lookup failed (${configRes.status}): ${text}`);
  }

  const configData = await configRes.json();
  const items = configData.items ?? configData;
  const authConfig = Array.isArray(items) ? items[0] : null;
  if (!authConfig?.id) {
    throw new Error(`No auth config found for app "${args.app}"`);
  }
  const authConfigId: string = authConfig.id;

  // Step 2: Initiate the connection
  const res = await composioFetch(args.composioApiKey, "/connected_accounts/link", {
    method: "POST",
    body: JSON.stringify({
      auth_config_id: authConfigId,
      user_id: args.entityId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio initiateConnection failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    connectionId: data.connected_account_id || data.id,
    authUrl: data.redirect_url || "",
  };
}

export async function getConnectionStatus(args: {
  composioApiKey: string;
  connectionId: string;
}): Promise<{ status: string }> {
  const res = await composioFetch(
    args.composioApiKey,
    `/connected_accounts/${args.connectionId}`,
    { method: "GET" },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio getConnectionStatus failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // Composio v3 returns statuses like "ACTIVE", "INITIALIZING", etc.
  // Map to our internal status values.
  const rawStatus = (data.status || "unknown").toLowerCase();
  const statusMap: Record<string, string> = {
    initializing: "initiated",
    initiated: "initiated",
    active: "active",
    expired: "expired",
    failed: "failed",
  };
  return { status: statusMap[rawStatus] ?? rawStatus };
}

export async function executeAction(args: {
  composioApiKey: string;
  actionName: string;
  connectionId: string;
  entityId: string;
  params: Record<string, unknown>;
}): Promise<{ success: boolean; result: unknown }> {
  const res = await composioFetch(
    args.composioApiKey,
    `/tools/execute/${encodeURIComponent(args.actionName)}`,
    {
      method: "POST",
      body: JSON.stringify({
        connected_account_id: args.connectionId,
        entity_id: args.entityId,
        arguments: args.params,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio executeAction failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    success: data.successfull ?? data.successful ?? true,
    result: data.data ?? data,
  };
}
