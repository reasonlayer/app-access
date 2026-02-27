# Notion Integration

Once connected via the OAuth flow described in [SKILL.md](./SKILL.md), execute Notion actions with:

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app": "notion", "action": "ACTION_NAME", "params": {...}}'
```

Success response:
```json
{"success": true, "result": {...}}
```

---

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
      "parent_id": "page_or_database_id",
      "title": "My New Page"
    }
  }'
```

**Parameters:**
- `parent_id` (string, required) — ID of the parent page or database
- `title` (string, required) — Title of the new page

---

### NOTION_ADD_MULTIPLE_PAGE_CONTENT

Add multiple content blocks to an existing page at once.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_ADD_MULTIPLE_PAGE_CONTENT",
    "params": {
      "parent_block_id": "page_id",
      "content_blocks": [
        {"content_block": {"type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "First paragraph"}}]}}},
        {"content_block": {"type": "heading_2", "heading_2": {"rich_text": [{"text": {"content": "A heading"}}]}}},
        {"content_block": {"type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Second paragraph"}}]}}}
      ]
    }
  }'
```

**Parameters:**
- `parent_block_id` (string, required) — ID of the page to add content to
- `content_blocks` (array, required) — Array of objects, each with a `content_block` key containing a full Notion block object (e.g. `{"type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "..."}}]}}`)

---

### NOTION_FETCH_DATA

List pages and/or databases accessible in the connected Notion workspace. You must specify exactly one of `get_pages`, `get_databases`, or `get_all`.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_FETCH_DATA",
    "params": {
      "get_all": true
    }
  }'
```

Response:
```json
{
  "success": true,
  "result": {
    "values": [
      {"id": "abc123", "title": "My Page", "type": "page"},
      {"id": "def456", "title": "My Database", "type": "database"}
    ]
  }
}
```

**Parameters (pick exactly one):**
- `get_pages` (boolean) — List only pages
- `get_databases` (boolean) — List only databases
- `get_all` (boolean) — List both pages and databases

---

### NOTION_FETCH_BLOCK_CONTENTS

Retrieve the content blocks of a specific block (or page).

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_FETCH_BLOCK_CONTENTS",
    "params": {
      "block_id": "block_or_page_id"
    }
  }'
```

**Parameters:**
- `block_id` (string, required) — ID of the block or page to fetch contents from

---

### NOTION_FETCH_DATABASE

Fetch the schema and metadata of a Notion database.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_FETCH_DATABASE",
    "params": {
      "database_id": "database_id"
    }
  }'
```

**Parameters:**
- `database_id` (string, required) — ID of the database to fetch

---

### NOTION_INSERT_ROW_DATABASE

Insert a new row into a Notion database.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_INSERT_ROW_DATABASE",
    "params": {
      "database_id": "database_id",
      "properties": [
        {"name": "Name", "value": "New row", "type": "title"},
        {"name": "Status", "value": "In Progress", "type": "select"}
      ]
    }
  }'
```

**Parameters:**
- `database_id` (string, required) — ID of the database to insert into
- `properties` (array, required) — Array of property objects, each with:
  - `name` (string) — Property name (must match a column in the database)
  - `value` (string) — The value to set
  - `type` (string) — Property type (e.g. `"title"`, `"select"`, `"rich_text"`, `"date"`)

---

### NOTION_FETCH_ROW

Fetch a specific row (page) from a database by its ID.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_FETCH_ROW",
    "params": {
      "page_id": "row_page_id"
    }
  }'
```

**Parameters:**
- `page_id` (string, required) — ID of the row (page) to fetch

---

### NOTION_CREATE_DATABASE

Create a new database inside a Notion page.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_CREATE_DATABASE",
    "params": {
      "parent_id": "parent_page_id",
      "title": "Project Tracker",
      "properties": [
        {"name": "Name", "type": "title"},
        {"name": "Status", "type": "select", "options": [{"name": "Todo"}, {"name": "Done"}]}
      ]
    }
  }'
```

