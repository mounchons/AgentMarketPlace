# Maintainability Checks

ประเมิน test code maintainability — selector quality + helper reuse + density + readability

## Inputs

- **Test files** (`tests/**/*.spec.ts`, `tests/pages/*.page.ts`)
- **qa-tracker scenarios** — count + duplicates + brainstorm_notes
- **POM files** (Page Object Models)

## 5 Maintainability Metrics (each 20 points → 100 total)

### 1. Selector Quality — 20 points

วัดสัดส่วนของ selector types ที่ใช้ใน specs:

| Selector type | Quality | Detection |
|---|---|---|
| `getByTestId('xxx')` / `data-testid` | high | grep `data-testid` หรือ `getByTestId` |
| `getByRole('xxx', { name: ... })` | high | grep `getByRole` |
| `getByLabel('xxx')` | high | grep `getByLabel` |
| `getByText('xxx')` | medium | grep `getByText` |
| `locator('css-selector')` | low | grep `locator(` with CSS |
| `locator('xpath=...')` | very low | grep `xpath=` |

**Score formula:**
```
high_count = count of high-quality selectors
medium_count = count of medium
low_count = count of low + very_low

total = high_count + medium_count + low_count
quality_ratio = (high_count*1.0 + medium_count*0.5) / total

20: quality_ratio >= 0.85
15: quality_ratio 0.70-0.84
10: quality_ratio 0.55-0.69
5:  quality_ratio 0.40-0.54
0:  quality_ratio < 0.40
```

### 2. Helper Reuse — 20 points

วัด login/auth helper reuse:

```bash
# Count duplicate login flows
grep -l "page.goto.*login\|getByRole.*Login" tests/*.spec.ts | wc -l = login_inline_count
grep -l "loginAs\|login.helper" tests/*.spec.ts | wc -l = login_helper_count

helper_ratio = login_helper_count / (login_inline_count + login_helper_count)
```

| Ratio | Points |
|---|---|
| >= 0.95 (almost all use helper) | 20 |
| 0.80-0.94 | 15 |
| 0.60-0.79 | 10 |
| 0.40-0.59 | 5 |
| < 0.40 | 0 |

**Common helpers checked:**
- `auth.helper.ts` (login, logout)
- `api-setup.helper.ts` (data setup via API)
- `screenshot.helper.ts` (consistent capture)
- `report.helper.ts` (uniform reporting)

### 3. Test Density — 20 points

วัดสัดส่วน scenarios per page:

```
total_pages = count distinct scenario.url
total_scenarios = scenarios.length
density = scenarios / pages

20: density >= 8 (each page has 8+ scenarios — comprehensive)
15: density 5-7
10: density 3-4
5:  density 2
0:  density < 2 (under-tested)
```

**Edge cases:**
- ถ้า page = static (about page, P3 trivial) → expected density 1-2 → adjust score upward
- ถ้า page = master-detail (15+ scenarios) → expected density 12+

### 4. POM Coverage — 20 points

วัดว่า test ใช้ Page Object Model แค่ไหน:

```
specs_using_pom = count of *.spec.ts that import from pages/
specs_total = count *.spec.ts
pom_coverage = specs_using_pom / specs_total

20: pom_coverage >= 0.90
15: pom_coverage 0.70-0.89
10: pom_coverage 0.50-0.69
5:  pom_coverage 0.30-0.49
0:  pom_coverage < 0.30
```

**Detection:**
```bash
grep -l "from './pages\|from '../pages" tests/*.spec.ts | wc -l
```

### 5. Comment + Doc Ratio — 20 points

วัด readability ของ specs:

```
For each spec file:
  comment_lines = count lines starting with // หรือ /**
  total_lines = count non-blank lines
  comment_ratio = comment_lines / total_lines

avg_ratio = avg over all specs

20: avg_ratio 5-15% (well-commented but not excessive)
15: avg_ratio 3-5% หรือ 15-20%
10: avg_ratio 1-3%
5:  avg_ratio < 1% หรือ > 20% (under or over)
```

**Bonus:** +5 ถ้าทุก spec มี header comment อ้างอิง scenario doc:
```typescript
// Scenario: TS-LOGIN-001
// Doc: test-scenarios/TS-LOGIN-001.md
// Risk: P0/9 [security-flow] | Model: opus
```

## Aggregation

```
total_maintainability_score = selector + helper + density + pom + comments
```

## Common Issues + Fixes

| Issue | Fix recommendation |
|---|---|
| Quality ratio < 0.55 (lots of CSS selectors) | refactor → ใช้ `getByRole` / `data-testid` |
| Helper ratio < 0.6 (login flow duplicated) | extract `loginAs(page, role)` ไว้ที่ `tests/helpers/auth.ts` |
| POM coverage < 0.5 | สร้าง POM ทุก module: `tests/pages/{module}.page.ts` |
| Density < 3 (under-tested pages) | /qa-create-scenario --module {MODULE} เพิ่มเคส |
| No comments referencing scenario | header template ใน /qa-continue → auto-add comment |

## Anti-Patterns ที่ลด score

ตรวจ specs หา patterns ที่ทำให้ maintain ยาก:

| Anti-pattern | grep regex | Penalty |
|---|---|---|
| `await page.waitForTimeout(N)` (hardcoded sleep) | `waitForTimeout\(\d` | -2 per occurrence |
| `nth(N)` chains > 2 deep | `\.nth\(\d+\)\.\w+\.nth` | -3 |
| Inline test data > 10 lines | scan for inline arrays/objects | -2 per file |
| `#id` selectors (fragile) | `locator\(['"]#` | -1 per occurrence |
| Magic numbers without const | `\b\d{3,}\b` (heuristic) | -1 per occurrence |

**Floor:** 0

## Output Example

```
🔧 Maintainability Score: 73/100 (CONCERNS)

  Selector quality:    16/20 (78% high-quality — มี CSS selectors 8 จุด)  ⚠️
  Helper reuse:        18/20 (login helper reused, API setup partial)
  Test density:        14/20 (avg 4.2 scenarios/page — under-tested)      ⚠️
  POM coverage:        15/20 (75% specs use POM)
  Comments + docs:     10/20 (avg 2% — too sparse)                        ⚠️

  Anti-patterns detected:
    - waitForTimeout(...) ใน 5 files (-10)
    - #id selectors ใน 3 files (-3)

  💡 Fixes:
    1. Replace waitForTimeout with waitFor({ state: 'visible' }):
       tests/TS-CHECKOUT-005.spec.ts:42
       tests/TS-PRODUCT-009.spec.ts:18
    2. Add header comments referencing scenario docs:
       Use template ใน /qa-continue
    3. Increase density on /reports (1 scenario only):
       /qa-create-scenario http://localhost:3000/reports
```
