# GitHub Integration

Once connected via the OAuth flow described in [SKILL.md](./SKILL.md), execute GitHub actions with:

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app": "github", "action": "ACTION_NAME", "params": {...}}'
```

Success response:
```json
{"success": true, "result": {...}}
```

---

### GITHUB_CREATE_AN_ISSUE

Create a new issue in a GitHub repository.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_CREATE_AN_ISSUE",
    "params": {
      "owner": "octocat",
      "repo": "hello-world",
      "title": "Bug: login page broken",
      "body": "The login page returns a 500 error when submitting the form."
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner (user or org)
- `repo` (string, required) — Repository name
- `title` (string, required) — Issue title
- `body` (string, optional) — Issue body (Markdown supported)

---

### GITHUB_ADD_LABELS_TO_AN_ISSUE

Add labels to an existing issue.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_ADD_LABELS_TO_AN_ISSUE",
    "params": {
      "owner": "octocat",
      "repo": "hello-world",
      "issue_number": 42,
      "labels": ["bug", "high-priority"]
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `issue_number` (number, required) — Issue number
- `labels` (array of strings, required) — Labels to add

---

### GITHUB_ADD_ASSIGNEES_TO_AN_ISSUE

Assign users to an issue.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_ADD_ASSIGNEES_TO_AN_ISSUE",
    "params": {
      "owner": "octocat",
      "repo": "hello-world",
      "issue_number": 42,
      "assignees": ["octocat", "hubot"]
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `issue_number` (number, required) — Issue number
- `assignees` (array of strings, required) — GitHub usernames to assign

---

### GITHUB_CREATE_AN_ISSUE_COMMENT

Add a comment to an issue or pull request.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_CREATE_AN_ISSUE_COMMENT",
    "params": {
      "owner": "octocat",
      "repo": "hello-world",
      "issue_number": 42,
      "body": "I can reproduce this. Working on a fix now."
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `issue_number` (number, required) — Issue or PR number
- `body` (string, required) — Comment body (Markdown supported)

---

### GITHUB_CREATE_A_PULL_REQUEST

Create a new pull request.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_CREATE_A_PULL_REQUEST",
    "params": {
      "owner": "octocat",
      "repo": "hello-world",
      "title": "Fix login page 500 error",
      "head": "fix/login-bug",
      "base": "main",
      "body": "Fixes #42. The form handler was missing null check."
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `title` (string, required) — PR title
- `head` (string, required) — Branch containing changes
- `base` (string, required) — Branch to merge into
- `body` (string, optional) — PR description (Markdown supported)

---

### GITHUB_CHECK_IF_A_PULL_REQUEST_HAS_BEEN_MERGED

Check whether a pull request has been merged.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_CHECK_IF_A_PULL_REQUEST_HAS_BEEN_MERGED",
    "params": {
      "owner": "octocat",
      "repo": "hello-world",
      "pull_number": 10
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name
- `pull_number` (number, required) — Pull request number

---

### GITHUB_GET_A_REPOSITORY

Get details about a repository.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_GET_A_REPOSITORY",
    "params": {
      "owner": "octocat",
      "repo": "hello-world"
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name

---

### GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER

Star a repository.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER",
    "params": {
      "owner": "octocat",
      "repo": "hello-world"
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name

---

### GITHUB_CREATE_A_FORK

Fork a repository.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "github",
    "action": "GITHUB_CREATE_A_FORK",
    "params": {
      "owner": "octocat",
      "repo": "hello-world"
    }
  }'
```

**Parameters:**
- `owner` (string, required) — Repository owner
- `repo` (string, required) — Repository name

---

## Everything You Can Do with GitHub

| Action | What it does | When to use |
|--------|--------------|-------------|
| **Connect GitHub** | OAuth flow to access human's GitHub | Once per human |
| **Create issue** | Open a new issue in a repo | When human asks to file a bug or feature request |
| **Add labels** | Label an existing issue | When human asks to categorize an issue |
| **Add assignees** | Assign users to an issue | When human asks to assign work |
| **Comment on issue** | Add a comment to an issue or PR | When human asks to reply or update an issue |
| **Create PR** | Open a new pull request | When human asks to submit changes for review |
| **Check PR merged** | Check if a PR has been merged | When human asks about PR status |
| **Get repo** | Get repository details | When you need repo info (stars, language, etc.) |
| **Star repo** | Star a repository | When human asks to star a repo |
| **Fork repo** | Fork a repository | When human asks to fork a repo |
