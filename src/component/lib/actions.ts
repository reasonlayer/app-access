const APP_ACTIONS: Record<string, string[]> = {
  gmail: [
    "GMAIL_SEND_EMAIL",
    "GMAIL_FETCH_EMAILS",
    "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
    "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",
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
