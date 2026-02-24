import { describe, expect, it } from "vitest";
import { isAppSupported, isActionAllowed, getAllowedActions } from "./actions";

describe("isAppSupported", () => {
  it("returns true for gmail", () => {
    expect(isAppSupported("gmail")).toBe(true);
  });

  it("returns false for unsupported app", () => {
    expect(isAppSupported("slack")).toBe(false);
  });
});

describe("isActionAllowed", () => {
  it("returns true for valid gmail actions", () => {
    expect(isActionAllowed("gmail", "GMAIL_SEND_EMAIL")).toBe(true);
    expect(isActionAllowed("gmail", "GMAIL_FETCH_EMAILS")).toBe(true);
    expect(isActionAllowed("gmail", "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID")).toBe(true);
    expect(isActionAllowed("gmail", "GMAIL_FETCH_MESSAGE_BY_THREAD_ID")).toBe(true);
  });

  it("returns false for invalid action", () => {
    expect(isActionAllowed("gmail", "GMAIL_DELETE_ALL")).toBe(false);
  });

  it("returns false for unsupported app", () => {
    expect(isActionAllowed("slack", "SLACK_SEND_MESSAGE")).toBe(false);
  });
});

describe("getAllowedActions", () => {
  it("returns gmail actions", () => {
    expect(getAllowedActions("gmail")).toHaveLength(4);
  });

  it("returns empty for unsupported app", () => {
    expect(getAllowedActions("unknown")).toEqual([]);
  });
});
