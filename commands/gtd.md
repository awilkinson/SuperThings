# GTD - Get Things Done

Research and execute tasks from Computer and Deep Work projects with intelligent caching and delegation.

## Tool Selection

| Tool | When to Use | MCP Function |
|------|-------------|--------------|
| **Firecrawl** | URL scraping, quick single-page reads | `mcp__firecrawl-mcp__firecrawl_scrape` |
| **Tavily** | Deep research, multi-source comprehensive searches | `mcp__tavily__tavily_search` |
| **Zapier Gmail** | Draft/send emails, search inbox for context | `mcp__zapier__gmail_*` |

### Tool Details

**Firecrawl** - Fast URL resolution and page scraping:
- Use for: URL tasks, quick page summaries, video metadata
- Function: `mcp__firecrawl-mcp__firecrawl_scrape`
- Best for: Single pages, YouTube videos, articles, GitHub repos

**Tavily** - Deep research with comprehensive results:
- Use for: "Research X" tasks, DD (Deep Dive) requests, competitive analysis
- Function: `mcp__tavily__tavily_search`
- Best for: Multi-source research, current events, company research, market analysis

**Zapier Gmail** - Email operations via Google Workspace:
- `mcp__zapier__gmail_send_email` - Send drafted emails
- `mcp__zapier__gmail_create_draft` - Save as draft for user review
- `mcp__zapier__gmail_find_email` - Search inbox for context (prior conversations)

## Research Cache System

**All research results are cached** to `~/Projects/SuperThings/data/research-cache.json`:
- Results persist for 7 days
- Use `/gtd resume` to continue a previous session
- Say "details N" to expand cached findings

## Workflow

### Step 1: Check for Previous Session
```bash
cat ~/Projects/SuperThings/data/research-cache.json
```
If recent session exists (< 24h), ask: "Continue previous session or start fresh?"

### Step 2: Fetch Tasks
- Computer: `mcp__things-mcp__things_get_project` with `LDhUsibk3dp2ZPioQySSiu`
- Deep Work: `mcp__things-mcp__things_get_project` with `WamuBi2sFwbUwpXz9NZetP`

### Step 3: Categorize Tasks

| Category | Pattern | Tool | Action |
|----------|---------|------|--------|
| **URL tasks** | Contains http://, https://, youtu.be | **Firecrawl** | Scrape page, summarize content |
| **Research** | "Research X", "Find X", "Look up X" | **Tavily** | Deep multi-source search |
| **Email** | "Email X", "Send X email", "Reply to X" | **Zapier Gmail** | Draft and send email |
| **Intro** | "Intro X to Y", "Connect X with Y" | **Zapier Gmail** | Draft intro email, CC both parties |
| **Not helpable** | Physical tasks, calls, meetings | Skip | Mark for manual handling |

### Step 4: Execute Research (Batched)

**Rate limit protection**: Max 8 parallel agents per batch.

For each task type:

**URL Tasks** (Firecrawl):
1. Scrape URL with `mcp__firecrawl-mcp__firecrawl_scrape`
2. Extract title, description, key content
3. Summarize with TLDR bullets
4. Cache results immediately

**Research Tasks** (Tavily):
1. Search with `mcp__tavily__tavily_search`
2. Synthesize findings from multiple sources
3. Include specific facts, numbers, names
4. Cache results immediately

**Email/Intro Tasks** (Zapier):
1. Search inbox for prior context: `mcp__zapier__gmail_find_email`
2. Draft email based on task + context
3. Present draft for approval
4. On approval: `mcp__zapier__gmail_send_email`

### Step 5: Display Results (Rich TLDR Format)

```
Research Complete: [N] tasks processed

┌─ 1 ─────────────────────────────────────────────────────────
│  [Task Title]
│
│  • Key finding 1 with specific details
│  • Key finding 2 with numbers/facts
│  • Key finding 3 with actionable insight
│  • Additional bullet if needed
│  • Source: [where info came from]
│
├─ 2 ─────────────────────────────────────────────────────────
│  https://example.com/article (URL task)
│
│  • Article title: "How to Build X"
│  • Main thesis: [summary of what the link contains]
│  • Key points from the actual page content
│  • Why this was saved (inferred from context)
│  • Source: Firecrawl (visited link)
│
├─ 3 ─────────────────────────────────────────────────────────
│  Research competitor pricing
│
│  • Found 5 competitors: Acme ($15/mo), Beta ($25/mo)...
│  • Enterprise tiers range $100-500/seat
│  • Key differentiator: only Gamma has API at base tier
│  • Annual discounts: 15-25% typical
│  • Sources: Tavily (G2, Capterra, pricing pages)
```

**Display rules:**
- Use as many bullets as needed to capture key findings
- Keep each bullet concise but informative (TLDR style)
- For URL tasks: summarize actual content from the page
- Always include sources and which tool was used

## Triage Commands

After research display, user responds with commands:

| Command | Action | Example |
|---------|--------|---------|
| `C` | Complete task in Things | `1: C` |
| `C [note]` | Complete with note | `1: C already handled last week` |
| `D [person]` | Delegate - draft email via Zapier | `2: D Brianna` |
| `D [person] [modifier]` | Delegate with context | `2: D Brianna within the next week` |
| `DD` | Deep Dive - use **Tavily** for expanded research | `3: DD` |
| `DD [focus]` | Deep Dive with specific focus | `3: DD focus on enterprise pricing` |

