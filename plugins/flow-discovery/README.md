# Flow Discovery Plugin

วิเคราะห์ระบบเพื่อค้นหา workflow, scenario, edge case ที่ถูกมองข้าม

## จุดยืน

**"คิด"** — เป็นตัวเชื่อมระหว่าง code/idea กับ scenarios/gaps ที่ยังไม่ถูกค้นพบ

## Commands

| Command | หน้าที่ | ต้องมี code? |
|---------|---------|:-----------:|
| `/flow-discovery` | เลือก mode + แนะนำการใช้งาน | - |
| `/flow-scan` | Full Scan ทั้ง project | ✅ |
| `/flow-dive [feature]` | Deep Dive เจาะลึก module | ✅ |
| `/flow-think [topic]` | Quick Think จากคำอธิบาย | ❌ |
| `/flow-ideate [idea]` | คิด workflow จากไอเดีย | ❌ |
| `/flow-persona [feature]` | สร้าง personas + journey | ❌ |
| `/flow-research [topic]` | ค้นหา internet | ❌ |
| `/flow-export [format]` | สร้างเอกสารสำหรับทีม | ❌ |
| `/flow-status` | ดูสถานะ findings | ❌ |
| `/flow-help` | อธิบายวิธีใช้งาน | ❌ |

## Integration

```
flow-discovery (คิด)
├──→ qa-ui-test        : scenarios → /qa-create-scenario
├──→ system-design-doc : findings  → /edit-section, /brainstorm-design
├──→ ui-mockup         : UX issues → ปรับ mockup
└──→ long-running      : features  → /add-feature
```

## วิธีใช้งาน

```bash
# ระบบที่มีอยู่แล้ว — สแกนหา gaps
/flow-scan

# ระบบที่มีอยู่แล้ว — เจาะลึกเฉพาะ feature
/flow-dive checkout

# ยังไม่ได้พัฒนา — คิด workflow จากไอเดีย
/flow-ideate "ระบบจองห้องประชุมออนไลน์"

# คิดเร็วๆ จากคำอธิบาย
/flow-think "ระบบอนุมัติใบลา"
```
