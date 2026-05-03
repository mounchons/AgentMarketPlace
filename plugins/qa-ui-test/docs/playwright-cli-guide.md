# คู่มือการใช้งาน Playwright CLI + QA Plugin

> เอกสารนี้รวม **Playwright CLI** (built-in tools ของ Microsoft) เข้ากับ **qa-ui-test plugin commands**
> เพื่อให้ทั้ง human และ AI agent ทำงานร่วมกันได้อย่างราบรื่น

---

## สารบัญ

1. [แนวคิด: ทำไมต้องเรียนรู้ทั้ง 2 อย่าง](#1-แนวคิด)
2. [Playwright CLI Cheat Sheet](#2-playwright-cli-cheat-sheet)
3. [การเห็นหน้าจอระหว่างรันทดสอบ (4 วิธี)](#3-การเห็นหน้าจอระหว่างรันทดสอบ)
4. [การดู List ทดสอบของแต่ละหน้า](#4-การดู-list-ทดสอบของแต่ละหน้า)
5. [การเพิ่ม/แก้ไข Test Case ผ่าน QA Plugin](#5-การเพิ่มแก้ไข-test-case)
6. [Workflow ผสม: QA Plugin + Playwright CLI](#6-workflow-ผสม)
7. [Persona Guide: เลือกแนวทางที่เหมาะกับคุณ](#7-persona-guide)
8. [FAQ + Troubleshooting](#8-faq--troubleshooting)

---

## 1. แนวคิด

qa-ui-test plugin **ไม่ได้แทนที่ Playwright CLI** — มันทำงานร่วมกัน:

| Layer | เครื่องมือ | หน้าที่ |
|---|---|---|
| **Scenario authoring** | `/qa-create-scenario`, `/qa-edit-scenario` | คิด/บอกเคสด้วยภาษาธรรมชาติ → JSON |
| **Script generation** | `/qa-continue` | AI แปลง scenario → Playwright code |
| **Test execution** | `/qa-run`, **Playwright CLI** | รัน test จริง |
| **Debug / observe** | **Playwright CLI** (`--ui`, `--headed`, `--debug`) | ดูหน้าจอ, time-travel, fix เคส |
| **Bug management** | `/qa-bug-triage`, `/qa-bug-export` | failed → bug → dev fix |

**กฎง่ายๆ:**
- ต้องการ **คิด/แก้เคส** → ใช้ qa command
- ต้องการ **เห็นหน้าจอ/debug** → ใช้ Playwright CLI โดยตรง
- ต้องการ **รัน + track สถานะ** → ใช้ qa command (จะ update qa-tracker.json ให้)

---

## 2. Playwright CLI Cheat Sheet

### 2.1 รันเทส (Execution)

```bash
# โหมดมาตรฐาน (headless, เร็ว, สำหรับ CI)
npx playwright test

# เห็นเบราว์เซอร์จริง (สำหรับดูด้วยตา)
npx playwright test --headed

# ช้าลงทุก action เพื่อให้ดูง่าย (1000ms = 1 วินาที)
npx playwright test --headed --slow-mo=1000

# UI Mode — interactive (แนะนำสำหรับ debug + author)
npx playwright test --ui

# Debug mode — step-by-step ผ่าน Playwright Inspector
npx playwright test --debug
```

### 2.2 Filter (รันเฉพาะที่ต้องการ)

```bash
# ตามไฟล์
npx playwright test tests/TS-LOGIN-001.spec.ts

# ตามชื่อเคส (regex)
npx playwright test --grep "TS-LOGIN-001"

# ยกเว้น tag
npx playwright test --grep-invert "@slow"

# ตาม browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Parallel workers
npx playwright test --workers=4

# รันซ้ำเพื่อหา flaky test
npx playwright test --repeat-each=10

# รันเฉพาะที่ fail ครั้งล่าสุด
npx playwright test --last-failed
```

### 2.3 บันทึก/ดูผล (Reporting)

```bash
# List เคสทั้งหมด
npx playwright test --list

# เปิด HTML report ครั้งล่าสุด
npx playwright show-report

# เปิด trace (ดู replay ทีละ step)
npx playwright show-trace test-results/.../trace.zip

# Force record trace ทุกครั้ง
npx playwright test --trace on
```

### 2.4 Codegen (บันทึก action → generate code)

```bash
# เปิดเบราว์เซอร์ → คลิก/พิมพ์ → ได้โค้ด Playwright
npx playwright codegen http://localhost:3000

# Codegen ที่จำ login state ไว้
npx playwright codegen --load-storage=auth.json http://localhost:3000

# Codegen ใส่ภาษา
npx playwright codegen --target=javascript http://localhost:3000
```

---

## 3. การเห็นหน้าจอระหว่างรันทดสอบ

มี **4 วิธี** เลือกตามความต้องการ:

### 3.1 `--headed` Flag (เห็น browser จริงๆ)

```bash
npx playwright test --headed
npx playwright test --headed --slow-mo=500
```

✅ เห็น browser เปิดมาจริง click/type ตามที่เขียน
✅ เหมาะตอนต้องการให้ stakeholder ดูสาธิต
❌ ช้ากว่า headless 3-5 เท่า ไม่เหมาะ run ทั้งชุด

### 3.2 `--ui` Mode ⭐ (แนะนำที่สุด)

```bash
npx playwright test --ui
```

✅ **Time-travel** — เห็น DOM snapshot ก่อน/หลังทุก step
✅ Locator highlighted, Network tab, Console tab, Errors panel
✅ **Watch mode** — แก้โค้ด → auto re-run ทันที
✅ เลือกรันเฉพาะเคส, เฉพาะไฟล์, เฉพาะ project

### 3.3 `--debug` (Playwright Inspector)

```bash
npx playwright test --debug
npx playwright test --debug tests/TS-LOGIN-001.spec.ts
```

✅ Pause ทีละ step, step-through manual
✅ Pick locator แบบสด → copy ไปใส่โค้ด
✅ เห็น "expected vs actual" เมื่อ assertion fail

### 3.4 Video Recording (ดูย้อนหลัง)

แก้ใน `playwright.config.ts`:

```typescript
use: {
  video: 'on',                  // record ทุกครั้ง
  // หรือ
  video: 'on-first-retry',      // ค่า default ของ qa-ui-test plugin
  // หรือ
  video: 'retain-on-failure',   // เก็บเฉพาะที่ fail
}
```

แล้วเปิดดูจาก HTML report → mp4 file

### เปรียบเทียบ 4 วิธี

| วิธี | เหมาะกับ | ความเร็ว | Interactive |
|---|---|---|---|
| `--headed` | สาธิต, demo | 🐌 ช้า | ❌ |
| `--ui` ⭐ | Debug + Author | 🐢 ปานกลาง | ✅ |
| `--debug` | Step-through | 🐌 ช้ามาก | ✅ |
| Video | Audit, Review | 🚀 เร็ว (record อย่างเดียว) | ❌ |

---

## 4. การดู List ทดสอบของแต่ละหน้า

มี **4 แบบ** เลือกตาม context:

### 4.1 CLI Listing (text-based, เร็วที่สุด)

```bash
# List ทั้งหมด
npx playwright test --list

# Filter ตาม keyword
npx playwright test --list --grep "LOGIN"

# Filter ตามไฟล์
npx playwright test --list tests/auth/
```

ผลลัพธ์:
```
Listing tests:
  tests/TS-LOGIN-001.spec.ts:5 › ผู้ใช้เข้าสู่ระบบสำเร็จ
  tests/TS-LOGIN-002.spec.ts:5 › รหัสผ่านผิด → error message
  tests/TS-REGISTER-001.spec.ts:5 › สมัครสมาชิกใหม่
```

### 4.2 UI Mode Sidebar (visual tree)

```bash
npx playwright test --ui
```

ซ้ายมือเป็น tree view: **ไฟล์ → describe block → test**
- เห็นจำนวนเคสต่อไฟล์
- กดเลือกเคสได้ทันที
- Filter ด้วย search bar

### 4.3 HTML Report

```bash
npx playwright show-report
```

จัดกลุ่มตามไฟล์ + แสดง pass/fail/duration/flaky

### 4.4 qa-tracker.json (ของ plugin) ⭐

```bash
/qa-status                    # สรุปทั้งหมด
/qa-status --module LOGIN     # เฉพาะ module
/qa-status --failed           # เฉพาะที่ fail
/qa-status --bugs             # ดู bug summary

# หรือ explain แบบ flowchart
/qa-explain
/qa-explain --module CHECKOUT --save
```

✅ **ดีกว่า Playwright list** เพราะ:
- จัดกลุ่มตาม **module → page → scenario**
- เห็น status (pending / running / passed / failed)
- เห็น linked bugs ทันที
- เห็นเคสที่**ยังไม่ได้สร้าง script** (Playwright list เห็นแค่ที่มี script แล้ว)

---

## 5. การเพิ่ม/แก้ไข Test Case

นี่คือ **จุดแข็งหลัก** ของ qa-ui-test plugin — บอกด้วยภาษาธรรมชาติ AI สร้างให้

### 5.1 Auto-scan ทั้ง project (เร็วที่สุด)

```
/qa-create-scenario --auto
```

AI จะ:
1. สแกน Controllers/Pages/Routes ทั้ง codebase
2. หา `[Authorize]` → roles, หา SeedData → credentials
3. สร้าง scenarios ครบทุกหน้า → `qa-tracker.json`
4. Cascade dependencies (parent-child relationship)

ผลลัพธ์: เช่น 156 scenarios พร้อม test (status=pending)

### 5.2 Manual mode (brainstorm ทีละหน้า)

```
/qa-create-scenario http://localhost:3000/checkout
```

AI จะถาม brainstorm:
- Positive cases?
- Negative cases?
- Edge cases?
- Permission boundaries?

แล้วสร้างเคสตาม input คุณ

### 5.3 เพิ่มเคสจากการพิมพ์บอก (ตรงไปตรงมา)

```
/qa-create-scenario http://localhost:3000/checkout
อยากให้เพิ่มเคสตอน user ใส่ promo code หมดอายุ
ระบบต้องแสดง error 'รหัสส่วนลดหมดอายุแล้ว'
และปุ่ม 'สั่งซื้อ' ต้องยัง enable อยู่
```

AI สร้าง:
```json
{
  "id": "TS-CHECKOUT-007",
  "page": "/checkout",
  "scenario": "Promo code หมดอายุ → error + ปุ่มสั่งซื้อยัง enable",
  "steps": [
    "1. Login as customer",
    "2. เพิ่มสินค้าลงตะกร้า",
    "3. ไปหน้า checkout",
    "4. ใส่ promo code 'EXPIRED2024'",
    "5. กด 'ใช้รหัส'"
  ],
  "expected": [
    "แสดง error 'รหัสส่วนลดหมดอายุแล้ว'",
    "ปุ่ม 'สั่งซื้อ' ยัง enable"
  ],
  "status": "pending"
}
```

### 5.4 แก้ไขเคสที่มีอยู่

```
/qa-edit-scenario TS-CHECKOUT-007
เปลี่ยนเป็น check ว่า total amount ยังเป็นราคาเดิม (ไม่หัก discount)
```

### 5.5 Generate Playwright Script + รัน

```
/qa-continue --module CHECKOUT
```

AI จะ:
1. อ่าน scenarios ที่ status=`pending`
2. Generate `tests/TS-CHECKOUT-007.spec.ts` (Playwright code จริง)
3. รันด้วย CLI → เก็บ screenshot + report
4. Update qa-tracker.json: `status: "passed"` หรือ `"failed"`

### 5.6 สร้างจาก Design Document

```
/qa-create-scenario --from-design-doc
```

AI อ่าน docs/system-design.md → แปลง requirements → scenarios

---

## 6. Workflow ผสม

### 6.1 Workflow A: Pure QA Plugin (ไม่ต้องรู้ Playwright)

```
1. /qa-create-scenario --auto              # สร้างเคส
2. /qa-continue --module LOGIN              # generate + รัน
3. /qa-status                               # ดูผล
4. /qa-bug-triage                           # failed → bug
5. /qa-bug-export --severity critical       # ส่งให้ dev
```

**เหมาะกับ:** Manual QA, Product Owner, Business Analyst

### 6.2 Workflow B: Hybrid (แนะนำสำหรับ Developer/QA)

```
1. /qa-create-scenario --auto              # สร้างเคส (qa)
2. /qa-continue --module LOGIN              # generate + รัน (qa)
3. # ถ้ามี fail → debug ด้วย Playwright UI Mode
   npx playwright test --ui --grep TS-LOGIN-003
4. # แก้เคสด้วย qa หลัง debug แล้ว
   /qa-edit-scenario TS-LOGIN-003 "เพิ่ม wait ก่อน assert"
5. /qa-run TS-LOGIN-003                     # รันใหม่ (qa)
6. /qa-bug-triage                           # ปิด loop
```

**เหมาะกับ:** Developer ที่ต้องการ control + automation

### 6.3 Workflow C: Pure Playwright CLI (สำหรับงาน debug หนัก)

```
1. /qa-create-scenario --auto              # ใช้ qa สร้างเคสเริ่มต้น
2. /qa-continue --module LOGIN              # ใช้ qa generate scripts
3. # หลังจากนี้ใช้ Playwright CLI ตรงๆ
4. npx playwright test --ui                 # debug UI Mode
5. npx playwright codegen [URL]             # บันทึกเคสใหม่
6. # แก้ tests/*.spec.ts โดยตรง
7. npx playwright test --headed --slow-mo=500
```

**เหมาะกับ:** Test Automation Engineer, งานที่ต้อง custom เยอะ

---

## 7. Persona Guide

### 🎯 Persona A: Manual QA / Product Owner

**ไม่อยากเขียนโค้ด อยากบอกเคสด้วยปาก**

```bash
/qa-create-scenario --auto       # AI ทำให้
/qa-continue --module XXX        # AI ทำให้
/qa-status                       # ดูผล
/qa-bug-export                   # ส่ง dev
```

**ไม่ต้องเรียนรู้:** Playwright CLI

### 🎯 Persona B: Developer / Test Engineer

**อยาก control เต็มที่ + debug เองได้**

```bash
# ใช้ qa สร้างเคส + script
/qa-create-scenario --auto
/qa-continue --module XXX

# Debug ด้วย Playwright CLI
npx playwright test --ui
npx playwright test --debug --grep TS-XXX

# Fine-tune scripts โดยตรง
# แก้ tests/*.spec.ts
```

**ต้องเรียนรู้:** Playwright CLI 70%, qa command 30%

### 🎯 Persona C: Reviewer / Stakeholder

**อยากดูผล/audit ไม่อยากรันเอง**

```bash
/qa-status                       # ภาพรวม
/qa-explain --module CHECKOUT    # flowchart + matrix
npx playwright show-report       # HTML report
# เปิด video จาก test-results/
```

**ต้องเรียนรู้:** น้อยที่สุด — แค่ command ดูผล

---

## 8. FAQ + Troubleshooting

### Q: ทำไมรัน `/qa-run` แล้วไม่เห็นเบราว์เซอร์?

**A:** qa-run รันแบบ headless เพื่อความเร็ว — ถ้าอยากเห็นเบราว์เซอร์:
```bash
# ใช้ Playwright CLI ตรงๆ
npx playwright test --headed tests/TS-LOGIN-001.spec.ts
```

### Q: รัน `--ui` mode แล้ว qa-tracker.json จะอัปเดตไหม?

**A:** **ไม่อัปเดต** — Playwright CLI ไม่รู้จัก qa-tracker.json
- ใช้ `--ui` สำหรับ **debug** เท่านั้น
- ถ้าต้องการ track สถานะ → ใช้ `/qa-run` หลัง debug เสร็จ

### Q: เพิ่มเคสด้วย Codegen แล้วต้องเอาเข้า qa-tracker.json ไหม?

**A:** ควรเอาเข้าเพื่อ track:
```bash
# Codegen สร้าง script ใหม่
npx playwright codegen http://localhost:3000 -o tests/TS-NEW-001.spec.ts

# เอา script เข้า qa-tracker
/qa-edit-scenario TS-NEW-001 "describe scenario from codegen"
```

### Q: Test fail แต่ Playwright CLI ยัง pass — ทำไม?

**A:** ตรวจ `playwright.config.ts`:
- `retries: 1` → CLI retry แต่ qa-run อาจไม่ retry
- `timeout: 60_000` → ถ้า test ของคุณช้ากว่านี้จะ timeout
- ใช้ trace เพื่อดู: `npx playwright show-trace test-results/.../trace.zip`

### Q: Project ใหม่ ไม่มี Playwright ต้องทำยังไง?

**A:** Initialize ก่อน:
```bash
npm init playwright@latest -- --yes --quiet --browser=chromium
npx playwright install
```

หรือให้ qa plugin ทำให้:
```
/qa-continue
# Agent จะตรวจและ init ให้ถ้าไม่มี
```

### Q: เห็น list ทุกหน้าได้ที่ไหน?

**A:** มี 4 ที่:
- `/qa-status` (จัดกลุ่มตาม module)
- `/qa-explain` (flowchart)
- `npx playwright test --list` (text)
- `npx playwright test --ui` (sidebar)

### Q: ลืมว่ามีเคสอะไรบ้างใน module CHECKOUT?

**A:**
```bash
/qa-status --module CHECKOUT
# หรือ
npx playwright test --list --grep CHECKOUT
```

### Q: Test ใช้เวลานานมาก รันเฉพาะที่ fail ได้ไหม?

**A:** ได้ 2 วิธี:
```bash
# ผ่าน qa
/qa-run --failed

# ผ่าน Playwright CLI
npx playwright test --last-failed
```

### Q: อยาก share ผล test ให้ทีม

**A:** มี 3 รูปแบบ:
- HTML report: `npx playwright show-report` → zip ส่ง
- Video: `test-results/*/video.webm`
- qa-status: copy output ของ `/qa-status` → paste ใน Slack/Email

---

## ภาคผนวก: ลิงก์อ้างอิง

- Playwright Docs: https://playwright.dev/docs/intro
- qa-ui-test commands: ดู `/qa-help` หรือ `plugins/qa-ui-test/commands/`
- Playwright config: `playwright.config.ts` (root ของ project)
- Plugin reference (สำหรับ AI): `plugins/qa-ui-test/skills/qa-ui-test/references/playwright-guide.md`

---

> **ทำไมต้องมีเอกสารนี้:**
> qa-ui-test plugin ออกแบบสำหรับ AI agent — แต่ human ก็ต้อง debug เคสที่ AI สร้างเป็นบางครั้ง
> เอกสารนี้คือ "bridge" ระหว่าง 2 โลก: AI workflow (qa command) ↔ Human workflow (Playwright CLI)
