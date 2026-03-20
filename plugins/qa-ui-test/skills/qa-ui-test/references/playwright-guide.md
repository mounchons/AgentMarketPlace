# Playwright test generation guide

Patterns and conventions for generating Playwright test scripts from scenarios.

## Project setup

If no Playwright project exists, initialize one:

```bash
# Initialize Playwright project
npm init playwright@latest -- --yes --quiet --browser=chromium
# Install all browsers for cross-browser testing
npx playwright install
```

Required `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 60_000,
  retries: 1,
  workers: 1, // Sequential for screenshot consistency
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});
```

## Test file structure

One file per scenario. File name matches scenario ID:

```
tests/
├── pages/                    # Page Object Models
│   ├── login.page.ts
│   ├── register.page.ts
│   └── checkout.page.ts
├── fixtures/                 # Test data
│   ├── login-data.json
│   └── checkout-data.json
├── helpers/
│   ├── screenshot.helper.ts  # Screenshot utility
│   └── report.helper.ts      # Report generator
├── TS-LOGIN-001.spec.ts
├── TS-LOGIN-002.spec.ts
└── TS-CHECKOUT-001.spec.ts
```

## Page Object Model pattern

Always create a POM for pages with more than 3 interactive elements:

```typescript
// tests/pages/login.page.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Prefer data-testid > role > CSS selector
    this.emailInput = page.getByTestId('email') 
      .or(page.getByRole('textbox', { name: /email/i }))
      .or(page.locator('input[type="email"], input[name="email"]'));
    this.passwordInput = page.getByTestId('password')
      .or(page.getByRole('textbox', { name: /password/i }))
      .or(page.locator('input[type="password"]'));
    this.submitButton = page.getByTestId('submit')
      .or(page.getByRole('button', { name: /log ?in|sign ?in|submit|เข้าสู่ระบบ/i }));
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"]');
    this.successMessage = page.locator('.success, .alert-success');
  }

  async navigate(url?: string) {
    await this.page.goto(url || '/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
    // Wait for either navigation or error to appear
    await Promise.race([
      this.page.waitForURL('**/dashboard**', { timeout: 5000 }).catch(() => {}),
      this.errorMessage.waitFor({ timeout: 5000 }).catch(() => {}),
    ]);
  }

  async getErrorText(): Promise<string> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }
}
```

## Screenshot helper

Use this helper for consistent screenshot capture with structured output:

```typescript
// tests/helpers/screenshot.helper.ts
import { type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotHelper {
  private page: Page;
  private scenarioId: string;
  private runNumber: number;
  private stepCount: number = 0;
  private outputDir: string;

  constructor(page: Page, scenarioId: string) {
    this.page = page;
    this.scenarioId = scenarioId;
    this.runNumber = this.getNextRunNumber();
    this.outputDir = path.join(
      'test-results', scenarioId, `run-${String(this.runNumber).padStart(3, '0')}`, 'screenshots'
    );
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  private getNextRunNumber(): number {
    const scenarioDir = path.join('test-results', this.scenarioId);
    if (!fs.existsSync(scenarioDir)) return 1;
    const runs = fs.readdirSync(scenarioDir)
      .filter(d => d.startsWith('run-'))
      .map(d => parseInt(d.replace('run-', ''), 10))
      .filter(n => !isNaN(n));
    return runs.length > 0 ? Math.max(...runs) + 1 : 1;
  }

  async capture(description: string): Promise<string> {
    this.stepCount++;
    const filename = `${String(this.stepCount).padStart(2, '0')}-${this.slugify(description)}.png`;
    const filepath = path.join(this.outputDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: false });
    return filepath;
  }

  async captureFullPage(description: string): Promise<string> {
    this.stepCount++;
    const filename = `${String(this.stepCount).padStart(2, '0')}-${this.slugify(description)}-full.png`;
    const filepath = path.join(this.outputDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  getRunDir(): string {
    return path.dirname(this.outputDir);
  }

  getRunNumber(): number {
    return this.runNumber;
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 40);
  }
}
```

## Report helper

Generate structured test reports after each run:

```typescript
// tests/helpers/report.helper.ts
import * as fs from 'fs';
import * as path from 'path';

interface StepResult {
  step: number;
  action: string;
  status: 'pass' | 'fail' | 'skip';
  screenshot?: string;
  error?: string;
  duration_ms: number;
}

interface TestReport {
  scenarioId: string;
  runNumber: number;
  startedAt: string;
  completedAt: string;
  status: 'pass' | 'fail';
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  duration_ms: number;
  steps: StepResult[];
  environment: {
    browser: string;
    baseUrl: string;
    viewport: string;
  };
}

export class ReportHelper {
  private report: TestReport;
  private startTime: number;

  constructor(scenarioId: string, runNumber: number, browser: string, baseUrl: string) {
    this.startTime = Date.now();
    this.report = {
      scenarioId,
      runNumber,
      startedAt: new Date().toISOString(),
      completedAt: '',
      status: 'pass',
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      duration_ms: 0,
      steps: [],
      environment: { browser, baseUrl, viewport: '1280x720' },
    };
  }

  addStep(step: number, action: string, status: 'pass' | 'fail' | 'skip',
          screenshot?: string, error?: string, duration_ms: number = 0) {
    this.report.steps.push({ step, action, status, screenshot, error, duration_ms });
    this.report.totalSteps++;
    if (status === 'pass') this.report.passedSteps++;
    if (status === 'fail') {
      this.report.failedSteps++;
      this.report.status = 'fail';
    }
  }

  save(outputDir: string) {
    this.report.completedAt = new Date().toISOString();
    this.report.duration_ms = Date.now() - this.startTime;

    // Save JSON report
    fs.writeFileSync(
      path.join(outputDir, 'test-report.json'),
      JSON.stringify(this.report, null, 2)
    );

    // Save markdown report
    const md = this.toMarkdown();
    fs.writeFileSync(path.join(outputDir, 'test-report.md'), md);
  }

  private toMarkdown(): string {
    const r = this.report;
    const statusIcon = r.status === 'pass' ? 'PASS ✅' : 'FAIL ❌';
    let md = `# Test report: ${r.scenarioId} — Run #${r.runNumber}\n\n`;
    md += `| Field | Value |\n|---|---|\n`;
    md += `| **Status** | ${statusIcon} |\n`;
    md += `| **Started** | ${r.startedAt} |\n`;
    md += `| **Duration** | ${r.duration_ms}ms |\n`;
    md += `| **Browser** | ${r.environment.browser} |\n`;
    md += `| **Steps** | ${r.passedSteps}/${r.totalSteps} passed |\n\n`;
    md += `## Steps\n\n`;
    md += `| # | Action | Status | Screenshot | Error |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const s of r.steps) {
      const icon = s.status === 'pass' ? '✅' : s.status === 'fail' ? '❌' : '⏭️';
      const img = s.screenshot ? `![](${s.screenshot})` : '—';
      md += `| ${s.step} | ${s.action} | ${icon} | ${img} | ${s.error || '—'} |\n`;
    }
    return md;
  }
}
```

## Test script template

Every generated test follows this pattern:

```typescript
// tests/TS-LOGIN-001.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ScreenshotHelper } from './helpers/screenshot.helper';
import { ReportHelper } from './helpers/report.helper';
import testData from './fixtures/login-data.json';

const SCENARIO_ID = 'TS-LOGIN-001';

test.describe(`${SCENARIO_ID}: Login with valid credentials`, () => {
  let loginPage: LoginPage;
  let screenshots: ScreenshotHelper;
  let report: ReportHelper;

  test.beforeEach(async ({ page, browserName }) => {
    loginPage = new LoginPage(page);
    screenshots = new ScreenshotHelper(page, SCENARIO_ID);
    report = new ReportHelper(
      SCENARIO_ID,
      screenshots.getRunNumber(),
      browserName,
      page.url() || testData.environment.baseUrl
    );
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const t0 = Date.now();

    // Step 1: Navigate
    await loginPage.navigate();
    await screenshots.capture('navigate-to-login');
    report.addStep(1, 'Navigate to login page', 'pass',
      undefined, undefined, Date.now() - t0);

    // Step 2: Fill email
    const t1 = Date.now();
    await loginPage.fillEmail(testData.fixtures.validUser.email);
    await screenshots.capture('fill-email');
    report.addStep(2, `Fill email: ${testData.fixtures.validUser.email}`, 'pass',
      undefined, undefined, Date.now() - t1);

    // Step 3: Fill password
    const t2 = Date.now();
    await loginPage.fillPassword(testData.fixtures.validUser.password);
    await screenshots.capture('fill-password');
    report.addStep(3, 'Fill password', 'pass',
      undefined, undefined, Date.now() - t2);

    // Step 4: Submit
    const t3 = Date.now();
    await screenshots.capture('before-submit');
    await loginPage.submit();
    await screenshots.capture('after-submit');

    // Step 5: Verify
    try {
      await expect(page).toHaveURL(/dashboard/);
      report.addStep(4, 'Submit and verify redirect', 'pass',
        undefined, undefined, Date.now() - t3);
    } catch (error) {
      await screenshots.capture('verification-failed');
      report.addStep(4, 'Submit and verify redirect', 'fail',
        undefined, String(error), Date.now() - t3);
      throw error;
    }

    // Save report
    report.save(screenshots.getRunDir());
  });
});
```

## Selector strategy priority

When generating selectors for unknown pages, try in this order:

1. `data-testid` attribute: `page.getByTestId('login-email')`
2. ARIA role + name: `page.getByRole('textbox', { name: /email/i })`
3. Label association: `page.getByLabel('Email')`
4. Placeholder text: `page.getByPlaceholder('Enter email')`
5. Visible text: `page.getByText('Submit')`
6. CSS selector: `page.locator('input[name="email"]')`
7. XPath (last resort): `page.locator('//input[@id="email"]')`

For Thai-language UIs, include Thai text in role/label matchers:
```typescript
page.getByRole('button', { name: /เข้าสู่ระบบ|Login/i })
page.getByLabel(/อีเมล|Email/i)
```

## Multi-step flow pattern

For complex multi-step pages (wizards, checkout, multi-part forms):

```typescript
test.describe('TS-CHECKOUT: Full checkout flow', () => {
  test('complete 3-step checkout', async ({ page }) => {
    const screenshots = new ScreenshotHelper(page, 'TS-CHECKOUT-FULL');

    // Stage 1: Cart
    await test.step('Stage 1: Review cart', async () => {
      await page.goto('/cart');
      await screenshots.capture('cart-review');
      await expect(page.getByTestId('cart-total')).toBeVisible();
      await page.getByRole('button', { name: /proceed|ดำเนินการ/i }).click();
    });

    // Stage 2: Shipping
    await test.step('Stage 2: Fill shipping', async () => {
      await page.waitForURL('**/shipping**');
      await screenshots.capture('shipping-form-empty');
      await page.getByLabel(/name|ชื่อ/i).fill('ทดสอบ สกุล');
      await page.getByLabel(/address|ที่อยู่/i).fill('123 ถ.ทดสอบ');
      await page.getByLabel(/phone|โทร/i).fill('0812345678');
      await screenshots.capture('shipping-form-filled');
      await page.getByRole('button', { name: /next|ถัดไป/i }).click();
    });

    // Stage 3: Payment
    await test.step('Stage 3: Payment', async () => {
      await page.waitForURL('**/payment**');
      await screenshots.capture('payment-page');
      await page.getByLabel(/card|บัตร/i).fill('4111111111111111');
      await screenshots.capture('payment-filled');
      await page.getByRole('button', { name: /pay|ชำระ/i }).click();
      await expect(page.getByText(/success|สำเร็จ/i)).toBeVisible();
      await screenshots.capture('payment-success');
    });
  });
});
```

## Running tests

```bash
# Run a specific scenario
npx playwright test TS-LOGIN-001

# Run all scenarios for a module
npx playwright test TS-LOGIN

# Run with UI mode (visual debugging)
npx playwright test --ui

# Run headed (see the browser)
npx playwright test --headed

# Generate HTML report
npx playwright show-report
```