**Parameters:**
- `parent_id` (string, required) — ID of the parent page
- `title` (string, required) — Title of the new database
- `properties` (array, required) — Array of property definitions, each with:
  - `name` (string) — Property name
  - `type` (string) — Property type (e.g. `"title"`, `"select"`, `"rich_text"`, `"date"`)
  - `options` (array, optional) — For `select`/`multi_select` types, array of `{"name": "..."}` objects

---

### NOTION_ARCHIVE_NOTION_PAGE

Archive (soft-delete) a Notion page.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_ARCHIVE_NOTION_PAGE",
    "params": {
      "page_id": "page_id"
    }
  }'
```

**Parameters:**
- `page_id` (string, required) — ID of the page to archive

---

### NOTION_APPEND_BLOCK_CHILDREN

Append child blocks to an existing block or page.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_APPEND_BLOCK_CHILDREN",
    "params": {
      "block_id": "block_or_page_id",
      "children": [
        {"type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Appended text"}}]}}
      ]
    }
  }'
```

**Parameters:**
- `block_id` (string, required) — ID of the block or page to append to
- `children` (array, required) — Array of block objects to append

---

### NOTION_SEARCH_NOTION_PAGE

Search for pages and databases by title.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_SEARCH_NOTION_PAGE",
    "params": {
      "query": "Meeting Notes",
      "filter": "page",
      "page_size": 10
    }
  }'
```

**Parameters:**
- `query` (string, required) — Search query to match against page/database titles
- `filter` (string, optional) — Filter by object type: `"page"` or `"database"`
- `page_size` (number, optional) — Max results to return (default 100, max 100)
- `sort_direction` (string, optional) — Sort by last edited: `"ascending"` or `"descending"`

---

### NOTION_QUERY_DATABASE

Query rows in a database with optional sorting.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_QUERY_DATABASE",
    "params": {
      "database_id": "database_id",
      "sort_by": "Created",
      "sort_direction": "descending",
      "page_size": 25
    }
  }'
```

**Parameters:**
- `database_id` (string, required) — ID of the database to query
- `sort_by` (string, optional) — Property name to sort by
- `sort_direction` (string, optional) — `"ascending"` or `"descending"` (default `"ascending"`)
- `page_size` (number, optional) — Max rows to return (default 100, max 100)
- `start_cursor` (string, optional) — Cursor for pagination

---

### NOTION_UPDATE_PAGE

Update a page's properties, icon, cover, or archive status.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_UPDATE_PAGE",
    "params": {
      "page_id": "page_id",
      "properties": {
        "Name": {"title": [{"text": {"content": "Updated Title"}}]}
      },
      "icon": {"type": "emoji", "emoji": "🚀"},
      "archived": false
    }
  }'
```

**Parameters:**
- `page_id` (string, required) — ID of the page to update
- `properties` (object, optional) — Page properties to update (Notion property value objects)
- `icon` (object, optional) — Icon object (`{"type": "emoji", "emoji": "..."}` or `{"type": "external", "external": {"url": "..."}}`)
- `cover` (object, optional) — Cover image (`{"type": "external", "external": {"url": "..."}}`)
- `archived` (boolean, optional) — Set to `true` to archive or `false` to unarchive

---

### NOTION_UPDATE_ROW_DATABASE

Update properties of an existing database row.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_UPDATE_ROW_DATABASE",
    "params": {
      "row_id": "row_page_id",
      "properties": [
        {"name": "Status", "value": "Done", "type": "select"},
        {"name": "Notes", "value": "Completed the task", "type": "rich_text"}
      ]
    }
  }'
```

**Parameters:**
- `row_id` (string, required) — ID of the row (page) to update
- `properties` (array, required) — Array of property objects, each with:
  - `name` (string) — Property name (must match a column in the database)
  - `value` (string) — The value to set
  - `type` (string) — Property type (e.g. `"title"`, `"select"`, `"rich_text"`, `"date"`)