**Example triage response:**
```
1: C
2: D Brianna please handle by Friday
3: DD focus on North American competitors only
4-6: C
7: D John can you review this contract
8: C noted for future reference
```

**Default behavior**: Tasks without commands are kept in Things with notes updated.

## Command Execution

### C (Complete)
Mark task complete in Things using `mcp__things-mcp__things_update_todo`.

### D (Delegate)
1. Parse: `D [person] [optional modifier]`
2. Search inbox for person's email: `mcp__zapier__gmail_find_email`
3. Draft email via Zapier:
   ```
   To: [person's email]
   Subject: Task: [task title]

   Hi [Person],

   Could you help with this? [task description]

   [Include research findings if relevant]

   [modifier context if provided, e.g., "Ideally by Friday"]

   Thanks,
   Andrew
   ```
4. Show draft for approval
5. On approval: Send via `mcp__zapier__gmail_send_email`
6. Mark Things task complete

### DD (Deep Dive)
1. Parse: `DD [optional focus]`
2. Launch **Tavily** deep research with expanded queries
3. Use multiple search queries to get comprehensive coverage
4. If focus provided, concentrate searches on that aspect
5. Update cache with expanded findings
6. Display new results with Tavily sources

## URL/Link Handling

**Critical**: If a task contains a URL, use **Firecrawl** to scrape:

1. Scrape with `mcp__firecrawl-mcp__firecrawl_scrape`
2. Extract and summarize the actual page content
3. Include:
   - What the page/video/article is about
   - Key points and takeaways
   - Why the user likely saved this
4. Mark source as "Firecrawl (visited link)"

Example URL task handling:
```
Task: "https://youtu.be/abc123"

Using Firecrawl to scrape YouTube page:
1. Get video title, description, duration
2. If transcript available, summarize key points
3. Infer why saved (topic, speaker, relevance)

Output:
• Video: "The Future of AI" by Sam Altman (45 min)
• Key points: GPT-5 roadmap, multimodal focus, AGI timeline
• Discusses compute scaling concerns
• Likely saved for: AI strategy research
• Source: Firecrawl (visited link)
```

## Email/Intro Task Handling

**Email Tasks** (pattern: "Email X", "Send X email"):
1. Search inbox for context: `mcp__zapier__gmail_find_email` with person's name
2. Draft email based on task description + prior conversation context
3. Present draft for approval
4. On approval: `mcp__zapier__gmail_send_email`
5. Mark Things task complete

**Intro Tasks** (pattern: "Intro X to Y", "Connect X with Y"):
1. Parse to extract both names
2. Search inbox for each person: `mcp__zapier__gmail_find_email`
3. Draft intro email:
   ```
   Subject: Introduction: [Person A] <> [Person B]

   Hi [Person B],

   I wanted to introduce you to [Person A]. [context about Person A]

   [Person A], meet [Person B]. [context about Person B]

   I'll let you two take it from here.

   Best,
   Andrew
   ```
4. Present draft for approval
5. On approval: `mcp__zapier__gmail_send_email` (CC both parties)
6. Mark Things task complete

## Cache Management

### Cache Structure
```json
{
  "last_updated": "ISO-timestamp",
  "sessions": {
    "session-uuid": {
      "started_at": "ISO-timestamp",
      "tasks_researched": 32,
      "results": [
        {
          "task_id": "Things-UUID",
          "task_title": "Research X",
          "researched_at": "ISO-timestamp",
          "tool_used": "tavily|firecrawl|zapier",
          "findings": "Full research text with all bullets...",
          "sources": ["url1", "url2"],
          "user_decision": "complete|delegate|deepdive|pending",
          "notes_updated": true
        }
      ]
    }
  }
}
```

### Cache Operations
- **Write**: After each research batch completes
- **Read**: On `/gtd resume` or "details N" request
- **Cleanup**: Remove sessions older than 7 days

## Resume Previous Session

If user says `/gtd resume`:
1. Read cache file
2. Find most recent session
3. Display previous results (from cache, not re-researched)
4. Allow user to continue triage where they left off

## Parallel Execution Rules

**Rate limit protection:**
- Max 8 parallel agents per batch
- Wait for batch completion before launching next
- Retry rate-limited tasks in next batch
- Use haiku model for research agents (faster, cheaper)

```
Batch 1: [task 1-8] → wait → check failures
Batch 2: [task 9-16 + retries] → wait → check
Batch 3: [remaining + retries] → etc.
```

## Project IDs
- Computer: `LDhUsibk3dp2ZPioQySSiu`
- Deep Work: `WamuBi2sFwbUwpXz9NZetP`

## Execution

Now execute the GTD workflow:
1. Check for previous session in cache
2. Fetch tasks from both projects
3. Categorize tasks by type (URL → Firecrawl, Research → Tavily, Email → Zapier)
4. Execute research with appropriate tools
5. Cache results immediately
6. Display rich TLDR summaries with tool sources
7. Process C/D/DD commands
8. Update cache with decisions
