# คู่มือเริ่มต้นใช้งาน Long-Running Agent กับ Claude Code CLI

## 📋 ตอบคำถามที่ 1: ไฟล์อะไรต้อง copy, อะไร generate

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED ARTIFACTS                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📁 ต้อง COPY (Template เตรียมไว้ก่อน)                               │
│  ├── INITIALIZER_PROMPT.md    ← prompt สำหรับ init                  │
│  └── CODING_AGENT_PROMPT.md   ← prompt สำหรับ coding                │
│                                                                     │
│  🤖 GENERATE โดย Initializer Agent (สร้างอัตโนมัติ)                  │
│  ├── feature_list.json        ← รายการ features                    │
│  ├── claude-progress.txt      ← บันทึกความคืบหน้า                   │
│  ├── init.sh                  ← script setup                       │
│  └── README.md                ← คำอธิบายโปรเจค                      │
│                                                                     │
│  📝 UPDATE โดย Coding Agent (แก้ไขทุก session)                      │
│  ├── feature_list.json        ← mark passes = true                 │
│  ├── claude-progress.txt      ← เพิ่ม session log                  │
│  └── Git commits              ← บันทึกการเปลี่ยนแปลง                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 ตอบคำถามที่ 2 & 3: ขั้นตอนการใช้งานจริง

### Phase 1: เตรียม Project Folder

```bash
# Step 1: สร้าง folder โปรเจคใหม่
mkdir my-todo-api
cd my-todo-api

# Step 2: Copy template prompts (ถ้ามี)
# หรือจะให้ Claude สร้างให้ก็ได้
```

### Phase 2: เปิด Claude Code CLI และ Initialize

```bash
# Step 3: เปิด Claude Code CLI
claude

# Step 4: สั่ง Initialize Project
# พิมพ์คำสั่งนี้ใน Claude Code:
```

**คำสั่งสำหรับ Initializer Agent:**

```
ช่วยสร้าง Long-Running Agent environment สำหรับโปรเจค "Todo API" 

Requirements:
- ASP.NET Core Web API
- Entity Framework Core + SQLite
- CRUD operations สำหรับ Todo items
- Input validation
- Swagger documentation

สร้างไฟล์เหล่านี้:
1. feature_list.json - รายการ features ทั้งหมด (passes: false)
2. claude-progress.txt - บันทึก session แรก
3. init.sh - script สำหรับ setup environment
4. README.md - คำอธิบายโปรเจค
5. .claude/prompts/coding-agent.md - prompt สำหรับ session ถัดไป

กฎสำคัญ:
- อย่า implement code จริง ให้แค่วาง structure
- features ต้องเล็กพอทำเสร็จใน 1 session
- ใช้ JSON format สำหรับ feature list
```

### Phase 3: Coding Agent Sessions

**เมื่อเริ่ม session ใหม่ (ทุกครั้งหลัง initialize):**

```
ทำหน้าที่ Coding Agent สำหรับโปรเจคนี้

ขั้นตอน:
1. อ่าน claude-progress.txt เพื่อดู context
2. ดู git log -5 
3. รัน bash init.sh (ถ้ามี project แล้ว)
4. ดู feature_list.json หา feature ที่ passes=false
5. เลือก feature ที่ priority สูงสุด ทำทีละ 1 อัน
6. Implement และ TEST จริงก่อน mark pass
7. Commit changes
8. Update claude-progress.txt

กฎสำคัญ:
- ทำทีละ 1 feature เท่านั้น!
- ห้าม mark pass โดยไม่ test!
- ต้อง commit และ update progress ก่อนจบ
```

---

## 🎯 ขั้นตอนแบบ Step-by-Step

