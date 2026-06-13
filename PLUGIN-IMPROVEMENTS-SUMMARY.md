# สรุปการแก้ไข/ปรับปรุง Plugin Suite — แยกตาม Plugin

> **ที่มา:** ผลวิเคราะห์ multi-agent (`plans/plugin-analysis-20260612/`) → epic `plugin-suite-improvements`
> (Features #4–#11) ผ่าน long-running plugin (dogfooding)
> **นโยบาย:** ทุก feature ใช้ **opus + adversarial verification** (`force_opus_all=true`)
> **สถานะ:** ✅ epic เสร็จครบ **8/8** | ทุก feature ผ่าน adversarial verification + `claude plugin validate`
> **อัปเดตล่าสุด:** 2026-06-13

---

## ภาพรวม — Plugin ที่แก้ไข

| Plugin | เวอร์ชัน (ก่อน → หลัง) | Feature/Session | สาระสำคัญ | คะแนน review |
|---|---|---|---|---|
| **dotnet-dev** | 1.2.0 → **1.5.0** | Session 2, #7, #8 | .NET 10 / Aspire 13 / EF Core 10 + 4 references ใหม่ + testing overhaul | 95/100 (#7,#8) |
| **brain** | 3.0.0 → **3.1.0** | Session 2 | README + MCP prerequisites + `${CLAUDE_PLUGIN_ROOT}` + upsert semantics | — |
| **system-design-doc** | 2.1.0 → **2.2.0** | #4 | docs sync 22 commands + split layout + AC/UC contract + sitemap graph | 92/100 |
| **long-running** | 2.9.0 → **2.10.0** | #5 | docs sync 19 commands + wire split-layout + แทน dead skills | 93/100 |
| **(analysis)** | — | #6 | วิเคราะห์ ui-mockup + qa-ui-test + integration map 6 plugins | 95/100 |
| **ui-mockup** | 1.10.0 → **1.11.0** | #9 | doc-sync 8 commands + Agent fix + paths + mockup_list QA fields | 94/100 |
| **qa-ui-test** | 2.6.0 → **2.7.1** | #4, #10, #11 | Agent→Task ×13 + docs v2.7.0 + cross-plugin contract (mockup hints + UC) | adversarial ✅ |

---

## 1. dotnet-dev — v1.2.0 → v1.5.0

ปรับ baseline เป็น **.NET 10 LTS / Aspire 13 / EF Core 10** + เพิ่ม reference ใหม่ + แยก SKILL.md (progressive disclosure) — ทุก Microsoft/Azure API **verify กับ Microsoft Learn MCP ก่อนเขียน** (verify-then-write) → **0 hallucinated APIs**

### v1.2.0 → v1.3.0 (Session 2, 2026-06-12)
- baseline → .NET 10 LTS + EF Core 10 (pin package ครบ)
- แก้ MCP tool names ให้ตรงจริง (`microsoft_docs_search`/`microsoft_code_sample_search`/`microsoft_docs_fetch`) + transport `{"type":"http"}`
- แก้ template bugs: BaseEntity property hiding, soft-delete filter ซ้ำ, `AddAsync`→`Add`, audit interceptor ทางเดียว, `ExecuteInTransactionAsync` แก้ UoW ชน `EnableRetryOnFailure`
- Swashbuckle → built-in OpenAPI (`AddOpenApi`/`MapOpenApi`), HybridCache, TimeProvider
- restore trigger keywords EN+TH + เขียน README ใหม่ (install ถูกต้อง)

### v1.3.0 → v1.4.0 (Feature #7) — Aspire 13 + EF Core 10
- เขียน `references/aspire-setup.md` ใหม่ทั้งไฟล์ → **Aspire 13 / .NET 10**: Aspire CLI, `Sdk="Aspire.AppHost.Sdk/13.0.0"`, `EnrichNpgsqlDbContext`/`EnrichSqlServerDbContext` (แก้ double-register), `WaitFor`, `WithLifetime(ContainerLifetime.Persistent)`, `WithHttpHealthCheck`
- `ef-core-patterns.md` section 13 EF Core 10: named query filters, `ComplexProperty`+`ToJson`, `ExecuteUpdateAsync` regular lambda, SQL Server 2025 json type + `UseAzureSql`, Npgsql `xmin` concurrency
- ลบ warning "Aspire 8.x" ที่ค้าง
- **Verification:** verify-then-write กับ MS Learn ทุก section + adversarial 3 verifiers → refuted=0, hallucinated=0 — **PASS 95/100**

### v1.4.0 → v1.5.0 (Feature #8) — 4 references ใหม่ + testing overhaul + SKILL split
- `references/react-integration.md` (373 บรรทัด): CORS, Vite proxy, Aspire `AddViteApp`, openapi-typescript, cookie vs JWT, BFF
- `references/auth-security.md` (437): JWT bearer, `MapIdentityApi`, .NET 10 401/403, authorization policies
- `references/dependency-injection.md` (378): TimeProvider, keyed services, options `ValidateOnStart`, HybridCache, `IExceptionHandler`+ProblemDetails
- `references/testing-patterns.md` overhaul (863): xunit.v3, Testcontainers 4.x + MsSql fixture (dual-DB), Respawn SqlServer, FakeTimeProvider, `IAsyncLifetime` + licensing notes
- `references/deployment.md` (367) ใหม่ + extract templates → `clean-architecture-templates.md` → **SKILL.md ลด 556 → 254 บรรทัด** (progressive disclosure)
- **Verification:** Workflow fan-out 5 agents verify-then-write + adversarial 3 verifiers → refuted=0, hallucinated Microsoft APIs=0; third-party tools (openapi-typescript/Respawn/xunit.v3/commercial) caveat ถูกต้อง — **PASS 95/100**

---

## 2. brain — v3.0.0 → v3.1.0 (Session 2, 2026-06-12)

- สร้าง `README.md` (เดิมไม่มี) — MCP prerequisites + คำสั่ง add server จริง (SecondBrain stdio + GRAPH_BRAIN_API), command table 14 skills, integration table, changelog
- แก้ 6 skills อ้าง `GRAPH_PROTOCOL.md` แบบ bare → `${CLAUDE_PLUGIN_ROOT}/GRAPH_PROTOCOL.md` (9 จุด)
- `GRAPH_PROTOCOL.md`: document upsert-by-title semantics (แก้ misconception "save-knowledge สร้าง note ซ้ำ" — จริงคือ server upsert + auto version snapshot) + ชี้ `update-knowledge`/`get-note-history`/`restore-note-version`
- trigger phrases EN+TH ใน 4 skills หลัก + `args:` → `argument-hint:` ทั้ง 12 skills
- ✅ JSON valid, `claude plugin validate` ผ่าน, YAML frontmatter ทั้ง 14 ไฟล์ parse ผ่าน

---

## 3. system-design-doc — v2.1.0 → v2.2.0 (Feature #4)

แก้ documentation drift รุนแรง + ปิด AC/UC contract ข้าม plugin

- **README → v2.2.0:** ครบ **22 commands** 6 หมวด (เดิมขาด 11), split layout default, schema 2.3.0, changelog 1.0.0→2.2.0
- **help.md → v2.2.0:** เพิ่ม 9 commands v2.x (SITEMAP GRAPH 6 ตัว + split-design-doc + sitemap-validate + sync-sitemap)
- migrate main entry เป็น split layout + แก้ contradiction ใน reverse-engineer / import-plan
- เพิ่ม frontmatter 3 commands ที่ขาด + แก้ `allowed-tools` (brainstorm-design +Write/Bash, **sitemap-scan `Agent`→`Task`**)
- **AC/UC contract (เชื่อม qa-ui-test):** qa-trace registry-first + flat `AC-NNN` (ห้าม `AC-X.Y`) ทั้ง plugin + `scenario.use_case_id` field (qa-ui-test เด้งเป็น v2.6.1)
- `${CLAUDE_PLUGIN_ROOT}` paths ทุก command + marketplace sync
- **Verification:** adversarial 2 รอบ (refuting verifiers) — แก้ import-plan migrate ไม่ครบ, qa-tracker `AC-1.1` ค้าง, diagram count 7-vs-8 — **PASS 92/100**

---

## 4. long-running — v2.9.0 → v2.10.0 (Feature #5)

- **docs sync:** README 2.0.0→2.10.0 (changelog v2.1–v2.10, 19 commands), SKILL.md frontmatter 2.6.0→2.10.0 (block scalar + trigger phrases), help.md → 2.10.0
- **wire v2.9.0 split-layout registry เข้า `continue.md`** (Step 0.5 + Verification Pipeline Step 2) — headline feature เดิม unreachable
- **แทน dead skills:** `/test-runner` + `/ai-ui-test` (17 จุด) → `/qa-ui-test`
- frontmatter ครบ 19 commands + `${CLAUDE_PLUGIN_ROOT}` paths (5) + `$ARGUMENTS` (7)
- template `control_coverage` (v2.8) + compat 2.3.0 + แก้ broken Anthropic blog URL
- **Verification:** adversarial 6 verifiers (refuted 1 low: `/help --new` label) — **PASS 93/100**
- **Follow-up (out-of-scope):** help.md 80KB + SKILL.md 42KB progressive-disclosure split

---

## 5. (Analysis) — Feature #6

ไม่ใช่การแก้ plugin แต่เป็นการ **วิเคราะห์ 2 plugins ที่เหลือ + ทำ integration map** — เป็น source-of-truth ของ Features #9–#11

- วิเคราะห์ **ui-mockup** (10 issues) + **qa-ui-test** (8 issues) → `analysis-ui-mockup.json` + `analysis-qa-ui-test.json`
- **integration-map.json**: 34 edges (เดิม 20 working / 10 partial / **1 broken** / 3 missing) + 8 gaps + 8 recommendations (ทุก status มี file evidence)
- Workflow 12 agents (2 analysts + 9 adversarial verifiers + 1 integration auditor) — verified-high ทั้งหมด VALID
- สร้าง Features #9/#10/#11 จาก verified findings — **PASS 95/100**

---

## 6. ui-mockup — v1.10.0 → v1.11.0 (Feature #9)

- **create-html-mockup ลบ `Agent(*)`** (ที่ไม่มีจริง — ใช้ `Skill(frontend-design)` ไม่ spawn subagent) + `${CLAUDE_PLUGIN_ROOT}` paths
- **README → v1.11.0:** version sync (header 1.6.0 / footer 1.0.0 → 1.11.0) + Commands ครบ **8 ตัว** + changelog
- **help.md** v1.8.0 → v1.11.0 (banner + `--new` + footer; feature labels คงไว้)
- **mockup_list.json template:** เพิ่ม QA fields ตัวอย่าง (page 001: `complexity_factors`/`acceptance_criteria_ids`/`risk_baseline`) + split-aware `related_documents` + `plugin_version` 1.11.0
- **SKILL.md References** ลบ 2 ไฟล์ที่ไม่มีจริง (component-library / responsive-patterns)
- **Verification:** adversarial 2 verifiers → refuted=0 — **PASS 94/100**
- **Follow-up (out-of-scope):** emit `page.use_case_ids[]` (ปิด UC leg ฝั่ง write — คู่กับ Feature #11 ที่ปิดฝั่ง read)

---

## 7. qa-ui-test — v2.6.0 → v2.7.1 (Features #4, #10, #11)

plugin ที่แก้มากที่สุด — 3 features

### v2.6.0 → v2.6.1 (Feature #4, ฝั่ง contract)
- qa-trace registry-first AC/UC resolution + flat `AC-NNN` + รับ field `scenario.use_case_id` (ฝั่งรับจาก system-design-doc)

### v2.6.1 → v2.7.0 (Feature #10) — docs sync + tool fix + version sync
- **Tool fix:** `Agent(*)` → `Task` ใน `allowed-tools` ของ **13 action commands** (tool ชื่อไม่มีจริงใน Claude Code → subagent dispatch ถูก block/prompt)
- **README v2.2.0 → v2.7.0:** เพิ่ม 5 commands ที่ขาด (`/qa-trace`, `/qa-nfr-assess`, `/qa-create-advanced`, `/qa-continue-advanced`, `/qa-advanced-howto`) ครบ **18 คำสั่ง** + TOC + schema 1.7.0 + changelog §14
- **Version sync:** plugin / marketplace / SKILL / qa-help = **2.7.0** + `12-mode` → `13-mode` (ตรง marketplace)
- **`${CLAUDE_PLUGIN_ROOT}` paths** (qa-help 3 จุด + README) — เลิก hardcode `plugins/qa-ui-test/...`
- namespace `/qa-coverage-check` → `/long-running:qa-coverage-check` (เป็นคำสั่ง long-running)
- `references/scenario-template.md` refresh → qa-tracker **schema 1.7.0** (risk / complexity_factors / acceptance_criteria_id / use_case_id / control_refs) — ลบ legacy Priority field
- **Verification:** adversarial 3 verifiers — version verifier จับ bare `/qa-coverage-check` ตกหล่น 4 จุด → review-fix

### v2.7.0 → v2.7.1 (Feature #11) — cross-plugin contract (ปิด BROKEN edge + dead UC leg)
- **Consumer hook (ปิด BROKEN edge ui-mockup→qa-ui-test):** `/qa-create-scenario` **Auto Step 0.6** อ่าน `.mockups/mockup_list.json` page hints (`complexity_factors`/`risk_baseline`/`acceptance_criteria_ids`/`cascade_chain`/`wizard_steps`) มา seed ก่อน code-scan + merge ใน Step 2 + `--no-mockup-hints` opt-out + defensive `risk_baseline` parse (string|object)
- **UC traceability (ปิด dead UC leg):** `/qa-trace` consume `scenario.use_case_id` เป็น **first-class** (Source 1b + uc_inventory + Step 3 A2 direct mapping + UC gate + UC Matrix/UC GAP + persist ใน `qa-tracker.traceability`)
- bump 2.7.1 + version sync ครบ **5 stamps** (plugin/marketplace/SKILL/qa-help/README)
- **integration-map re-verify:** 3 edges (broken/partial/missing) → **working**, broken เหลือ **0**
- **Verification:** adversarial 3 verifiers — consumer **clean**; UC 2 low (ไม่ persist + Source2 UC-header grep) → fixed; version-map 1 medium (SKILL/qa-help/README ยัง 2.7.0) → fixed

---

## หมายเหตุการตรวจสอบ (ทุก feature)

- **opus + adversarial verification** ทุกตัว (refuting verifiers พยายามหักล้างก่อน mark passed)
- **verify-then-write กับ Microsoft Learn MCP** (dotnet-dev #7/#8) → 0 hallucinated APIs แม้ content หลัง knowledge cutoff
- QA+NFR release gates = **N/A** ทุก feature (เป็น plugin-internal — ไม่มี `acceptance_criteria_id` / ไม่มี `qa-tracker.json` ใน repo นี้)
- ทุก plugin ผ่าน `claude plugin validate` + JSON valid + version sync (plugin.json ↔ marketplace.json)

## งานต่อยอด (out-of-scope — ผ่าน `/add-feature`)
- **ui-mockup:** emit `page.use_case_ids[]` (ปิด UC leg ฝั่ง write)
- **long-running:** help.md/SKILL.md progressive-disclosure split (งานใหญ่)
- **brain:** single-source activity-log schema, consumer contract section (PENDING ข้อ 6, low priority)
- **MISSING edges (future-candidate):** qa-ui-test→brain (auto-save QA results), graph-brain MCP bundling
