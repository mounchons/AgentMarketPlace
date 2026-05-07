# Local Testing Guide — ทดสอบ plugin ใน local ก่อน push/merge

> **Audience**: Plugin developers ที่ติดตั้ง plugins จาก `agent-marketplace` ผ่าน GitHub แล้วต้องการทดสอบการแก้ไข local ก่อน push
>
> **Concept**: Override Claude Code's plugin cache ด้วย **directory junction (symlink)** ชี้ไปที่ working tree ของ branch ที่กำลังพัฒนา — Claude Code จะโหลดจาก local แทน cache ของ marketplace

---

## ทำไมต้องทำแบบนี้

Claude Code โหลด plugins จาก **cache directory** ซึ่ง pull มาจาก GitHub ตอนติดตั้ง:

```
%USERPROFILE%\.claude\plugins\cache\agent-marketplace\<plugin>\<version>\
```

ถ้าคุณแก้ `plugins/<plugin>/...` ใน working tree ของ marketplace repo, Claude Code **จะไม่เห็น** การเปลี่ยนแปลงจนกว่าจะ:

1. Push ขึ้น GitHub
2. รัน `/plugin marketplace update agent-marketplace` (ดึง marketplace.json ใหม่)
3. รัน `/plugin update <plugin>@agent-marketplace` (ดึงไฟล์ plugin ใหม่)

วิธีนี้ทำให้ทดสอบช้า + ต้อง push code ที่ยังไม่ผ่าน test

**Local testing flow** ใช้ junction (Windows symlink) ทำให้ cache ชี้ตรงไปที่ working tree ของคุณ — restart Claude Code → เห็นการแก้ไขทันที

---

## Prerequisites

- Windows 10/11
- Claude Code ติดตั้งแล้ว
- Plugin ที่จะทดสอบ ติดตั้งจาก `agent-marketplace` แล้ว (เช่น `/plugin install system-design-doc@agent-marketplace`)
- Clone ของ `agent-marketplace` repo (เช่น `D:\GitHub\AgentMarketPlace`)
- Branch ที่มีการแก้ไข checkout อยู่ (เช่น `feature/sitemap-graph-vscode`)

---

## Quick Start (5 ขั้นตอน)

### 1. Link cache → working tree

ปิด Claude Code ทุก session แล้วเปิด **cmd.exe** (Command Prompt — ไม่ต้อง admin):

```cmd
cd D:\GitHub\AgentMarketPlace
tools\dev-link.bat system-design-doc
```

ผลลัพธ์: cache directory ของ `system-design-doc` กลายเป็น junction ชี้ไปที่ `plugins\system-design-doc\` ใน repo

> **เทียบกับ default plugin**: `tools\dev-link.bat` (ไม่ใส่อาร์กิวเมนต์) จะ link `system-design-doc` ให้

### 2. สร้าง folder ใหม่สำหรับโปรเจกต์ทดสอบ

```cmd
mkdir D:\GitHub\TestProject
cd D:\GitHub\TestProject
git init
```

> ทำไมต้อง folder ใหม่: เพื่อทดสอบ workflow แบบ end-to-end ตั้งแต่เริ่มต้น (ไม่ปนเปื้อนกับโปรเจกต์เดิม)

### 3. เริ่ม Claude Code session ใน folder ใหม่

```cmd
claude
```

จะเปิด Claude Code โดยมี plugin v2.0.0 (จาก local working tree) โหลดอยู่

### 4. ทดสอบคำสั่งจริง

ใน Claude Code session:

```
/help system-design-doc
```

ควรเห็น 8 คำสั่งใหม่ของ v2.0:

```
/sitemap-init        Initialize .design-docs/sitemap.json
/sitemap-add-node    Add node (page/api/mw/ext/master/template/nav/component)
/sitemap-link        Add edge between two nodes
/sitemap-scan        Auto-scan codebase to populate nodes
/sync-sitemap        Bidirectional sync md ↔ sitemap.json + pull downstream
/sitemap-validate    Run schema + R31-R35 validation
/sitemap-graph       Render Mermaid graph from edges
/sitemap-export      Export to Cytoscape / GraphML / DOT
```

**End-to-end test sequence** (ลอกตามได้):

```
/create-design-doc สร้างเอกสารสำหรับระบบจัดการสินค้าคงคลัง

# หลังเอกสารสร้างเสร็จ:
/sitemap-init

/sitemap-add-node master name="AdminLayout"
/sitemap-add-node template name="ListPage" uses_master="MP-001"
/sitemap-add-node component name="DataTable" category="data-display"

/sitemap-add-node page name="Inventory List" url="/inventory" access_level="User"
/sitemap-add-node api method=GET path="/api/inventory" controller="InventoryController.GetAll"
/sitemap-add-node middleware name="JwtAuth" type="auth" applies_to="all-api"

/sitemap-link from=P-001 to=API-001 type=calls
/sitemap-link from=API-001 to=MW-001 type=guarded-by
/sitemap-link from=P-001 to=MP-001 type=uses-master
/sitemap-link from=P-001 to=TPL-001 type=uses-template
/sitemap-link from=P-001 to=CMP-001 type=uses-component

