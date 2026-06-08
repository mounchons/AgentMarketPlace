---
name: brain-explain
description: "Deep explanation of a system, feature, or workflow from brain knowledge + codebase if needed"
user_invocable: true
args: "<topic> — e.g., 'checker workflow', 'billing system', 'data import'"
---

# Brain Explain

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow Search Rules in `GRAPH_PROTOCOL.md`.

## Difference from `/brain`
- `/brain` = quick answer, concise
- `/brain-explain` = deep analysis with diagrams, tables, code references, full context

## Steps

1. **Search brain extensively**
   - `mcp__graph-brain__search-knowledge` query="{topic}" limit=10
   - Load top 5 results with `get-knowledge`
   - Follow ALL `[[wiki links]]` to load connected notes (max 3 hops)
   - Use `mcp__graph-brain__explore-graph` for relationship discovery

2. **Build relationship map** (NEW)
   - For each loaded note, call `mcp__graph-brain__explore-graph` nodeId="{id}" depth=1
   - Build a visual relationship map:
     ```
     🗺️ Relationship Map:
     [{Main Topic}]
       →[LINKS_TO]→ [{Related Note 1}]
       →[LINKS_TO]→ [{Related Note 2}]
         →[LINKS_TO]→ [{Sub-Related Note}]
       →[TAGGED]→ #{tag-1}, #{tag-2}
     ```
   - Identify cross-project connections if notes link to other projects

3. **Check version history** (NEW)
   - For each key note, check if Version History section exists
   - If found, display brief version summary:
     ```
     📜 Version History:
       v3 (current) — เพิ่ม MFA
       v2 — เพิ่ม OAuth2
       → /brain-history {topic} เพื่อดูรายละเอียด
     ```

4. **Evaluate completeness**
   - Complete → synthesize from brain only
   - Partial → supplement from codebase
   - Empty → full codebase analysis

5. **Read codebase if needed**
   - Use Explore agent for thorough investigation
   - Focus on gaps not covered by brain

6. **Present deep explanation (Thai)**
   Include ALL of these where relevant:
   - Overview summary
   - Relationship map (from Step 2)
   - Version history summary (from Step 3)
   - Flow diagram (text-based)
   - Role/page/action table
   - State machine / workflow transitions
   - Database tables involved
   - Code snippets for key logic
   - Cross-project context (if notes link to other projects)
   - Source labels: `[Brain]` vs `[Code]`
   - Related topics to explore further

7. **Offer to save new findings**
   If codebase was read → offer `/brain-save`
