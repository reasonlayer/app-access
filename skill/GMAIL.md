# Gmail Integration

Once connected via the OAuth flow described in [SKILL.md](./SKILL.md), execute Gmail actions with:

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app": "gmail", "action": "ACTION_NAME", "params": {...}}'
```

Success response:
```json
{"success": true, "result": {...}}
```

---

### GMAIL_SEND_EMAIL

Send an email from your human's Gmail account.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "gmail",
    "action": "GMAIL_SEND_EMAIL",
    "params": {
      "recipient_email": "recipient@example.com",
      "subject": "Hello from my agent",
      "body": "This email was sent by an AI agent via Reasonlayer."
    }
  }'
```

**Parameters:**
- `recipient_email` (string, required) — Recipient email address
- `subject` (string, required) — Email subject
- `body` (string, required) — Email body (plain text)

---

### GMAIL_FETCH_EMAILS

Fetch emails from the inbox.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "gmail",
    "action": "GMAIL_FETCH_EMAILS",
    "params": {
      "max_results": 10
    }
  }'
```

**Parameters:**
- `max_results` (number, optional) — Max emails to return (default: 10)

---

### GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID

Read a specific email by its message ID.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "gmail",
    "action": "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
    "params": {
      "message_id": "17f5e3a8f0b2c4d9"
    }
  }'
```

**Parameters:**
- `message_id` (string, required) — The email message ID

---

### GMAIL_FETCH_MESSAGE_BY_THREAD_ID

Retrieve all messages in an email thread.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "gmail",
    "action": "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",
    "params": {
      "thread_id": "17f5e3a8f0b2c4d9"
    }
  }'
```

**Parameters:**
- `thread_id` (string, required) — The email thread ID

---

## Everything You Can Do with Gmail

| Action | What it does | When to use |
|--------|--------------|-------------|
| **Connect Gmail** | OAuth flow to access human's Gmail | Once per human |
| **Send email** | Send an email from human's account | When human asks you to email someone |
| **Fetch inbox** | Get recent emails | When human asks "what's in my inbox?" |
| **Read message** | Get a specific email by ID | When you need the full content of one email |
| **Read thread** | Get all messages in a conversation | When you need the full conversation history |
