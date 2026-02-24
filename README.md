# Reasonlayer App Access

A Convex component that lets AI agents request and obtain OAuth access to third-party apps (Gmail for MVP) on behalf of human users. It wraps [Composio](https://composio.dev) behind a simple API and ships as a skill file that any agent can consume.

## Installation

```bash
pnpm add reasonlayer-app-access
```

## Convex Component Setup

### 1. Register the component

In your `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import appAccess from "reasonlayer-app-access/convex.config";

const app = defineApp();
app.use(appAccess);

export default app;
```

### 2. Wire up HTTP routes

In your `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { AppAccess } from "reasonlayer-app-access";
import { components } from "./_generated/api";

const http = httpRouter();

const appAccess = new AppAccess(components.appAccess);
appAccess.registerRoutes(http);

export default http;
```

## Environment Variables

Set `COMPOSIO_API_KEY` in your Convex deployment environment variables.

## Skill File

The [skill file](./skill-file.md) contains instructions that teach AI agents how to use the API. Give it to your agent as a system prompt or tool definition.

## API Reference

### `POST /app-access/v1/signup`
Create an agent identity and get an API key.

### `POST /app-access/v1/connect`
Initiate an OAuth connection for an app (requires Bearer token).

### `GET /app-access/v1/connect/:id/status`
Check the status of a connection.

### `POST /app-access/v1/connect/:id/refresh`
Generate a fresh auth URL for an expired/failed connection.

### `POST /app-access/v1/action`
Execute an action on a connected app (e.g., send email via Gmail).

## License

MIT
# app-access