---

### NOTION_UPDATE_BLOCK

Update the content of an existing block.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_UPDATE_BLOCK",
    "params": {
      "block_id": "block_id",
      "block_type": "paragraph",
      "content": "Updated paragraph text"
    }
  }'
```

**Parameters:**
- `block_id` (string, required) — ID of the block to update
- `block_type` (string, required) — Type of the block (e.g. `"paragraph"`, `"heading_1"`, `"to_do"`, `"toggle"`)
- `content` (string, required) — The new text content for the block

---

### NOTION_UPDATE_SCHEMA_DATABASE

Update a database's title, description, or property schema.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_UPDATE_SCHEMA_DATABASE",
    "params": {
      "database_id": "database_id",
      "title": [{"text": {"content": "Updated DB Title"}}],
      "description": [{"text": {"content": "A description of this database"}}],
      "properties": {
        "Priority": {"select": {"options": [{"name": "High"}, {"name": "Medium"}, {"name": "Low"}]}}
      }
    }
  }'
```

**Parameters:**
- `database_id` (string, required) — ID of the database to update
- `title` (array, optional) — Rich text array for the database title
- `description` (array, optional) — Rich text array for the database description
- `properties` (object, optional) — Property schema updates (Notion property schema objects)

---

### NOTION_DELETE_BLOCK

Archive (delete) a block, page, or database. In Notion, deletion is archival.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_DELETE_BLOCK",
    "params": {
      "block_id": "block_id"
    }
  }'
```

**Parameters:**
- `block_id` (string, required) — ID of the block, page, or database to delete (archive)

---

### NOTION_CREATE_COMMENT

Add a comment to a page or an existing discussion thread.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_CREATE_COMMENT",
    "params": {
      "parent_page_id": "page_id",
      "comment": {"type": "paragraph", "content": "This looks great!"}
    }
  }'
```

**Parameters:**
- `parent_page_id` (string, required if no `discussion_id`) — Page ID to create a new comment thread on
- `discussion_id` (string, required if no `parent_page_id`) — Existing discussion thread ID to reply to
- `comment` (object, required) — Rich text object with `type` and `content` (e.g. `{"type": "paragraph", "content": "Your comment text"}`)

---

### NOTION_FETCH_COMMENTS

Retrieve comments on a block or page.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_FETCH_COMMENTS",
    "params": {
      "block_id": "page_or_block_id",
      "page_size": 50
    }
  }'
```

**Parameters:**
- `block_id` (string, required) — ID of the block or page to fetch comments from
- `page_size` (number, optional) — Max comments to return (default 100, max 100)
- `start_cursor` (string, optional) — Cursor for pagination

---

### NOTION_RETRIEVE_COMMENT

Retrieve a specific comment by its ID.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_RETRIEVE_COMMENT",
    "params": {
      "comment_id": "comment_id"
    }
  }'
```

**Parameters:**
- `comment_id` (string, required) — ID of the comment to retrieve

---

### NOTION_DUPLICATE_PAGE

Duplicate a page with all its content blocks.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_DUPLICATE_PAGE",
    "params": {
      "page_id": "page_id",
      "parent_id": "new_parent_id",
      "title": "Copy of My Page"
    }
  }'
```

**Parameters:**
- `page_id` (string, required) — ID of the page to duplicate
- `parent_id` (string, required) — ID of the parent page for the new copy (must be a page ID, not a database ID)
- `title` (string, optional) — Title for the duplicated page (defaults to "Copy of [original title]")

---

### NOTION_FETCH_BLOCK_METADATA

Retrieve metadata for a specific block by its UUID.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_FETCH_BLOCK_METADATA",
    "params": {
      "block_id": "block_id"
    }
  }'
```

**Parameters:**
- `block_id` (string, required) — UUID of the block to fetch metadata for

---