/sitemap-validate
/sitemap-graph
/sync-sitemap
```

ดูผลลัพธ์ทีละข้อ ว่าตรงกับ spec ที่เขียนใน `.md` ไหม

### 5. หลัง test เสร็จ — unlink

ปิด Claude Code ทุก session แล้ว:

```cmd
cd D:\GitHub\AgentMarketPlace
tools\dev-unlink.bat system-design-doc
```

ผลลัพธ์: cache กลับสู่สถานะเดิม (เวอร์ชันที่ download มาจาก marketplace)

---

## คำสั่งทั้งหมด

### `dev-link.bat [plugin-name]`

| | |
|---|---|
| **Default** | `system-design-doc` |
| **ตัวอย่าง** | `tools\dev-link.bat ui-mockup` |
| **เงื่อนไข** | plugin ต้องติดตั้งจาก `agent-marketplace` แล้ว |
| **Side effect** | rename `<version>` → `<version>-dev-backup`, create junction `<version>` → `plugins\<plugin>` |
| **Idempotent** | ใช่ — ถ้า link อยู่แล้ว จะแจ้งและไม่ทำอะไรเพิ่ม |

### `dev-unlink.bat [plugin-name]`

| | |
|---|---|
| **Default** | `system-design-doc` |
| **ตัวอย่าง** | `tools\dev-unlink.bat ui-mockup` |
| **Safety** | ตรวจว่า cache dir เป็น junction จริงก่อนลบ — ถ้าเป็น real directory จะ abort เพื่อป้องกัน data loss |
| **Side effect** | remove junction, rename `<version>-dev-backup` → `<version>` |

---

## Troubleshooting

### `mklink` failed — "Access is denied"

```
mklink /J ใช้ได้โดยไม่ต้อง admin บน Windows 10/11
```

ถ้ายัง fail:
- ตรวจว่า `Developer Mode` เปิดอยู่ (Settings → For developers → Developer Mode)
- หรือเปิด cmd แบบ admin
- หรือลบ folder antivirus quarantine (Windows Defender บางครั้งบล็อก mklink)

### `Could not rename` ตอน dev-link

Claude Code session ยังเปิดอยู่ — ปิดทุก session แล้วลองใหม่

### คำสั่งใหม่ไม่ขึ้นใน `/help`

1. ตรวจ junction มีจริง: `dir %USERPROFILE%\.claude\plugins\cache\agent-marketplace\system-design-doc\` — เห็น `<JUNCTION>` หรือ `<SYMLINKD>`
2. ตรวจ junction ชี้ถูก: `dir <junction-path>` — เห็นไฟล์จาก local repo
3. **ปิด Claude Code ทุก session** แล้วเปิดใหม่ — Claude Code โหลด plugin ตอน start
4. ตรวจ branch ที่ checkout ใน repo: `cd D:\GitHub\AgentMarketPlace; git branch --show-current`

### `dev-unlink.bat` รายงาน "is NOT a junction"

หมายถึง dir ไม่ใช่ junction — อาจเกิดจาก:
- คุณติดตั้ง plugin ใหม่ทับ junction ไปแล้ว
- หรือ run `/plugin update` ระหว่าง dev-link ทำให้ junction ถูกแทนที่ด้วย real dir

วิธีแก้: backup dir อาจอยู่ปลอดภัย — copy ออกมาเอง แล้วลบ real dir แล้วเอา backup คืน

### ต้องการ link หลาย plugins พร้อมกัน

รัน `dev-link.bat` ทีละ plugin:
```cmd
tools\dev-link.bat system-design-doc
tools\dev-link.bat ui-mockup
tools\dev-link.bat long-running
```

แต่ละ plugin มี backup ของตัวเอง — `dev-unlink` ทีละตัวเช่นกัน

---

## Workflow แนะนำสำหรับการพัฒนา plugin

```
1. git checkout -b feature/<my-feature>
2. แก้ไข plugins/<plugin>/...
3. tools\dev-link.bat <plugin>
4. (ปิด Claude Code, เปิดใหม่ใน test folder)
5. ทดสอบคำสั่งจริง — แก้ไข code ใน plugin ตามต้องการ
   (Claude Code อ่าน junction → เห็นการแก้ไขทันทีเมื่อเริ่ม session ใหม่)
6. tools\dev-unlink.bat <plugin>
7. git commit + git push
8. Update marketplace.json (version bump) — push
9. ใน production: /plugin marketplace update agent-marketplace; /plugin update <plugin>
```

> **Tip**: ถ้าแก้ค่อนข้างเยอะ ทำ commit สำเร็จเป็นช่วงๆ — ระหว่าง dev-link อยู่ commit ปกติได้ เพราะ junction ไม่กระทบ git

---

## Architecture Reference

```
%USERPROFILE%\.claude\plugins\
├── known_marketplaces.json          # ลงทะเบียน marketplace (github source)
├── installed_plugins.json           # plugin ติดตั้ง + version + path
├── marketplaces\
│   └── agent-marketplace\           # marketplace registry clone (.claude-plugin\marketplace.json)
└── cache\
    └── agent-marketplace\
        ├── system-design-doc\
        │   ├── 1.6.0\                  # ← ปกติ Claude Code โหลดจากนี่
        │   └── 1.6.0-dev-backup\       # ← backup ของ dev-link
        │   └── 1.6.0  ── (junction) ── D:\GitHub\AgentMarketPlace\plugins\system-design-doc\
        └── ui-mockup\
            └── ...
```

`installed_plugins.json` ระบุ `installPath` ของแต่ละ plugin — Claude Code ตามมัน. junction ทำให้ path เดิม "ชี้" ไปที่ local repo โดยที่ Claude Code ไม่รู้สึกตัว

---

## ดูเพิ่ม

- `tools/dev-link.bat`, `tools/dev-unlink.bat` — script ตัวจริง
- `CREATE-MARKETPLACE-GUIDE.md` — วิธีสร้าง marketplace ตั้งแต่เริ่ม
- Microsoft docs: [`mklink`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/mklink), [Directory Junction concept](https://learn.microsoft.com/en-us/sysinternals/downloads/junction)
