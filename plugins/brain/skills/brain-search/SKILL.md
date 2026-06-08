---
name: brain-search
description: "Search Graph Brain by keyword or tags with multi-strategy fallback and graph traversal"
user_invocable: true
args: "<keyword or question>"
---

# Brain Search

ALL responses MUST be in Thai language.

**Graph Protocol:** Follow Search Rules in `GRAPH_PROTOCOL.md`.

## Steps

1. **Check connection** — if failed, inform user

2. **Multi-strategy search** (4 ขั้น ตาม Graph Protocol)
   - Step 1 — Text: `mcp__graph-brain__search-knowledge` query="{keyword}" limit=10
   - Step 2 — Tags: `mcp__graph-brain__search-by-tags` with extracted tags (if Step 1 < 3 results)
   - Step 3 — Graph Traversal (NEW): `mcp__graph-brain__explore-graph` nodeId="{best-result-id}" depth=2
     - Traverse from the most relevant result found so far
     - Collect connected nodes that match the search context
     - This finds knowledge linked by relationships, not just text match
   - Step 4 — Similar: `mcp__graph-brain__find-similar` from closest match (last resort)

3. **Load top results**
   - Call `mcp__graph-brain__get-knowledge` for top 3-5 matches
   - For each result, note its relationships (from explore-graph data if available)

4. **Display results (Thai)**
   - Numbered list with:
     - Title, description, tags
     - Project name
     - Relationships: "→ เชื่อมกับ {N} notes, {M} tags"
     - Version info: "v{N} (อัพเดทล่าสุด {date})" if Version History section exists
   - Brief summary of what was found
   - If nothing found → suggest `/brain-scan` or try different keywords

5. **Offer next actions**
   - "พิมพ์เลขเพื่อดูรายละเอียด หรือ:"
   - `/brain-explore {title}` — เดินตาม graph ดู connections
   - `/brain-history {title}` — ดูประวัติเปลี่ยนแปลง
   - `/brain-explain {title}` — อธิบายแบบละเอียด