### NOTION_GET_PAGE_PROPERTY_ACTION

Get a specific property value from a page.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_GET_PAGE_PROPERTY_ACTION",
    "params": {
      "page_id": "page_id",
      "property_id": "property_id"
    }
  }'
```

**Parameters:**
- `page_id` (string, required) — ID of the page
- `property_id` (string, required) — ID of the property to retrieve

---

### NOTION_RETRIEVE_DATABASE_PROPERTY

Get a specific property definition from a database schema.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_RETRIEVE_DATABASE_PROPERTY",
    "params": {
      "database_id": "database_id",
      "property_id": "property_id"
    }
  }'
```

**Parameters:**
- `database_id` (string, required) — ID of the database
- `property_id` (string, required) — ID of the property to retrieve

---

### NOTION_LIST_USERS

List all users in the workspace.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_LIST_USERS",
    "params": {
      "page_size": 50
    }
  }'
```

**Parameters:**
- `page_size` (number, optional) — Max users to return (default 100, max 100)
- `start_cursor` (string, optional) — Cursor for pagination

---

### NOTION_GET_ABOUT_ME

Get information about the bot user (the integration itself).

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_GET_ABOUT_ME",
    "params": {}
  }'
```

**Parameters:**
- None required

---

### NOTION_GET_ABOUT_USER

Get information about a specific user by their ID.

```bash
curl -s -X POST https://api.reasonlayer.com/app-access/v1/action \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app": "notion",
    "action": "NOTION_GET_ABOUT_USER",
    "params": {
      "user_id": "user_id"
    }
  }'
```

**Parameters:**
- `user_id` (string, required) — ID of the user to retrieve

---

## Everything You Can Do with Notion

| Action | What it does | When to use |
|--------|--------------|-------------|
| **Connect Notion** | OAuth flow to access human's Notion | Once per human |
| **Create page** | Create a new page | When human asks to create a Notion page |
| **Add page content** | Add multiple blocks to a page | When human wants to populate a page |
| **Fetch data** | List accessible pages and/or databases | When you need to discover page/database IDs |
| **Fetch block contents** | Get child blocks of a block/page | When you need the full content of a page |
| **Fetch database** | Get database schema and metadata | When you need to understand a database structure |
| **Insert database row** | Add a row to a database | When human asks to add an entry |
| **Fetch row** | Get a specific database row | When you need details of one row |
| **Create database** | Create a new database in a page | When human asks to set up a new database |
| **Archive page** | Soft-delete a page | When human asks to remove/archive a page |
| **Append blocks** | Append content to a block/page | When human asks to add content to an existing page |
| **Search pages** | Search pages/databases by title | When you need to find a page or database by name |
| **Query database** | Query database rows with sorting | When you need to list rows with specific ordering |
| **Update page** | Update page properties, icon, cover | When human asks to change page metadata |
| **Update database row** | Update a row's properties | When human asks to edit an existing entry |
| **Update block** | Update block text content | When human asks to edit a block in a page |
| **Update database schema** | Update database title, description, properties | When human asks to modify database structure |
| **Delete block** | Archive/delete a block, page, or database | When human asks to delete a block or object |
| **Create comment** | Add a comment to a page or thread | When human asks to comment on a page |
| **Fetch comments** | Retrieve comments on a page/block | When you need to read comments |
| **Retrieve comment** | Get a specific comment by ID | When you need details of one comment |
| **Duplicate page** | Duplicate a page with all content | When human asks to copy a page |
| **Fetch block metadata** | Get block metadata by UUID | When you need block type, timestamps, etc. |
| **Get page property** | Get a specific page property | When you need one property value from a page |
| **Get database property** | Get a database property definition | When you need schema details of one column |
| **List users** | List workspace users | When you need to know who's in the workspace |
| **Get bot info** | Get bot user info | When you need the integration's own identity |
| **Get user info** | Get user info by ID | When you need details about a specific user |
