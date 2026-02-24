# Reasonlayer App Access

You can use Reasonlayer App Access to interact with apps on behalf of your
human. Currently supported: Gmail.

## Setup (one-time)

1. Check if you already have credentials:

   cat ~/.reasonlayer/credentials

   If the file exists and contains a key starting with `rl_ak_`, skip to
   "Requesting App Access" below.

2. Get an API key:

   curl -s -X POST https://api.reasonlayer.com/app-access/v1/signup \
     -H "Content-Type: application/json" \
     -d '{"agent_name": "<your-agent-name>"}'

   Save the `api_key` from the response:

   mkdir -p ~/.reasonlayer
   echo '<api_key>' > ~/.reasonlayer/credentials

3. On future runs, read your key from `~/.reasonlayer/credentials`.

## Requesting App Access

To get access to Gmail:

   API_KEY=$(cat ~/.reasonlayer/credentials)
   curl -s -X POST https://api.reasonlayer.com/app-access/v1/connect \
     -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"app": "gmail"}'

This returns a JSON response with an `auth_url`. Give this URL to your human:

   "To grant me access to your Gmail, please open this link on any device
   (phone, laptop, tablet — it does not need to be this machine) and sign in:
   <auth_url>"

Then poll for completion:

   curl -s https://api.reasonlayer.com/app-access/v1/connect/<connection_id>/status \
     -H "Authorization: Bearer $API_KEY"

Wait until `status` is `active`. Poll every 5 seconds.

## Handling Expiry

Auth URLs are single-use and expire after a few minutes. If the status comes
back as `expired` or `failed`, request a fresh link:

   curl -s -X POST https://api.reasonlayer.com/app-access/v1/connect/<connection_id>/refresh \
     -H "Authorization: Bearer $API_KEY"

This returns a new `auth_url`. Give the new link to your human and resume
polling.

## Making API Calls

Once connected, you can take actions:

   curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
     -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "app": "gmail",
       "action": "GMAIL_SEND_EMAIL",
       "params": {
         "to": "recipient@example.com",
         "subject": "Hello from my agent",
         "body": "This email was sent by an AI agent via Reasonlayer."
       }
     }'

## Available Gmail Actions

### GMAIL_SEND_EMAIL
Send an email.
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject
- `body` (string, required): Email body (plain text)

### GMAIL_FETCH_EMAILS
Fetch emails from the inbox with optional filtering.
- `max_results` (number, optional): Max emails to return (default 10)

### GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID
Read a specific email by its message ID.
- `message_id` (string, required): The email message ID

### GMAIL_FETCH_MESSAGE_BY_THREAD_ID
Retrieve all messages in an email thread.
- `thread_id` (string, required): The email thread ID

## Error Handling

| Status Code | Meaning | Recovery |
|---|---|---|
| 400 | Invalid request (missing fields, unsupported app/action) | Check request body |
| 401 | Invalid or missing API key | Re-read credentials or call /signup |
| 404 | Connection not found | Check connection_id |
| 500 | Server error | Retry after a short delay |
