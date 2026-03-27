---
name: brain-search
description: "Search Graph Brain by keyword or tags with multi-strategy fallback"
user_invocable: true
args: "<keyword or question>"
---

# Brain Search

ALL responses MUST be in Thai language.

## Steps

1. **Check connection** — if failed, inform user

2. **Multi-strategy search**
   - Primary: `mcp__graph-brain__search-knowledge` query="{keyword}" limit=10
   - If few results: `mcp__graph-brain__search-by-tags` with extracted tags
   - If still few: `mcp__graph-brain__find-similar` from closest match

3. **Load top results**
   - Call `mcp__graph-brain__get-knowledge` for top 3-5 matches

4. **Display results (Thai)**
   - Numbered list with title, description, tags
   - Brief summary of what was found
   - If nothing found → suggest `/brain-scan` or try different keywords
