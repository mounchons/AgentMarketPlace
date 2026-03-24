#!/usr/bin/env node
/**
 * QA UI Test - Summary Report Generator
 * Scans test-results/ and generates a cross-scenario summary report.
 * Usage: node generate-summary.js [--output test-results/summary-report.md]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const outputIdx = args.indexOf('--output');
const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : 'test-results/summary-report.md';
const resultsDir = 'test-results';

if (!fs.existsSync(resultsDir)) {
  console.error('No test-results/ directory found. Run tests first.');
  process.exit(1);
}

const scenarios = fs.readdirSync(resultsDir)
  .filter(d => d.startsWith('TS-') && fs.statSync(path.join(resultsDir, d)).isDirectory());

if (scenarios.length === 0) {
  console.error('No scenario results found in test-results/');
  process.exit(1);
}

const results = [];
const moduleStats = {};

for (const scenarioId of scenarios) {
  const scenarioDir = path.join(resultsDir, scenarioId);
  const runs = fs.readdirSync(scenarioDir)
    .filter(d => d.startsWith('run-'))
    .sort()
    .reverse();

  if (runs.length === 0) continue;

  const latestRun = runs[0];
  const reportPath = path.join(scenarioDir, latestRun, 'test-report.json');

  if (!fs.existsSync(reportPath)) continue;

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const module = scenarioId.split('-')[1] || 'UNKNOWN';

    results.push({
      scenarioId,
      module,
      status: report.status,
      runNumber: report.runNumber,
      totalRuns: runs.length,
      passedSteps: report.passedSteps,
      totalSteps: report.totalSteps,
      duration_ms: report.duration_ms,
      error: report.steps?.find(s => s.status === 'fail')?.error || null,
      failedStep: report.steps?.find(s => s.status === 'fail')?.action || null,
    });

    if (!moduleStats[module]) moduleStats[module] = { total: 0, passed: 0, failed: 0 };
    moduleStats[module].total++;
    if (report.status === 'pass') moduleStats[module].passed++;
    else moduleStats[module].failed++;
  } catch (e) {
    console.warn(`  Warning: Could not parse ${reportPath}`);
  }
}

const totalScenarios = results.length;
const totalPassed = results.filter(r => r.status === 'pass').length;
const totalFailed = results.filter(r => r.status === 'fail').length;
const totalDuration = results.reduce((sum, r) => sum + (r.duration_ms || 0), 0);
const passRate = totalScenarios > 0 ? ((totalPassed / totalScenarios) * 100).toFixed(1) : '0.0';

let md = `# QA UI test summary report\n\n`;
md += `| Field | Value |\n|---|---|\n`;
md += `| **Generated** | ${new Date().toISOString()} |\n`;
md += `| **Total scenarios** | ${totalScenarios} |\n`;
md += `| **Passed** | ${totalPassed} |\n`;
md += `| **Failed** | ${totalFailed} |\n`;
md += `| **Pass rate** | ${passRate}% |\n`;
md += `| **Total duration** | ${(totalDuration / 1000).toFixed(1)}s |\n\n`;

md += `## Results by module\n\n`;
md += `| Module | Total | Passed | Failed | Rate |\n|---|---|---|---|---|\n`;
for (const [mod, stats] of Object.entries(moduleStats)) {
  const rate = ((stats.passed / stats.total) * 100).toFixed(0);
  md += `| ${mod} | ${stats.total} | ${stats.passed} | ${stats.failed} | ${rate}% |\n`;
}

const failed = results.filter(r => r.status === 'fail');
if (failed.length > 0) {
  md += `\n## Failed scenarios\n\n`;
  for (const f of failed) {
    md += `### ${f.scenarioId}\n`;
    md += `- **Latest run**: #${f.runNumber} (${f.totalRuns} total runs)\n`;
    md += `- **Failed at**: ${f.failedStep || 'Unknown step'}\n`;
    md += `- **Error**: ${f.error || 'No error message captured'}\n\n`;
  }
}

md += `## All scenarios\n\n`;
md += `| Scenario | Module | Status | Steps | Duration | Runs |\n|---|---|---|---|---|---|\n`;
for (const r of results) {
  const icon = r.status === 'pass' ? 'PASS' : 'FAIL';
  md += `| ${r.scenarioId} | ${r.module} | ${icon} | ${r.passedSteps}/${r.totalSteps} | ${r.duration_ms}ms | ${r.totalRuns} |\n`;
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, md);
console.log(`Summary report generated: ${outputPath}`);
console.log(`  ${totalScenarios} scenarios: ${totalPassed} passed, ${totalFailed} failed (${passRate}%)`);
