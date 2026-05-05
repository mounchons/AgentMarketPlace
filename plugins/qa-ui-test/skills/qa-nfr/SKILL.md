---
name: qa-nfr
version: 1.0.0
description: |
  NFR (Non-Functional Requirements) Assessment skill — ประเมิน 4 มิติ:
  performance, security, reliability, maintainability พร้อม score 0-100 ต่อ category
  และ release-readiness gate per module

  รองรับ: Lighthouse audit (LCP/INP/TTFB/bundle), security header check,
  flaky/error rate analysis, selector quality + helper reuse metrics
  ต่อยอด network-mock-guide สำหรับ reliability tests

  USE THIS SKILL when the user mentions: NFR, non-functional, performance test,
  security audit, reliability, maintainability, lighthouse, web vitals,
  flaky rate, error rate, selector quality, helper reuse, release readiness gate

  Thai triggers: "ทดสอบ NFR", "ประเมิน performance", "ตรวจ security",
  "วัด reliability", "ตรวจ maintainability", "release readiness", "score NFR"
---

# QA NFR Assessment Skill (v1.0.0)

ประเมิน Non-Functional Requirements ต่อยอดจาก qa-ui-test/qa-advanced
แต่ละ category ให้ score 0-100 พร้อม recommendations ที่ actionable

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     QA NFR ASSESSMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input:                                                          │
│    qa-tracker.json (scenarios + runs)                            │
│    test-results/ (Playwright traces, screenshots)                │
│    Lighthouse reports (ถ้ามี — auto generate ได้)                │
│    qa-tracker.bugs[] (ใช้คำนวณ defect-density)                  │
│                                                                  │
│  4 NFR Categories:                                               │
│  ┌────────────────┐ ┌────────────────┐                          │
│  │ Performance    │ │ Security       │                          │
│  │ • LCP          │ │ • Auth/CSRF    │                          │
│  │ • INP          │ │ • Headers      │                          │
│  │ • TTFB         │ │ • XSS/IDOR     │                          │
│  │ • Bundle size  │ │ • Secrets DOM  │                          │
│  │ • CWV pass     │ │ • Token expiry │                          │
│  └────────────────┘ └────────────────┘                          │
│  ┌────────────────┐ ┌────────────────┐                          │
│  │ Reliability    │ │ Maintainability│                          │
│  │ • Pass rate    │ │ • Selector qual│                          │
│  │ • Flaky rate   │ │ • Helper reuse │                          │
│  │ • Retry rate   │ │ • Test density │                          │
│  │ • Error rate   │ │ • POM coverage │                          │
│  │ • Recovery     │ │ • Comment ratio│                          │
│  └────────────────┘ └────────────────┘                          │
│                                                                  │
│  Output:                                                         │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  qa-tracker.json#nfr_results                          │       │
│  │  • per-category score (0-100)                         │       │
│  │  • per-module score                                   │       │
│  │  • overall NFR score                                  │       │
│  │  • gate decision (PASS / CONCERNS / FAIL)             │       │
│  │  • recommendations[]                                  │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Available Commands

| Command | Description | When to use |
|---------|-------------|-------------|
| `/qa-nfr-assess` | ประเมิน NFR ทั้ง 4 มิติ + ออก score + gate | ก่อน release เพื่อตรวจ readiness |
| `/qa-nfr-assess --category performance` | เฉพาะ category | drill-down |
| `/qa-nfr-assess --module CHECKOUT` | เฉพาะ module | focus area |
| `/qa-nfr-assess --gate-only` | แสดงแค่ gate decision (no detail) | CI integration |

## Core Workflow

```
1. Read qa-tracker.json → scenarios + runs[] + bugs[]
2. (Optional) Run Lighthouse audit → public URLs ของ module
3. Compute scores per category (0-100)
4. Aggregate per-module + overall
5. Apply gate logic → PASS / CONCERNS / FAIL
6. Save to qa-tracker.nfr_results
7. Generate recommendations
```

## Quick Reference

- **Performance checks**: Read `references/performance-checks.md`
- **Security checks**: Read `references/security-checks.md`
- **Reliability checks**: Read `references/reliability-checks.md`
- **Maintainability checks**: Read `references/maintainability-checks.md`

