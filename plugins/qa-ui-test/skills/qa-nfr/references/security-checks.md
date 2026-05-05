# Security Checks

ประเมิน security posture — header config + auth flow + secret leaks + scenario coverage

**⚠️ Special rule:** ถ้า security < 75 → overall NFR = FAIL (security เป็น hard floor)

## Inputs

- **qa-tracker scenarios** ที่มี `complexity_factors` รวม `security-flow`
- **Playwright traces** — response headers, cookies, request bodies
- **Page HTML** — ตรวจ secrets/tokens ที่ leak ใน DOM
- **Lighthouse security audits** (ถ้า `--deep`)

## 5 Security Metrics (each 20 points → 100 total)

### 1. Security Headers — 20 points

ตรวจ HTTP response headers ของ public URLs:

| Header | Required | Points |
|---|---|---|
| `Content-Security-Policy` | yes | 5 |
| `X-Frame-Options` หรือ CSP `frame-ancestors` | yes | 4 |
| `Strict-Transport-Security` (HTTPS) | yes (prod) | 4 |
| `X-Content-Type-Options: nosniff` | yes | 3 |
| `Referrer-Policy` | yes | 2 |
| `Permissions-Policy` | recommended | 2 |

**How to measure:**

Playwright fixture pattern:
```
Subscribe to page response events on baseURL.
For each response, read headers.
Check presence of each required header → award points.
```

หรือ static check:
```bash
curl -sI http://localhost:3000 | grep -iE 'csp|frame|hsts|nosniff|referrer'
```

### 2. Auth Coverage — 20 points

วัดว่า auth-related scenarios ครอบ attack vectors แค่ไหน:

| Coverage | Points |
|---|---|
| Login + logout | 3 |
| Invalid credentials handling | 3 |
| Rate limiting / brute force protection | 3 |
| Session expiry / token refresh | 3 |
| CSRF token validation | 3 |
| Password reset flow | 2 |
| MFA (ถ้ามี) | 3 |

**Auto-detect:**
```
auth_scenarios = scenarios where module IN [LOGIN, AUTH, AUTHENTICATION]
                 OR 'security-flow' IN complexity_factors

score = sum points for each attack vector covered
```

### 3. Common Vulnerabilities Coverage — 20 points

จำนวน OWASP Top 10 vulnerabilities ที่มี scenario ครอบ:

| Vulnerability | Scenario hint | Points |
|---|---|---|
| XSS | input field with script-tag payload | 4 |
| SQL Injection | input field with `'`, `OR 1=1`, `; DROP` | 4 |
| CSRF | scenario verify CSRF token requirement | 4 |
| IDOR | role-based access scenario verify forbidden URL | 4 |
| Open Redirect | redirect param manipulation | 2 |
| Sensitive data exposure | DOM/localStorage scan | 2 |

**Auto-detect:**
```
จาก qa-tracker scenarios:
xss_covered = any(scenario.title contains "XSS")
sqli_covered = any(scenario.title contains "SQL injection")
csrf_covered = any('csrf' in scenario.title.lower())
idor_covered = any(scenario.type == "role-access" with status=denied)
```

### 4. Secret Leaks in DOM — 20 points

ตรวจ Playwright traces หา patterns ที่บ่งบอกว่ามี secret leak:

| Pattern (regex) | Penalty per occurrence |
|---|---|
| `Authorization: Bearer ey[A-Za-z0-9-_]+` ใน HTML body | -5 |
| `api_key=[A-Za-z0-9]{20,}` ใน HTML body | -5 |
| AWS keys (`AKIA[A-Z0-9]{16}`) | -10 (immediate fail) |
| `password=...` ใน URL | -8 |
| Stack trace ที่เผยทาง file path ของ server | -3 |
| DB connection string | -10 (immediate fail) |

**Start: 20 points, ลดตาม occurrences. Floor: 0**

```bash
# Static scan ใน traces
for trace in test-results/*/run-*/trace.zip; do
  unzip -p "$trace" | grep -E "Bearer ey|AKIA[A-Z0-9]{16}|password=" --count
done
```

### 5. Token / Cookie Hygiene — 20 points

ตรวจ properties ของ auth cookies + tokens:

| Property | Required | Points |
|---|---|---|
| Cookies have `HttpOnly` flag | yes | 5 |
| Cookies have `Secure` flag (HTTPS) | yes | 5 |
| Cookies have `SameSite=Strict` หรือ `Lax` | yes | 4 |
| Token expiration < 24h (refresh model) | yes | 3 |
| Logout clears tokens (verified by scenario) | yes | 3 |

**How to measure (Playwright):**
```
Get cookies from browser context.
Filter to auth-related cookie (name matches /auth|session|token/i).
Check httpOnly, secure, sameSite properties → award points.
```

## Aggregation

```
total_security_score = headers + auth + vulns + secrets + tokens
```

## Common Issues + Fixes

| Issue | Fix recommendation |
|---|---|
| No CSP header | Add `Content-Security-Policy: default-src 'self'` to web.config / nginx.conf |
| No CSRF coverage | Add scenario: `TS-{MODULE}-CSRF: submit form without token → expect 403` |
| Secret leak: API key in HTML | ย้าย API call ไป server-side, ใช้ session cookie |
| No XSS scenarios | Add scenarios with image-tag onerror payload |
| Cookie missing HttpOnly | Server config: `Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict` |
| MFA not tested (auth-flow factor) | Add scenario: `TS-LOGIN-MFA: invalid OTP → expect re-prompt` |

## Special: Critical Security Failures

ถ้าเจอ patterns เหล่านี้ → **immediate FAIL** (overall = 0):
- AWS access keys ใน HTML/JS
- DB connection strings ใน DOM
- Dynamic code execution of user input (Function constructor, setTimeout-with-string, etc.)
- Plain-text passwords ใน localStorage / sessionStorage
- Missing auth check บน admin pages (verified by role-access scenario)

```
🛑 SECURITY FAIL — Critical issue detected:
   Module: PAYMENT
   Issue: AWS access key found in trace test-results/TS-PAY-001/run-002/trace.zip
   Pattern: AKIA[REDACTED]
   → STOP RELEASE — fix before any other action
```

## Output Example

```
🔒 Security Score: 72/100 (CONCERNS — security floor triggered: overall = FAIL)

  Headers:        12/20 (missing CSP, X-Frame-Options on 2 routes)  ⚠️
  Auth coverage:  17/20 (no rate limiting scenario)                  ⚠️
  Vulns coverage: 16/20 (no IDOR scenario for /admin/*)              ⚠️
  Secret scan:    20/20 (clean)
  Token hygiene:   7/20 (cookies missing HttpOnly + SameSite)        🚨

  🚨 Critical:
    1. Auth cookies leak via JS — add HttpOnly to /api/auth/login response
    2. No CSP header — XSS protection ขาดหาย → add to web.config

  💡 Add scenarios:
    - TS-AUTH-RATELIMIT: 100 invalid logins → expect 429
    - TS-ADMIN-IDOR-001: viewer role access /admin/users → expect 403
```
