# Plugin Suite Analysis — สถานะงาน (อัปเดต 2026-06-12)

> ผลจาก multi-agent workflow `plugin-suite-analysis` (27+18 agents, adversarial verification)
> โฟลเดอร์นี้คือ source of truth สำหรับทำต่อ — **ไม่ต้องวิเคราะห์ซ้ำ**

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|------|---------|
| `analysis-dotnet-dev.json` | 9 issues + 8 improvements (verified ครบ) |
| `dotnet-deepdive.json` | เทียบ .NET 10 LTS / EF Core 10 / Aspire 13 — 16 gaps + 13 recommendations (ละเอียดสุด ใช้เป็นหลัก) |
| `analysis-brain.json` | 10 issues + 10 improvements |
| `analysis-system-design-doc.json` | 13 issues + 11 improvements |
| `analysis-long-running.json` | 13 issues + 12 improvements |
| `salvaged-verdicts-run2.json` | 18 adversarial verdicts (17 ยืนยันจริง, 1 หักล้าง) |
| `raw-run1-output.json` | ผลดิบ workflow run แรกทั้งหมด |
| `workflow-script.js` | script สำหรับรันวิเคราะห์ส่วนที่ขาด (แก้ PLUGINS list ใน args ให้เหลือเฉพาะที่ต้องการ) |

## ⚠️ Verdict สำคัญที่ถูกหักล้าง (อย่าแก้ผิดทาง)

- **brain**: claim "save-knowledge สร้าง note ซ้ำตอน update" → **ไม่จริง** — server upsert by title + auto version snapshot
  เหลือแค่: document upsert semantics ใน GRAPH_PROTOCOL.md + พิจารณาใช้ update-knowledge/get-note-history/restore-note-version เพื่อความชัดเจน (low priority)

## ✅ ทำเสร็จรอบนี้ (2026-06-12)

- [x] วิเคราะห์ 4/6 plugins + dotnet deep-dive + verification
- [x] **dotnet-dev → v1.3.0**: ดูรายละเอียดท้ายไฟล์ (section "งานที่ทำใน v1.3.0")
- [x] **brain → v3.1.0**: ดูรายละเอียดท้ายไฟล์ (section "งานที่ทำใน v3.1.0")

## ✅ ทำเสร็จ Session 3 (2026-06-13)

