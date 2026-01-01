---
model: haiku
---

# Things Inbox Triage

Triage and organize the Things inbox by cleaning up task titles and assigning them to appropriate projects. **Uses learned patterns from your corrections to get better over time.**

## Learning System Integration

**ALWAYS load learned patterns before processing:**

```bash
cat ~/Projects/SuperThings/data/patterns.json
```

The patterns file contains:
- `title_transforms`: Regex patterns for rewriting titles (e.g., "Fix X" → "Delegate to Brianna: Fix X")
- `project_hints`: Keyword → project mappings with confidence scores
- `exact_overrides`: Specific title → transformation mappings

**Priority order for suggestions:**
1. `exact_overrides` (exact title match)
2. `title_transforms` (regex pattern match)
3. `project_hints` (keyword-based)
4. Hardcoded defaults (below)

## Model Escalation - Auto-Switch to Sonnet

Runs on Haiku, but **auto-escalates to Sonnet** when hitting speedbumps:

| Haiku (default) | Sonnet (escalate) |
|-----------------|-------------------|
| Fetch/cache tasks | Unclear/cryptic tasks |
| URL resolution | Clarification questions |
| Clear categorization | Judgment calls |
| Bulk updates | "Get stuff done" execution |

**How to escalate:** Use Task tool with `model: sonnet` for complex items.

## Workflow

1. **Fetch inbox** - Call `mcp__SuperThings__things_get_inbox` directly (server handles caching internally with 1-minute TTL)

