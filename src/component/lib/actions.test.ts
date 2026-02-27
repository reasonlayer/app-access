import { describe, expect, it } from "vitest";
import {
  isAppSupported,
  isActionAllowed,
  getAllowedActions,
  getSupportedApps,
} from "./actions";

describe("isAppSupported", () => {
  it("returns true for gmail", () => {
    expect(isAppSupported("gmail")).toBe(true);
  });

  it("returns true for github", () => {
    expect(isAppSupported("github")).toBe(true);
  });

  it("returns true for notion", () => {
    expect(isAppSupported("notion")).toBe(true);
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

  it("returns true for valid github actions", () => {
    expect(isActionAllowed("github", "GITHUB_CREATE_AN_ISSUE")).toBe(true);
    expect(isActionAllowed("github", "GITHUB_CREATE_A_PULL_REQUEST")).toBe(true);
    expect(isActionAllowed("github", "GITHUB_GET_A_REPOSITORY")).toBe(true);
  });

  it("returns false for invalid github action", () => {
    expect(isActionAllowed("github", "GITHUB_DELETE_REPO")).toBe(false);
  });

  it("returns true for valid notion actions", () => {
    expect(isActionAllowed("notion", "NOTION_CREATE_NOTION_PAGE")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_FETCH_DATA")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_FETCH_DATABASE")).toBe(true);
  });

  it("returns true for notion search and query actions", () => {
    expect(isActionAllowed("notion", "NOTION_SEARCH_NOTION_PAGE")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_QUERY_DATABASE")).toBe(true);
  });

  it("returns true for notion update actions", () => {
    expect(isActionAllowed("notion", "NOTION_UPDATE_PAGE")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_UPDATE_ROW_DATABASE")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_UPDATE_BLOCK")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_UPDATE_SCHEMA_DATABASE")).toBe(true);
  });

  it("returns true for notion delete action", () => {
    expect(isActionAllowed("notion", "NOTION_DELETE_BLOCK")).toBe(true);
  });

  it("returns true for notion comment actions", () => {
    expect(isActionAllowed("notion", "NOTION_CREATE_COMMENT")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_FETCH_COMMENTS")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_RETRIEVE_COMMENT")).toBe(true);
  });

  it("returns true for notion page operation actions", () => {
    expect(isActionAllowed("notion", "NOTION_DUPLICATE_PAGE")).toBe(true);
  });

  it("returns true for notion metadata and user actions", () => {
    expect(isActionAllowed("notion", "NOTION_FETCH_BLOCK_METADATA")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_GET_PAGE_PROPERTY_ACTION")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_LIST_USERS")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_GET_ABOUT_ME")).toBe(true);
    expect(isActionAllowed("notion", "NOTION_GET_ABOUT_USER")).toBe(true);
  });

  it("returns false for invalid notion action", () => {
    expect(isActionAllowed("notion", "NOTION_DELETE_DATABASE")).toBe(false);
  });

  it("returns false for unsupported app", () => {
    expect(isActionAllowed("slack", "SLACK_SEND_MESSAGE")).toBe(false);
  });
});

describe("getAllowedActions", () => {
  it("returns gmail actions", () => {
    expect(getAllowedActions("gmail")).toHaveLength(4);
  });

  it("returns github actions", () => {
    expect(getAllowedActions("github")).toHaveLength(10);
  });

  it("returns notion actions", () => {
    expect(getAllowedActions("notion")).toHaveLength(27);
  });

  it("returns empty for unsupported app", () => {
    expect(getAllowedActions("unknown")).toEqual([]);
  });
});

describe("getSupportedApps", () => {
  it("returns all supported apps", () => {
    const apps = getSupportedApps();
    expect(apps).toContain("gmail");
    expect(apps).toContain("notion");
    expect(apps).toContain("github");
    expect(apps).toHaveLength(3);
  });
});
