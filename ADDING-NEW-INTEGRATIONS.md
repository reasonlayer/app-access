# Adding New Integrations

This document walks through the steps to add a new app integration (e.g. Notion, Slack, Google Calendar) to Reasonlayer App Access.

---

## Overview

Every integration follows the same pattern:

1. **Register actions** in the action registry
2. **Allow the app** in the HTTP route guards
3. **Add tests** for the new app's actions
4. **Create a SKILL file** documenting the app for AI agents
5. **Update the main SKILL.md** to list the new app
6. **Verify on Composio** that the app slug and action names are correct

---

## Prerequisites

Before starting, confirm:

- The app is supported by Composio (our OAuth/action provider). Check the [Composio docs](https://docs.composio.dev) for the app's **toolkit slug** (e.g. `gmail`, `notion`, `slack`, `googlecalendar`) and available **action names** (e.g. `NOTION_CREATE_NOTION_PAGE`, `SLACK_SEND_MESSAGE`).
- You have a `COMPOSIO_API_KEY` set up for testing.

---

## Step 1: Register actions in the action registry

**File:** `src/component/lib/actions.ts`

Add the new app and its actions to the `APP_ACTIONS` map:

```typescript
const APP_ACTIONS: Record<string, string[]> = {
  gmail: [
    "GMAIL_SEND_EMAIL",
    "GMAIL_FETCH_EMAILS",
    "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
    "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",
  ],
  // NEW: add your app here
  notion: [
    "NOTION_CREATE_NOTION_PAGE",
    "NOTION_ADD_MULTIPLE_PAGE_CONTENT",
    "NOTION_FETCH_DATA",
    "NOTION_FETCH_BLOCK_CONTENTS",
    "NOTION_FETCH_DATABASE",
    "NOTION_INSERT_ROW_DATABASE",
    "NOTION_FETCH_ROW",
    "NOTION_CREATE_DATABASE",
    "NOTION_ARCHIVE_NOTION_PAGE",
    "NOTION_APPEND_BLOCK_CHILDREN",
  ],
};
```

**Naming convention:** Action names are `{APP}_{ACTION_NAME}` in uppercase with underscores. These must match the Composio action names exactly.

---

## Step 2: Allow the app in the HTTP route guards

**File:** `src/client/index.ts`

There are two hardcoded `gmail`-only checks that need to be updated. Replace them with `isAppSupported()` calls.

### In the `/connect` route (~line 137):

Current:
```typescript
if (body.app !== "gmail") {
  return jsonResponse(
    { error: { code: "invalid_request", message: "Unsupported app. Supported: gmail" } },
    400,
  );
}
```

Replace with:
```typescript
import { isAppSupported, getAllowedActions, getAppActions } from "../component/lib/actions";

// ...

if (!body.app || !isAppSupported(body.app)) {
  const supported = Object.keys(getAppActions()).join(", ");
  return jsonResponse(
    { error: { code: "invalid_request", message: `Unsupported app. Supported: ${supported}` } },
    400,
  );
}
```

### In the `/action` route (~line 384):

Current:
```typescript
if (body.app !== "gmail") {
  return jsonResponse(
    { error: { code: "invalid_request", message: "Unsupported app. Supported: gmail" } },
    400,
  );
}
```

Replace with the same `isAppSupported()` check:
```typescript
if (!isAppSupported(body.app)) {
  const supported = Object.keys(getAppActions()).join(", ");
  return jsonResponse(
    { error: { code: "invalid_request", message: `Unsupported app. Supported: ${supported}` } },
    400,
  );
}
```

> **Note:** Once this refactor is done, future integrations won't need to touch `client/index.ts` at all — adding the app to `APP_ACTIONS` will be sufficient.

---

## Step 3: Add tests

**File:** `src/component/lib/actions.test.ts`

Add a describe block for the new app:

```typescript
describe("notion support", () => {
  it("supports notion app", () => {
    expect(isAppSupported("notion")).toBe(true);
  });

  it("allows valid notion actions", () => {
    expect(isActionAllowed("notion", "NOTION_CREATE_NOTION_PAGE")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_FETCH_DATA")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_FETCH_DATABASE")).toBe(true);
  });

  it("rejects invalid notion actions", () => {
    expect(isActionAllowed("notion", "NOTION_DELETE_DATABASE")).toBe(false);
  });

  it("returns correct action count", () => {
    expect(getAllowedActions("notion")).toHaveLength(10);
  });
});
```

Run tests:
```bash
pnpm test
```

---

## Step 4: Create a SKILL file for the new app

**File:** `NOTION.md` (or `SLACK.md`, `GOOGLE_CALENDAR.md`, etc.)

Each app gets its own SKILL file that AI agents can read to understand how to use the integration. Use this template:

```markdown
---
name: reasonlayer-notion
version: 0.0.1
description: Give your AI agent access to Notion. Create pages, search workspaces, update content.
homepage: https://reasonlayer.com
metadata: {"reasonlayer":{"category":"app-access","app":"notion","api_base":"https://api.reasonlayer.com/app-access/v1"}}
---

# Reasonlayer Notion Access

Give your AI agent access to Notion. Create pages, search workspaces, update content — all via simple API calls.

**Base URL:** `https://api.reasonlayer.com/app-access/v1`

> This file documents Notion-specific actions. For registration, authentication, and connection setup, see [SKILL.md](./SKILL.md).

---

## Connect to Notion

```bash
API_KEY=$(cat ~/.reasonlayer/credentials)
curl -s -X POST https://api.reasonlayer.com/app-access/v1/connect \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app": "notion"}'
```

Then follow the standard OAuth flow (send auth_url to your human, poll for status).

---

## Notion Actions

### NOTION_CREATE_NOTION_PAGE

Create a new page in a Notion workspace.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_CREATE_NOTION_PAGE",
    "params": {
      "title": "Meeting Notes",
      "parent_id": "...",
      "content": "..."
    }
  }'
