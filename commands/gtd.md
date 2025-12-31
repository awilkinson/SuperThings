# GTD - Get Things Done

Research and execute tasks from Computer and Deep Work projects with intelligent caching and delegation.

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

| Category | Pattern | Action |
|----------|---------|--------|
| **Research** | "Research X", "Find X", "Look up X", "Check out X" | Web search + summarize |
| **URL tasks** | Contains http://, https://, youtu.be, etc. | **Visit link first**, then summarize |
| **Email** | "Email X", "Send X email", "Reply to X" | Draft via Zapier |
| **Intro** | "Intro X to Y", "Connect X with Y" | Gmail context + draft intro |
| **Not helpable** | Physical tasks, calls, meetings | Skip |

### Step 4: Execute Research (Batched)

**Rate limit protection**: Max 8 parallel agents per batch.

For each task:
1. If task contains URL → **visit the link first** using Firecrawl
2. Then perform web search for additional context
3. Write results to cache immediately
4. Display TLDR summary

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
│  • Source: visited link, summarized content
│
├─ 3 ─────────────────────────────────────────────────────────
│  Research competitor pricing
│
│  • Found 5 competitors: Acme ($15/mo), Beta ($25/mo)...
│  • Enterprise tiers range $100-500/seat
│  • Key differentiator: only Gamma has API at base tier
│  • Annual discounts: 15-25% typical
│  • Sources: G2, Capterra, pricing pages
```

**Display rules:**
- Use as many bullets as needed to capture key findings
- Keep each bullet concise but informative (TLDR style)
- For URL tasks: summarize actual content from the page
- Always include sources

## Triage Commands

After research display, user responds with commands:

| Command | Action | Example |
|---------|--------|---------|
| `C` | Complete task in Things | `1: C` |
| `C [note]` | Complete with note | `1: C already handled last week` |
| `D [person]` | Delegate - draft email via Zapier | `2: D Brianna` |
| `D [person] [modifier]` | Delegate with context | `2: D Brianna within the next week` |
| `DD` | Deep Dive - expand with more research | `3: DD` |
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
2. Use Zapier MCP to draft email:
   ```
   To: [person's email if known, otherwise ask]
   Subject: Task: [task title]

   Hi [Person],

   Could you help with this? [task description]

   [modifier context if provided, e.g., "Ideally by Friday"]

   Thanks,
   Andrew
   ```
3. Show draft for approval
4. On approval: Send via Zapier, mark Things task complete

### DD (Deep Dive)
1. Parse: `DD [optional focus]`
2. Launch new research agent with expanded scope
3. Use more search queries, visit more sources
4. If focus provided, concentrate on that aspect
5. Update cache with expanded findings
6. Display new results

## URL/Link Handling

**Critical**: If a task contains a URL, the research agent MUST:

1. **Visit the link first** using `mcp__firecrawl-mcp__firecrawl_scrape`
2. Extract and summarize the actual page content
3. Include:
   - What the page/video/article is about
   - Key points and takeaways
   - Why the user likely saved this
4. Mark source as "visited link" (not web search)

Example URL task handling:
```
Task: "https://youtu.be/abc123"

Research agent:
1. Scrape YouTube page → Get video title, description, duration
2. If transcript available, summarize key points
3. Infer why saved (topic, speaker, relevance)

Output:
• Video: "The Future of AI" by Sam Altman (45 min)
• Key points: GPT-5 roadmap, multimodal focus, AGI timeline
• Discusses compute scaling concerns
• Likely saved for: AI strategy research
• Source: visited link, summarized content
```

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
- Use haiku model for research (faster, cheaper)

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
3. Categorize and research (URL tasks: visit first!)
4. Cache results immediately
5. Display rich TLDR summaries
6. Process C/D/DD commands
7. Update cache with decisions