- [x] **ข้อ 3 (Feature #4) → system-design-doc v2.1.0 → v2.2.0** + **qa-ui-test v2.6.0 → v2.6.1** (ข้อ 2 ฝั่ง qa contract แก้ไปด้วย):
  - README + help.md refresh ครบ 22 commands (commands จริง = 22 ไม่ใช่ 21 ตาม verdict correction)
  - main entry + reverse-engineer + import-plan migrate เป็น split layout default (no contradiction)
  - frontmatter ครบทุก command + แก้ allowed-tools (brainstorm-design, sitemap-scan Agent→Task)
  - qa-trace.md registry-first AC/UC resolution + flat AC-NNN ทั้ง plugin + scenario.use_case_id field
  - ${CLAUDE_PLUGIN_ROOT} paths + marketplace sync
  - **ผ่าน adversarial verification 2 รอบ** (Opus subagents) — commits ราย subtask + review-fix ใน main
  - ⚠️ ข้อ 2 ที่เหลือ (integration map ครบ 6 ตัว) ยังค้าง — รอ Feature #6 (วิเคราะห์ ui-mockup + qa-ui-test ก่อน)

- [x] **ข้อ 4 (Feature #5) → long-running v2.9.0 → v2.10.0** (opus + adversarial verification 6 verifiers, PASS 93/100):
  - README 2.0.0→2.10.0 (changelog v2.1-v2.10, 19 commands), SKILL.md frontmatter 2.6.0→2.10.0 (block scalar + trigger phrases), help.md headers→2.10.0
  - split-layout registry wired เข้า continue.md (Step 0.5 + Verification Pipeline Step 2) — headline v2.9.0 feature เดิม unreachable
  - `/test-runner`+`/ai-ui-test` (17 จุด) → `/qa-ui-test`; frontmatter ครบ 19 commands; `${CLAUDE_PLUGIN_ROOT}` paths; `$ARGUMENTS` 7 commands
  - template control_coverage (v2.8) + compat 2.3.0; แก้ broken blog URL; bump 2.10.0 + marketplace sync
  - ⚠️ เหลือ (out of scope, follow-up ผ่าน /add-feature): help.md/SKILL.md progressive-disclosure split (งานใหญ่), INTEGRATION_TEST Scenario 7, extract project-specific nav block จาก continue.md

## 📋 ค้างทำครั้งหน้า (เรียงตามความสำคัญ)

> ✅ **Wired เข้า long-running แล้ว (2026-06-12):** งานทั้งหมดด้านล่างถูกแปลงเป็น epic
> `plugin-suite-improvements` (Features **#4-#8**) ใน `feature_list.json` ที่ root
> → ครั้งหน้าสั่ง **`/long-running:continue`** ได้เลย — mapping: ข้อ 3→#4, ข้อ 4→#5, ข้อ 1+2→#6, ข้อ 5→#7+#8
> (ข้อ 6 brain งานเลื่อนเป็น low priority ยังไม่เป็น feature — เพิ่มทีหลังผ่าน /add-feature ได้)

### 1. วิเคราะห์ 2 plugins ที่ขาด ✅ เสร็จ (Feature #6, 2026-06-13)
- `ui-mockup` (v1.10.0) + `qa-ui-test` (v2.6.1) วิเคราะห์เสร็จ → `analysis-ui-mockup.json` + `analysis-qa-ui-test.json` (มี verdicts — 9 verified-high ทั้งหมด VALID)
- 12-agent workflow (2 analysts + 9 adversarial verifiers + 1 integration auditor)

### 2. Integration map ครบทั้ง 6 ตัว ✅ เสร็จ (Feature #6)
- `integration-map.json` — 34 edges (20 working / 10 partial / **1 broken** / 3 missing) + 8 gaps + 8 recommendations (ทุก status มี file evidence)
- **BROKEN**: ui-mockup → qa-ui-test (ui-mockup เขียน QA hints ใน mockup_list.json แต่ qa-create-scenario ไม่เคยอ่าน) → Feature #11
- **MISSING** (enhancement future-candidate, ยังไม่เป็น feature): dotnet-dev↔shared-artifacts (by-design passive skill), qa-ui-test→brain (auto-save QA results), pending_updates round-trip (INTEGRATION_TEST Scenario 7 — already noted in #5 follow-up), graph-brain MCP bundling (brain low-pri งานเลื่อน)

### ✅ Features ใหม่จาก Feature #6 (verified-high findings → backlog):
- **#9 ui-mockup v1.11.0**: Agent(*)→Task(*), ${CLAUDE_PLUGIN_ROOT} paths, README/help version drift, mockup_list.json template QA fields, SKILL.md nonexistent refs
- **#10 qa-ui-test v2.7.0**: Agent(*)→Task(*) ×13, README v2.7.0 (omits 5/18 commands), version drift (12-mode↔13-mode), ${CLAUDE_PLUGIN_ROOT}, scenario-template sync
- **#11 cross-plugin contract**: qa-create-scenario อ่าน mockup_list.json hints (ปิด BROKEN edge) + qa-trace อ่าน use_case_id (ปิด dead UC leg)

### 3. แก้ system-design-doc (วิเคราะห์เสร็จแล้ว — ลงมือได้เลย)
ปัญหา high ที่ verify แล้ว:
- README frozen ที่ v1.3.0 (จริงคือ v2.1.0) — ขาด 11 จาก 21 commands
- help.md frozen ที่ v1.7.0 — ไม่มี v2.x commands ทั้ง 9 ตัว
- system-design-doc.md (main entry) ยังไม่ migrate เป็น v2.1 split layout
- qa-ui-test side ของ AC/UC contract เพี้ยน (ต้องแก้ข้าม plugin)
- 3 commands ไม่มี frontmatter / brainstorm-design allowed-tools ขัดกับ steps ตัวเอง

### 4. แก้ long-running (วิเคราะห์เสร็จแล้ว — ลงมือได้เลย)
ปัญหา high:
- README frozen v2.0.0 (จริง v2.9.0), SKILL.md frontmatter 2.6.0
- v2.9.0 split-layout resolution ไม่ได้ wire เข้า continue.md
- 17 จุดอ้างถึง skills ที่ไม่มีจริง (/test-runner, /ai-ui-test) → ต้องชี้ไป qa-ui-test
- ไม่มี ${CLAUDE_PLUGIN_ROOT} — intra-plugin paths พังเมื่อใช้จาก project อื่น
- help.md 80KB + SKILL.md 42KB monolith → ต้อง split

### 5. dotnet-dev งานใหญ่ที่เลื่อน (deep-dive recommendations ที่ยังไม่ได้ทำ)

> ✅ **Feature #7 เสร็จ (2026-06-13, opus, PASS 95/100):** aspire-setup.md rewrite → Aspire 13/.NET 10 + EF Core 10 patterns (section 13) ใน ef-core-patterns.md — ทุก API verified vs MS Learn (0 hallucinated, adversarial 3 verifiers). bump dotnet-dev 1.4.0.
> ⬇️ ที่เหลือด้านล่าง = **Feature #8** (references ใหม่ 4 ไฟล์ + testing overhaul + SKILL split)

- เขียน references/aspire-setup.md ใหม่เป็น Aspire 13 (ปัจจุบันเป็น 8.x ทั้งไฟล์ + มี API ที่ไม่มีจริง)
- เพิ่ม EF Core 10 patterns (named query filters, ComplexProperty+ToJson, SQL Server json type, xmin concurrency)
- references ใหม่: react-integration.md, auth-security.md, dependency-injection.md (TimeProvider/keyed services/HybridCache/IExceptionHandler), deployment.md
- testing-patterns.md overhaul (xunit.v3, Testcontainers 4.x + MsSql fixture, FakeTimeProvider, licensing notes)
- split SKILL.md → references/clean-architecture-templates.md (progressive disclosure)

### 6. brain งานเลื่อน
- Single-source activity-log schema (ตอนนี้ซ้ำ 8 ที่)
- Phase 10.5 → 9.5 renumbering ใน brain-scan
- Consumer contract section (note titles ที่ plugin อื่นพึ่งพา)
- แก้ flow-discovery saves ให้ใส่ projectName/folderPath ตาม GRAPH_PROTOCOL
- ลบ/อัปเดต docs/brain-skill-spec.md (stale v2.0.0)
- hook matcher เพิ่ม "clear" + ลด bash dependency

---

## งานที่ทำใน v1.3.0 (dotnet-dev) — รอบ 2026-06-12 ✅

- SKILL.md frontmatter: restore trigger keywords EN+TH (regression จาก commit 8948bc1)
- MCP docs: ชื่อ tool จริง (microsoft_docs_search/code_sample_search/docs_fetch) — ตัด mcporter + mcp__microsoft-learn__search ทั้งใน SKILL.md และ references/microsoft-learn-mcp.md
- plugin.json: MCP transport → `{"type":"http"}` ตรง (ตัด npx mcp-remote), เพิ่ม license, bump 1.3.0
- Baseline → .NET 10 LTS + EF Core 10 (package pins ทั้งหมด) + กันล้าสมัยด้วย note ให้เช็ค docs
- Template bugs: BaseEntity property hiding (กลับด้าน inheritance), soft-delete filter ซ้ำ (global filter เป็น authority เดียว + named filters EF10 note), AddAsync→Add, audit เหลือ interceptor ทางเดียว (ตัด SaveChangesAsync override + ลง DI), **ExecuteInTransactionAsync** แก้ UoW ชน EnableRetryOnFailure
- Swashbuckle → built-in OpenAPI (AddOpenApi/MapOpenApi + ASPDEPR002 note), HybridCache, TimeProvider
- เพิ่ม Minimal APIs vs Controllers decision table + Repo/UoW trade-off box + per-aggregate repository + licensing notes (MediatR/AutoMapper/FluentAssertions commercial)
- Aspire AppHost: WaitFor + ContainerLifetime.Persistent + warning ว่า aspire-setup.md ยังเป็น 8.x
- testing-patterns.md: แก้ mock ให้ตรง interface ใหม่ (Add แทน AddAsync) — overhaul เต็มยังค้าง
- README เขียนใหม่: install ถูกต้อง (dotnet-dev@agent-marketplace), version + changelog ครบ
- marketplace.json sync 1.3.0 + description อัปเดต

## งานที่ทำใน v3.1.0 (brain) — รอบ 2026-06-12 ✅

- สร้าง README.md (เดิมไม่มี) — MCP prerequisites พร้อมคำสั่ง add server จริง (SecondBrain stdio + GRAPH_BRAIN_API), command table 14 skills, integration table, changelog
- แก้ 6 skills อ้าง GRAPH_PROTOCOL.md แบบ bare → `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` (9 จุด)
- GRAPH_PROTOCOL.md: document upsert-by-title semantics (ตาม verifier ที่หักล้าง duplicate claim) + ชี้ update-knowledge/get-note-history/restore-note-version
- Trigger phrases EN+TH ใน 4 skills หลัก (brain, brain-save, brain-scan, brain-update)
- frontmatter `args:` → `argument-hint:` ทั้ง 12 skills (field มาตรฐาน; คง user_invocable ไว้)
- plugin.json + marketplace.json bump 3.1.0
- ตรวจแล้ว: JSON valid, `claude plugin validate` ผ่าน, YAML frontmatter ทั้ง 14 ไฟล์ parse ผ่าน