2. **Process each task**:
   - **URL tasks**: Use Firecrawl/WebFetch to resolve URLs and create descriptive titles
     - YouTube: "Watch: [Video Title] - [Creator]"
     - GitHub: "Review: [Repo Name] - [Description]"
     - Google Maps: "Visit: [Place Name]"
     - Twitter/X: "Read: [Tweet summary]"
     - **IMPORTANT**: When updating a URL title, move the original URL to the notes field
   - **Clear tasks**: Keep title as-is, just categorize
   - **Unclear/cryptic tasks**: Leave title unchanged (don't guess)

3. **Assign projects** using these rules:

   **Default: Computer** - Almost everything goes here if it can be done on computer OR delegated.

   | Pattern | Project |
   |---------|---------|
   | Research, Email, Intro, Follow up, Draft, Buy, Book, Schedule, Review, Check, Order, Send, Create, Find, Watch, Read | Computer (`LDhUsibk3dp2ZPioQySSiu`) |
   | Fix, maintenance, home repairs | Computer - Reformat as "Delegate to Brianna: [task]" |
   | Call [person], Phone call required | Call (`Er67bc9YAur6ZeKTCBLC4c`) |
   | Physical in-person errands only | Out and About (`5LwYiPJAkWGSCMHML8xaXb`) |
   | Kid-specific activities | Kids/Activities (`7n14Jusf7nCrLADfAANabW`) |
   | **Build/Make [software]** - DEFAULT to Deep Work | Deep Work (`WamuBi2sFwbUwpXz9NZetP`) |
   | Long-form writing (1+ hour focused work) | Deep Work (`WamuBi2sFwbUwpXz9NZetP`) |

   **Build/Make → Deep Work Logic** (this is critical):

   Any task starting with "Build" or "Make" that involves creating SOFTWARE goes to **Deep Work**:
   - Apps, plugins, tools, bots, systems, integrations
   - Reviewers, analyzers, dashboards, automations
   - APIs, scrapers, workflows, pipelines
   - Anything that requires writing code for multiple hours

   **EXCEPTIONS** (these stay in Computer):
   - "Build a list of..." → just research/compilation
   - "Build rapport with..." → relationship, not software
   - "Make a reservation..." → booking task
   - "Make an intro..." → email task

   **Rules**:
   - When in doubt → Computer
   - NEVER assign to Someday unless user explicitly asks
   - Fix/maintenance → "Delegate to Brianna: [task]" → Computer
   - Research → Always Computer (never Deep Work)
   - Build/Make software → Deep Work (assume multi-hour unless obviously simple)

4. **Present results** using grouped card format showing before/after:
   ```
   Inbox (44) | C=Computer D=Deep O=Out P=Call

   ┌─ 1 ─────────────────────────────────────────────────── C ✎
   │  https://youtu.be/pE3KKUKXcTM...
   │  ↓
   │  Watch: Semiconductor Industry Works
   ├─ 2 ─────────────────────────────────────────────────── C ✎
   │  Fix fireplace
   │  ↓
   │  Delegate to Brianna: Fix fireplace        [learned: 12x]
   ├─ 3 ─────────────────────────────────────────────────── C
   │  Research competitor pricing
   ├─ 4 ─────────────────────────────────────────────────── P
   │  Call dentist
   ```

   **Format rules:**
   - Card header: `┌─ # ───...─── X ✎` where X is project code, ✎ if title changes
   - Continuation: `├─ # ───...───` for items 2+
   - Line 1 under header: original title (full, can wrap if needed)
   - Line 2 (if edit): `│  ↓` (down arrow separator)
   - Line 3 (if edit): `│  New title`
   - **Learning indicator**: Add `[learned: Nx]` when suggestion comes from patterns.json
   - No arrow/new title if no title change (just moving to project)
   - Project codes: C=Computer, D=Deep, O=Out&About, P=Call, K=Kids
   - Keep divider line ~60 chars wide

5. **Wait for user approval**: User replies with numbers (e.g., "1,2,5-10" or "all")

6. **Execute updates** using `mcp__SuperThings__things_update_todo` for approved items

## URL Resolution (Firecrawl)

For URL tasks, use **Firecrawl** to fetch and summarize content:

**Tool**: `mcp__firecrawl-mcp__firecrawl_scrape`

Launch parallel agents (using haiku model) to resolve URLs:
1. Scrape URL with `mcp__firecrawl-mcp__firecrawl_scrape`
2. Extract title, description, and key content
3. Create actionable task title based on content type:
   - YouTube: "Watch: [Video Title] - [Creator]"
   - GitHub: "Review: [Repo Name] - [Description]"
   - Article: "Read: [Article Title]"
   - Product: "Check out: [Product Name]"
4. Move original URL to notes field

## Project IDs Reference
- Computer: `LDhUsibk3dp2ZPioQySSiu`
- Deep Work: `WamuBi2sFwbUwpXz9NZetP`
- Call: `Er67bc9YAur6ZeKTCBLC4c`
- Home: `NsSR9HR3pd2bVi2z4QHFfM`
- Out and About: `5LwYiPJAkWGSCMHML8xaXb`
- Kids/Activities: `7n14Jusf7nCrLADfAANabW`
- Someday: `EZ5uJWRtcrvJ4U852NkNQ8`

## Learning from Corrections

**After user approves/modifies suggestions, log and learn:**

### Step 1: Log corrections to history
For each processed task, append to `~/Projects/SuperThings/data/history.jsonl`:

```json
{"ts": "ISO-timestamp", "original": "Fix fireplace", "suggested_title": "Delegate to Brianna: Fix fireplace", "final_title": "Delegate to Brianna: Fix fireplace", "suggested_project": "Computer", "final_project": "Computer", "title_accepted": true, "project_accepted": true}
```

### Step 2: Update patterns.json

**If user accepted suggestion as-is:**
- Increment confidence of matching pattern by 1

**If user modified the title:**
- Extract the transformation pattern
- If similar pattern exists: update it
- If new pattern: add to `title_transforms` with confidence=1
- Add the original title to `examples` array

**If user changed the project:**
- Update `project_hints` - increment the chosen project's count for relevant keywords

**Example pattern extraction:**
- User changes "Fix garage door" → "Ask Brianna to fix garage door"
- Learn: `{"match": "^Fix ", "transform": "Ask Brianna to fix {remainder}", "confidence": 1}`

### Step 3: Write updated patterns
Read current patterns.json, apply updates, write back.

## Execution

Now execute the triage workflow:
1. **Load patterns first** - Read `~/Projects/SuperThings/data/patterns.json`
2. **Fetch inbox** - Call `mcp__SuperThings__things_get_inbox` (server handles caching)
3. Apply learned patterns when generating suggestions
4. Show `[learned: Nx]` for pattern-based suggestions
5. After user confirms, log to history.jsonl and update patterns.json
6. Keep responses concise to save context
7. Launch parallel haiku agents for URL resolution
