# Performance Checks

ประเมิน performance ของ web app — Core Web Vitals + bundle + load behavior

## Inputs

- **Lighthouse reports** (จาก `npx lighthouse {url} --output=json`) — ถ้า `--deep` mode
- **Playwright traces** (`test-results/*/run-*/trace.zip`) — request timing, resource size
- **qa-tracker scenarios** ที่มี `complexity_factors` รวม `network-mock` — ใช้คำนวณ slow-network resilience

## 5 Performance Metrics (each 20 points → 100 total)

### 1. LCP (Largest Contentful Paint) — 20 points

| LCP | Score |
|---|---|
| ≤ 2.5s | 20 (good) |
| 2.5-4.0s | 12 (needs improvement) |
| > 4.0s | 0 (poor) |

**How to measure:**
- Lighthouse: `categories.performance.audits.largest-contentful-paint.numericValue`
- Playwright trace: `performance.timing.loadEventEnd - performance.timing.fetchStart`
- Sample: ใช้ median ของ 3 runs

### 2. INP (Interaction to Next Paint) — 20 points

| INP | Score |
|---|---|
| ≤ 200ms | 20 (good) |
| 200-500ms | 12 (needs improvement) |
| > 500ms | 0 (poor) |

**How to measure:**
- Lighthouse: `audits.interaction-to-next-paint.numericValue`
- Skipped ถ้าไม่มี user interaction ใน scenario

### 3. TTFB (Time to First Byte) — 20 points

| TTFB | Score |
|---|---|
| ≤ 800ms | 20 |
| 800-1800ms | 12 |
| > 1800ms | 0 |

### 4. Bundle Size — 20 points

วัด total JS + CSS transferred (gzipped):

| Total transferred | Score |
|---|---|
| ≤ 200 KB | 20 |
| 200-500 KB | 12 |
| 500-1000 KB | 6 |
| > 1000 KB | 0 |

**How to measure:**
- Playwright: `page.on('response', r => total += r.headers()['content-length'])`
- Lighthouse: `audits.total-byte-weight.numericValue`

### 5. Slow Network Resilience — 20 points

วัดจาก qa-tracker scenarios ที่มี `complexity_factors` รวม `network-mock`:

| Network-mock pass rate | Score |
|---|---|
| 100% (all timeouts/errors handled) | 20 |
| 80-99% | 12 |
| 60-79% | 6 |
| < 60% | 0 |

**Calculation:**
```
network_mock_scenarios = scenarios.filter(s => 'network-mock' in s.complexity_factors)
pass_count = network_mock_scenarios.filter(s => s.last_run_status == 'passed').length
score = (pass_count / network_mock_scenarios.length) × 20

# ถ้าไม่มี network-mock scenarios เลย → 10 points (incomplete coverage)
if network_mock_scenarios.length == 0: score = 10
```

## Aggregation

```
total_performance_score = LCP + INP + TTFB + bundle + resilience
                        = max 100
```

## Common Issues + Fixes (auto-recommendations)

| Issue | Fix recommendation |
|---|---|
| LCP > 4s on /products | Lazy-load images below fold, preconnect to CDN |
| Bundle > 500 KB | Code splitting, tree shaking, dynamic imports |
| TTFB > 1800ms | DB query optimization, add cache layer, CDN |
| INP > 500ms | Debounce input handlers, virtualize long lists |
| Network-mock < 60% pass | เพิ่ม retry logic, timeout fallbacks, error UI |

## Module-Specific Performance Profiles

NFR criteria ปรับตาม page_type:

| Page type | LCP target | INP target | Bundle target |
|---|---|---|---|
| `form` (login, contact) | ≤ 2.0s | ≤ 100ms | ≤ 150 KB |
| `master-data` (list) | ≤ 2.5s | ≤ 200ms | ≤ 300 KB |
| `master-detail` (orders) | ≤ 3.0s | ≤ 300ms | ≤ 400 KB |
| `dashboard` (charts) | ≤ 4.0s | ≤ 500ms | ≤ 600 KB |
| `wizard` (checkout) | ≤ 2.5s | ≤ 200ms | ≤ 300 KB |

ใช้ profile-specific target → score adjusts ตาม expectation จริง

## Lighthouse Auto-Run

ใน `--deep` mode:

```bash
# 1. Pick public URLs from qa-tracker
URLS=$(jq -r '[.scenarios[] | select(.url) | .url] | unique | .[]' qa-tracker.json)

# 2. Run Lighthouse for each
for url in $URLS; do
  npx lighthouse "$url" \
    --output=json \
    --output-path=test-results/nfr/lighthouse/$(basename $url).json \
    --quiet --chrome-flags="--headless"
done

# 3. Parse + score
node skills/qa-nfr/scripts/parse-lighthouse.js test-results/nfr/lighthouse/
```

## Output Example

```
🚀 Performance Score: 78/100 (CONCERNS)

  LCP:           18/20 (avg 2.1s — good)
  INP:           20/20 (avg 145ms — good)
  TTFB:          12/20 (avg 1.2s — needs improvement) ⚠️
  Bundle:         8/20 (520 KB — too large)             ⚠️
  Resilience:    20/20 (3/3 network-mock pass)

  ⚠️ Top issues:
    1. Bundle 520 KB > 300 KB target for master-data pages
       → code split /admin/* routes
    2. TTFB 1.2s on /products
       → add Redis cache for product list query
```