```

**Parameters:**
- `title` (string, required) — Page title
- `parent_id` (string, required) — Parent page or database ID
- `content` (string, optional) — Page content

<!-- Repeat for each action -->

---

## Everything You Can Do

| Action | What it does | When to use |
|--------|--------------|-------------|
| **NOTION_CREATE_NOTION_PAGE** | Create a new page | When human asks you to create a note or doc |
| **NOTION_FETCH_DATA** | Read page data | When you need the content of a specific page |
| **NOTION_FETCH_DATABASE** | Fetch a database | When you need to read a Notion database |
| **NOTION_INSERT_ROW_DATABASE** | Insert a database row | When human asks you to add an entry to a database |
| **NOTION_ARCHIVE_NOTION_PAGE** | Archive a page | When human asks you to archive or remove a page |
```

### SKILL file guidelines:

- **One file per app.** Named `{APP}.md` in the project root.
- **Reference the main SKILL.md** for shared flows (registration, auth, connection, error handling). Don't duplicate those.
- **Document every action** with a curl example, full parameter list, and a brief description of what it does.
- **Include the summary table** at the bottom so agents can quickly scan what's available.
- **Use the same frontmatter format** as the main SKILL.md (name, version, description, metadata).
- **Verify action params** against Composio's API docs — the parameter names must match what Composio expects.

---

## Step 5: Update the main SKILL.md

Add the new app to the main SKILL.md:

1. Update the **description** in the frontmatter to mention the new app.
2. Add a reference to the new SKILL file in the **Skill Files** table.
3. Add a brief section or note pointing agents to the app-specific file.
4. Update the **Everything You Can Do** table with the new actions.

---

## Step 6: Verify on Composio

Before shipping, verify that:

1. The app's **toolkit slug** (e.g. `notion`) matches what Composio expects. The slug is passed to `initiateConnection()` in `src/component/lib/composio.ts` and used to look up `auth_configs`.
2. The **action names** (e.g. `NOTION_CREATE_PAGE`) match Composio's action identifiers exactly. These are passed to `executeAction()`.
3. The **OAuth flow works end-to-end**: initiate connection, complete OAuth, execute an action.

You can test this manually:
```bash
# Check that the auth config exists for the app
curl -s https://backend.composio.dev/api/v3/auth_configs?toolkit_slugs[]=notion \
  -H "x-api-key: YOUR_COMPOSIO_KEY"
```

---

## Checklist

When adding a new integration, make sure you've done all of the following:

- [ ] Confirmed the app exists on Composio with the correct slug
- [ ] Confirmed the action names on Composio
- [ ] Added the app + actions to `APP_ACTIONS` in `src/component/lib/actions.ts`
- [ ] Replaced hardcoded `gmail` checks in `src/client/index.ts` with `isAppSupported()` (only needed once)
- [ ] Added tests in `src/component/lib/actions.test.ts`
- [ ] Created `{APP}.md` SKILL file in the project root
- [ ] Updated the main `SKILL.md` to reference the new app
- [ ] Tested the full OAuth + action flow end-to-end
- [ ] Bumped the version in `package.json`

---

## Files touched per integration

| File | What to change |
|------|---------------|
| `src/component/lib/actions.ts` | Add app + actions to `APP_ACTIONS` |
| `src/client/index.ts` | One-time refactor: replace hardcoded checks with `isAppSupported()` |
| `src/component/lib/actions.test.ts` | Add test suite for the new app |
| `{APP}.md` | New file: app-specific SKILL doc for agents |
| `SKILL.md` | Reference the new app and SKILL file |
| `package.json` | Version bump |

---

## Architecture notes

- **No schema changes needed.** The `connections` table stores `app` as a free-form string, so any app name works.
- **No Composio wrapper changes needed.** `composio.ts` already accepts any app slug — it dynamically looks up auth configs and executes actions by name.
- **No route changes needed** (after the one-time refactor in Step 2). The HTTP routes are app-agnostic once the hardcoded checks are removed.
- **Scope overrides work automatically.** The `scope_overrides` table is keyed by `(apiKeyId, app, action)`, so new apps/actions are supported without changes.
