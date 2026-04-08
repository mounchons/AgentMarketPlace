---
name: bigbrain-search
description: "Search BigBrain Graphiti graph — nodes (entities), facts (relationships), and episodes with multi-strategy fallback"
user_invocable: true
args: "<keyword or question>"
---

# BigBrain Search

ALL responses MUST be in Thai language.

**Graphiti Protocol:** Follow Search Strategy in `GRAPHITI_PROTOCOL.md`.

## Steps

1. **Multi-strategy search** (3 ขั้น ตาม Graphiti Protocol)

   **Step 1 — Search Nodes** (entities):
   - Call `mcp__big-brain__search_memory_nodes` query="{keyword}" group_ids=["bigbrain"] max_nodes=10
   - ถ้าพบ >= 3 nodes ที่ตรงกับ query → แสดงผลเลย

   **Step 2 — Search Facts** (relationships):
   - Call `mcp__big-brain__search_memory_facts` query="{keyword}" group_ids=["bigbrain"] max_facts=10
   - เสริม context จาก facts ที่เกี่ยวข้อง

   **Step 3 — Center Node Deep Search** (ถ้ามี node UUID):
   - Pick most relevant node UUID from Step 1
   - Call `mcp__big-brain__search_memory_facts` query="{related aspect}" center_node_uuid="{uuid}" max_facts=10
   - ค้นหา facts รอบ entity ที่เจอ → ได้ relationships ลึกขึ้น

   **Step 4 — Get Episodes** (last resort):
   - Call `mcp__big-brain__get_episodes` group_id="bigbrain" last_n=10
   - ดูเนื้อหาดิบล่าสุด ถ้า nodes/facts ไม่พอ

2. **Display results (Thai)**

   **Nodes Found:**
   ```
   🔵 Entities ({N} found):
   ─────────────────────────────────
   [1] 🔵 {Node Name}
       Summary: {summary preview...}
       UUID: {uuid}

   [2] 🔵 {Node Name}
       Summary: {summary preview...}
       UUID: {uuid}
   ```

   **Facts Found:**
   ```
   🔗 Facts ({M} found):
   ─────────────────────────────────
   • {Source} →[{relation}]→ {Target}
     "{fact text}"
     Valid: {date} | Created: {date}

   • {Source} →[{relation}]→ {Target}
     "{fact text}"
   ```

   **Summary:**
   ```
   📊 สรุป: พบ {N} entities, {M} facts
   🧠 Key Insights: {brief summary of what the graph tells us}
   ```

3. **Offer next actions**
   ```
   💡 ลองต่อ:
   /bigbrain-explore {entity name} — เดินตาม graph ดู connections
   /bigbrain {topic} — ถามแบบ Brain First (graph + codebase)
   /bigbrain-save — บันทึกข้อมูลใหม่เข้า graph
   ```

4. **If nothing found**
   ```
   🔍 ไม่พบข้อมูลใน BigBrain graph
   💡 ลอง:
   • /bigbrain-save {topic} — เพิ่มข้อมูลเข้า graph
   • /bigbrain {topic} — ค้นหาจาก graph + codebase พร้อมกัน
   • ตรวจสอบ keyword อื่น หรือใช้คำกว้างขึ้น
   ```