## NFR Score Schema (qa-tracker.json#nfr_results)

```json
{
  "nfr_results": {
    "schema_version": "1.0",
    "assessed_at": "ISO8601",
    "scope": "all|module=PRODUCT|category=performance",
    "overall": {
      "score": 82,
      "gate": "CONCERNS",
      "by_category": {
        "performance":     { "score": 88, "gate": "PASS" },
        "security":        { "score": 75, "gate": "CONCERNS" },
        "reliability":     { "score": 92, "gate": "PASS" },
        "maintainability": { "score": 73, "gate": "CONCERNS" }
      }
    },
    "by_module": {
      "LOGIN":    { "score": 85, "gate": "PASS" },
      "CHECKOUT": { "score": 68, "gate": "CONCERNS" },
      "PRODUCT":  { "score": 90, "gate": "PASS" }
    },
    "recommendations": [
      {
        "category": "security",
        "severity": "high",
        "module": "CHECKOUT",
        "issue": "Missing CSP header on /checkout",
        "fix": "Add Content-Security-Policy: default-src 'self' to nginx config",
        "effort": "30min"
      }
    ]
  }
}
```

## Gate Decision Logic

แต่ละ category + overall ใช้ logic เดียวกัน:

```
score >= 85  → PASS       (release-ready)
score 65-84  → CONCERNS   (release มีเงื่อนไข — fix recommendations)
score < 65   → FAIL       (block release)
```

**Special override:** ถ้า security category < 75 → overall = FAIL (security เป็น hard floor)

## 3 Levels of Coverage

| Level | ใช้เมื่อ | Cost | Output |
|-------|---------|------|--------|
| **Light** | quick smoke (default) | low | scores จาก qa-tracker data + bugs[] อย่างเดียว (no Lighthouse) |
| **Deep** | ก่อน release | medium | + Lighthouse audit ทุก public URL + selector analysis |
| **Full** | quarterly review | high | + manual security audit + accessibility scan + performance under load |

```bash
/qa-nfr-assess                  # Light (default)
/qa-nfr-assess --deep           # Deep — รัน Lighthouse
/qa-nfr-assess --full           # Full — ครอบทุก check
```

## Integration with Other Plugins

| Plugin | Integration |
|--------|------------|
| **qa-ui-test** | NFR ใช้ qa-tracker.scenarios + runs[] เป็น input หลัก |
| **qa-advanced** | reliability tests ต่อยอดจาก network-mock-guide (retry sequences, timeouts) |
| **flow-discovery** | security findings จาก flow-discovery → input ของ security category |
| **system-design-doc** | NFR requirements ใน design doc → expected baseline |
| **long-running** | NFR fail → bug-fix feature ใน long-running |

## When to Run NFR Assessment

```
Sprint development:        ไม่ต้อง — หรือเฉพาะ module ที่ทำเสร็จ
ก่อน PR merge:             /qa-nfr-assess --module {MODULE}
ก่อน release branch:        /qa-nfr-assess (light) ทุก module
ก่อน production release:    /qa-nfr-assess --deep
หลัง production incident:   /qa-nfr-assess --full
Quarterly review:          /qa-nfr-assess --full + manual audit
```

## CRITICAL RULES

1. **Don't fake scores** — score มาจากข้อมูลจริงใน qa-tracker.json + Lighthouse output เท่านั้น
2. **Always show fault lines** — score 100 ไม่จริง: ต้องมี at least 1 recommendation เสมอ (perfect ไม่มีในโลก)
3. **Gate is advisory** — output PASS/CONCERNS/FAIL เป็น recommendation ไม่ใช่ enforce — release manager ตัดสินใจสุดท้าย
4. **Save to qa-tracker.nfr_results** — ทุกครั้งหลัง assessment
5. **Don't run Lighthouse without `--deep`** — Lighthouse กิน memory + time

## Score Stability

- คะแนน NFR ควรเปลี่ยนช้า — ถ้าวันนี้ 85, พรุ่งนี้ 60 = bug ในการคำนวณ (ไม่ใช่ NFR เปลี่ยนแปลง)
- ใช้ rolling average: score ของ run นี้ = 70% × current + 30% × previous (smooth out variance)
- เก็บ history: `nfr_results.history[]` เพื่อดู trend
