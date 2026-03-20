#!/usr/bin/env node
/**
 * QA UI Test - Project Setup Script
 * Initializes Playwright project with QA-standard directory structure.
 * Usage: node setup.js [--base-url http://localhost:3000]
 */
const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const baseUrlIdx = args.indexOf('--base-url');
const baseUrl = baseUrlIdx >= 0 ? args[baseUrlIdx + 1] : 'http://localhost:3000';

console.log('QA UI Test — Setting up project...\n');

['tests/pages','tests/fixtures','tests/helpers','test-data','test-results','test-scenarios']
  .forEach(dir => { fs.mkdirSync(dir, { recursive: true }); console.log('  Created ' + dir); });

if (!fs.existsSync('package.json')) execSync('npm init -y', { stdio: 'pipe' });

console.log('\nInstalling Playwright...');
try {
  execSync('npm install -D @playwright/test', { stdio: 'inherit' });
  execSync('npx playwright install chromium', { stdio: 'inherit' });
} catch(e) {
  console.error('Failed to install. Run: npm i -D @playwright/test && npx playwright install');
}

const exampleData = {
  scenarioId: 'TS-LOGIN-001',
  description: 'Login with valid and invalid credentials',
  fixtures: {
    validUser: { email: 'test@example.com', password: 'P@ssw0rd123' },
    invalidUser: { email: 'wrong@example.com', password: 'wrongpass' },
  },
  environment: { baseUrl, browser: 'chromium' },
};
fs.writeFileSync('test-data/TS-LOGIN-001.json', JSON.stringify(exampleData, null, 2));

console.log('\nSetup complete! Base URL: ' + baseUrl);
console.log('Next: Ask Claude to "create test scenarios for {your page}"');