```
┌─────────────────────────────────────────────────────────────────────┐
│                 WORKFLOW: เริ่มโปรเจคใหม่                            │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║  STEP 1: สร้าง Folder และเปิด Claude Code                         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Terminal:                                                        ║
║  $ mkdir my-project && cd my-project                              ║
║  $ claude                                                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
                              │
                              ▼
╔═══════════════════════════════════════════════════════════════════╗
║  STEP 2: Initialize (ครั้งแรกเท่านั้น)                             ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Claude Code:                                                     ║
║  > สร้าง Long-Running Agent environment สำหรับ [อธิบาย project]    ║
║    สร้าง feature_list.json, claude-progress.txt, init.sh          ║
║                                                                   ║
║  ผลลัพธ์:                                                         ║
║  ├── feature_list.json    (10-20 features, passes=false)          ║
║  ├── claude-progress.txt  (Session 1 log)                         ║
║  ├── init.sh              (setup script)                          ║
║  └── README.md                                                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
                              │
                              ▼
╔═══════════════════════════════════════════════════════════════════╗
║  STEP 3: Coding Session (ทำซ้ำจนเสร็จ)                             ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Claude Code:                                                     ║
║  > ทำหน้าที่ Coding Agent                                         ║
║    1. อ่าน progress และ git log                                   ║
║    2. รัน init.sh                                                 ║
║    3. ทำ feature ถัดไปที่ยังไม่ pass                               ║
║    4. Test, commit, update progress                               ║
║                                                                   ║
║  หรือสั้นๆ:                                                       ║
║  > continue - ทำ feature ถัดไป                                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
                              │
                              ▼
╔═══════════════════════════════════════════════════════════════════╗
║  STEP 4: ทำซ้ำ Step 3 จนทุก feature pass                          ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Session 2: Feature #1 ✅                                         ║
║  Session 3: Feature #2 ✅                                         ║
║  Session 4: Feature #3 ✅                                         ║
║  ...                                                              ║
║  Session N: Feature #10 ✅ → โปรเจคเสร็จ!                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 💡 Pro Tips: Custom Commands

สร้างไฟล์ `.claude/commands/` สำหรับคำสั่งที่ใช้บ่อย:

```bash
# สร้าง folder สำหรับ custom commands
mkdir -p .claude/commands
```

**ไฟล์ `.claude/commands/init-agent.md`:**
```markdown
สร้าง Long-Running Agent environment สำหรับโปรเจคนี้

สร้างไฟล์:
1. feature_list.json - รายการ features (passes: false ทั้งหมด)
2. claude-progress.txt - Session 1 log
3. init.sh - setup script
4. README.md

อย่า implement code จริง แค่วาง structure
```

**ไฟล์ `.claude/commands/continue.md`:**
```markdown
ทำหน้าที่ Coding Agent:

1. cat claude-progress.txt
2. git log --oneline -5
3. bash init.sh (ถ้า project มีอยู่แล้ว)
4. ดู feature_list.json หา passes=false
5. ทำ 1 feature ที่ priority สูงสุด
6. TEST ก่อน mark pass
7. git commit
8. Update claude-progress.txt

ทำทีละ 1 feature เท่านั้น!
```

**วิธีใช้:**
```
Claude Code:
> /init-agent      ← ครั้งแรก
> /continue        ← ทุกครั้งถัดไป
```

---

## 📁 โครงสร้าง Folder หลัง Initialize

```
my-project/
├── .claude/
│   └── commands/
│       ├── init-agent.md      ← custom command
│       └── continue.md        ← custom command
├── .git/                      ← git repo
├── feature_list.json          ← รายการ features
├── claude-progress.txt        ← บันทึกความคืบหน้า
├── init.sh                    ← setup script
├── README.md                  ← คำอธิบาย
└── src/                       ← source code (สร้างทีหลัง)
    └── ...
```

---

## 🔄 สรุป Flow การใช้งาน

| ครั้งที่ | คำสั่ง | สิ่งที่เกิดขึ้น |
|---------|--------|----------------|
| 1 (ครั้งแรก) | `/init-agent` หรือพิมพ์เอง | สร้าง feature_list.json, progress.txt, init.sh |
| 2+ (ทุกครั้งถัดไป) | `/continue` หรือพิมพ์เอง | ทำ feature ถัดไป, test, commit, update progress |

ต้องการให้ช่วยสร้าง custom commands เหล่านี้ให้เลยไหมครับ? หรือมีคำถามเพิ่มเติม?