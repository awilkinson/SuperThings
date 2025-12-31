---
name: superthings
description: Use when triaging Things inbox, creating tasks, or managing todos. Learns from corrections to improve title suggestions and project assignments over time.
---

# SuperThings - Intelligent Task Management

SuperThings learns from your corrections to get better at suggesting titles and projects for Things tasks.

## Learning System

### Pattern Storage
Learned patterns are stored in `~/Projects/SuperThings/data/patterns.json`:

```json
{
  "title_transforms": [
    {
      "match": "^Fix ",
      "transform": "Delegate to Brianna: {original}",
      "confidence": 12,
      "examples": ["Fix fireplace", "Fix garage door"]
    }
  ],
  "project_hints": {
    "build": {"Deep Work": 15, "Computer": 2},
    "research": {"Computer": 23, "Deep Work": 1},
    "call": {"Call": 18}
  },
  "exact_overrides": {}
}
```

### How to Use Learned Patterns

**Before triaging inbox**, load patterns:
```bash
cat ~/Projects/SuperThings/data/patterns.json
```

**When suggesting titles/projects:**
1. Check `exact_overrides` for exact title matches (highest priority)
2. Apply `title_transforms` if regex pattern matches
3. Extract keywords from title and check `project_hints` for weighted suggestions
4. Fall back to hardcoded defaults if no pattern matches

**Show learning indicator** when a suggestion comes from learned patterns:
```
"Fix dishwasher" → "Delegate to Brianna: Fix dishwasher" [learned: 12x]
```

### Logging Corrections

After user confirms/modifies suggestions, log to `~/Projects/SuperThings/data/history.jsonl`:

```json
{"ts": "2025-12-30T10:00:00Z", "original": "Fix fireplace", "suggested_title": "Delegate to Brianna: Fix fireplace", "final_title": "Delegate to Brianna: Fix fireplace", "suggested_project": "Computer", "final_project": "Computer", "title_accepted": true, "project_accepted": true}
```

### Updating Patterns

After logging, update `patterns.json`:

**If suggestion accepted:** Increment confidence
```json
// Before: "confidence": 12
// After:  "confidence": 13
```

**If title corrected:** Learn new transform pattern
- Extract the transformation (what changed?)
- Add new `title_transforms` entry or update existing
- Add example to `examples` array

**If project corrected:** Update project_hints
```json
// User changed "Build X" from Computer to Deep Work
"project_hints": {
  "build": {"Deep Work": 16, "Computer": 2}  // +1 to Deep Work
}
```

## Confidence Thresholds

- **confidence < 3**: Show suggestion, ask for confirmation
- **confidence >= 3**: Auto-apply but show `[learned: Nx]` indicator
- **confidence >= 10**: High confidence, apply silently

## Projects Reference

Current Things projects:
- `5LwYiPJAkWGSCMHML8xaXb` - Out and About
- `7n14Jusf7nCrLADfAANabW` - Kids/Activities
- `EZ5uJWRtcrvJ4U852NkNQ8` - Someday
- `Er67bc9YAur6ZeKTCBLC4c` - Call
- `LDhUsibk3dp2ZPioQySSiu` - Computer
- `NsSR9HR3pd2bVi2z4QHFfM` - Home
- `WamuBi2sFwbUwpXz9NZetP` - Deep Work

## Commands

This plugin provides these slash commands:
- `/thingsinbox` - Triage inbox with learning-based suggestions
- `/gtd` - Get Things Done workflow
