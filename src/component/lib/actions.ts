const APP_ACTIONS: Record<string, string[]> = {
  gmail: [
    "GMAIL_SEND_EMAIL",
    "GMAIL_FETCH_EMAILS",
    "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
    "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",
  ],
  notion: [
    // Create & Read (existing)
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
    // Search & Query
    "NOTION_SEARCH_NOTION_PAGE",
    "NOTION_QUERY_DATABASE",
    // Update
    "NOTION_UPDATE_PAGE",
    "NOTION_UPDATE_ROW_DATABASE",
    "NOTION_UPDATE_BLOCK",
    "NOTION_UPDATE_SCHEMA_DATABASE",
    // Delete
    "NOTION_DELETE_BLOCK",
    // Comments
    "NOTION_CREATE_COMMENT",
    "NOTION_FETCH_COMMENTS",
    "NOTION_RETRIEVE_COMMENT",
    // Page Operations
    "NOTION_DUPLICATE_PAGE",
    // Metadata & Properties
    "NOTION_FETCH_BLOCK_METADATA",
    "NOTION_GET_PAGE_PROPERTY_ACTION",
    "NOTION_RETRIEVE_DATABASE_PROPERTY",
    // Users
    "NOTION_LIST_USERS",
    "NOTION_GET_ABOUT_ME",
    "NOTION_GET_ABOUT_USER",
  ],
  github: [
    "GITHUB_CREATE_AN_ISSUE",
    "GITHUB_ADD_LABELS_TO_AN_ISSUE",
    "GITHUB_ADD_ASSIGNEES_TO_AN_ISSUE",
    "GITHUB_CREATE_AN_ISSUE_COMMENT",
    "GITHUB_CREATE_A_PULL_REQUEST",
    "GITHUB_CHECK_IF_A_PULL_REQUEST_HAS_BEEN_MERGED",
    "GITHUB_GET_A_REPOSITORY",
    "GITHUB_CREATE_A_REPOSITORY",
    "GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER",
    "GITHUB_CREATE_A_FORK",
  ],
};

export function isAppSupported(app: string): boolean {
  return app in APP_ACTIONS;
}

export function isActionAllowed(app: string, action: string): boolean {
  const actions = APP_ACTIONS[app];
  if (!actions) return false;
  return actions.includes(action);
}

export function getAllowedActions(app: string): string[] {
  return APP_ACTIONS[app] ?? [];
}

export function getAppActions(): Record<string, string[]> {
  return { ...APP_ACTIONS };
}

export function getSupportedApps(): string[] {
  return Object.keys(APP_ACTIONS);
}
