---
name: brain-explain
description: "Deep explanation of a system, feature, or workflow from brain knowledge + codebase if needed"
user_invocable: true
args: "<topic> — e.g., 'checker workflow', 'billing system', 'data import'"
---

# Brain Explain

ALL responses MUST be in Thai language.

## Difference from `/brain`
- `/brain` = quick answer, concise
- `/brain-explain` = deep analysis with diagrams, tables, code references, full context

## Steps

1. **Search brain extensively**
   - `mcp__graph-brain__search-knowledge` query="{topic}" limit=10
   - Load top 5 results with `get-knowledge`
   - Follow ALL `[[wiki links]]` to load connected notes (max 3 hops)
   - Use `mcp__graph-brain__explore-graph` for relationship discovery

2. **Evaluate completeness**
   - Complete → synthesize from brain only
   - Partial → supplement from codebase
   - Empty → full codebase analysis

3. **Read codebase if needed**
   - Use Explore agent for thorough investigation
   - Focus on gaps not covered by brain

4. **Present deep explanation (Thai)**
   Include ALL of these where relevant:
   - Overview summary
   - Flow diagram (text-based)
   - Role/page/action table
   - State machine / workflow transitions
   - Database tables involved
   - Code snippets for key logic
   - Source labels: `[Brain]` vs `[Code]`
   - Related topics to explore further

5. **Offer to save new findings**
   If codebase was read → offer `/brain-save`
