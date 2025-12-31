# GTD - Get Things Done

Find actionable tasks in Computer and Deep Work projects that Claude can help with, then execute them.

## Workflow

1. **Fetch tasks** from both projects:
   - 💻 Computer: `mcp__things-mcp__things_get_project` with project_id `LDhUsibk3dp2ZPioQySSiu`
   - ⏳ Deep Work: `mcp__things-mcp__things_get_project` with project_id `WamuBi2sFwbUwpXz9NZetP`

2. **Categorize tasks** by what Claude can help with:

   | Category | Pattern | Action |
   |----------|---------|--------|
   | **Research** | "Research X", "Find X", "Look up X", "Check out X" | Tavily search + Firecrawl deep dive |
   | **Email** | "Email X", "Send X email", "Reply to X" | Draft email, send via Zapier |
   | **Intro** | "Intro X to Y", "Connect X with Y", "Introduce X" | Search Gmail for context, draft intro |
   | **Writing** | "Draft X", "Write X", "Finish X blog post" | Help draft/outline |
   | **Not helpable** | Physical tasks, calls, meetings | Skip |

3. **Present summary**:
   ```
   GTD Review: [count] tasks in Computer + Deep Work

   Research Tasks ([count]) - can research now
   Email Tasks ([count]) - can draft + send via Zapier
   Intro Tasks ([count]) - can draft intro emails
   Writing Tasks ([count]) - can help draft

   Ready to work. Which category? (research/email/intro/all)
   ```

4. **On user selection**, launch agents in **BATCHES OF 8 MAX** to avoid rate limits

## Research Task Workflow

### Phase 1: Batched Research (PREVENTS RATE LIMITS)

For research tasks, run in batches to avoid API rate limiting:

1. **Batch size**: Maximum 8 parallel agents at a time
2. **Wait for completion**: Ensure batch completes before launching next
3. **Retry failures**: Any rate-limited tasks get retried in the next batch
4. **Use haiku model**: Faster and cheaper for research tasks

Example batching:
- 32 research tasks = 4 batches of 8
- Launch batch 1 (8 agents) → wait → launch batch 2 → etc.

### Phase 2: Full Research Presentation

For each research task, present **FULL findings** (not summarized):

```
## Task: [Task Title]
ID: [Things ID]

### Key Findings
[Comprehensive findings - multiple paragraphs if needed]

### Sources
- [Source 1 with URL]
- [Source 2 with URL]

### Recommended Action
[What the user should do next based on research]

---
```

### Phase 3: User Decision (Per Task)

After presenting all research, user decides for each task:

| Decision | Action |
|----------|--------|
| **Complete** | Mark done in Things (research answered the question fully) |
| **Keep** (DEFAULT) | Leave in Things, update notes with research findings |
| **Skip** | Leave unchanged (no notes update) |

**DEFAULT BEHAVIOR**: If user doesn't specify anything for a task, treat as "Keep" - leave in Things and update notes with findings.

User response format examples:
- "Complete: 1, 3, 5" → Mark those complete
- "Skip: 7" → Leave #7 unchanged
- "All complete except 2, 4" → Complete all, keep 2 and 4 with notes
- (No response for a task) → Keep with notes (default)

### Phase 4: Execute Decisions

1. **Complete tasks**: Mark as complete in Things
2. **Keep tasks**: Update Things notes with research findings (this is the default)
3. **Skip tasks**: Leave unchanged

## Email/Intro Task Workflow

For email and intro tasks:

1. **Search Gmail via Zapier** for person context:
   - Search for each person's name mentioned in task
   - Extract: who they are, company, relationship context

2. **Draft email**:
   - For intros:
     ```
     Subject: Introduction: [Person A] <> [Person B]

     Hi [Recipient],

     I wanted to introduce you to [Person] [context from Gmail].

     [Person], meet [Recipient] [context].

     I'll let you two take it from here.

     Best,
     Andrew
     ```
   - For regular emails: Draft based on task context

3. **Present draft**: "Here's the email. Send/Edit/Skip?"

4. **On "Send"**: Use Zapier MCP to send via Gmail

5. **On success**: Mark Things task complete

## Parallel Execution Rules

**IMPORTANT: Rate Limit Prevention**

- **NEVER** launch more than 8 parallel agents at once
- Wait for each batch to complete before launching next
- If any agents hit rate limits (429 errors), retry them in the next batch
- Prefer haiku model for research tasks (faster, less likely to rate limit)

Batch execution pattern:
```
Batch 1: [task 1-8] → wait for all → check for failures
Batch 2: [task 9-16 + any retries] → wait → check
Batch 3: [remaining tasks + retries] → etc.
```

## Project IDs Reference
- 💻 Computer: `LDhUsibk3dp2ZPioQySSiu`
- ⏳ Deep Work: `WamuBi2sFwbUwpXz9NZetP`

## Execution

Now execute the GTD workflow. Start by fetching tasks from both projects.
