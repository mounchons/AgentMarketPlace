export const meta = {
  name: 'plugin-suite-analysis',
  description: 'Analyze 6 plugins: quality, improvements, cross-plugin integration, dotnet-dev best practices',
  phases: [
    { title: 'Analyze', detail: 'one analyst per plugin' },
    { title: 'Verify', detail: 'adversarial verification of high-priority findings' },
    { title: 'Integrate', detail: 'cross-plugin relationship map verified from code' },
    { title: 'DeepDive', detail: 'dotnet-dev vs Microsoft best practices + user style' },
  ],
}

const cfg = typeof args === 'string' ? JSON.parse(args) : args
const ROOT = cfg.root
const PLUGINS = cfg.plugins
const MARKETPLACE = cfg.marketplace
const BASELINE = cfg.baseline

const ANALYSIS = {
  type: 'object',
  required: ['plugin', 'summary', 'strengths', 'issues', 'improvements', 'integration_points'],
  properties: {
    plugin: { type: 'string' },
    version: { type: 'string' },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'detail', 'severity'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: { type: 'string' },
        },
      },
    },
    improvements: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'detail', 'priority'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string', enum: ['small', 'medium', 'large'] },
        },
      },
    },
    integration_points: {
      type: 'array',
      items: {
        type: 'object',
        required: ['target', 'mechanism', 'status'],
        properties: {
          target: { type: 'string' },
          mechanism: { type: 'string' },
          status: { type: 'string', enum: ['working', 'partial', 'broken', 'unverified'] },
          evidence: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT = {
  type: 'object',
  required: ['valid', 'reasoning'],
  properties: {
    valid: { type: 'boolean' },
    reasoning: { type: 'string' },
    correction: { type: 'string' },
  },
}

const INTEGRATION = {
  type: 'object',
  required: ['map', 'gaps', 'recommendations'],
  properties: {
    map: {
      type: 'array',
      items: {
        type: 'object',
        required: ['from', 'to', 'mechanism', 'status'],
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          mechanism: { type: 'string' },
          status: { type: 'string', enum: ['working', 'partial', 'broken', 'missing'] },
          evidence: { type: 'string' },
        },
      },
    },
    gaps: { type: 'array', items: { type: 'string' } },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'detail', 'priority'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

const DEEPDIVE = {
  type: 'object',
  required: ['alignment', 'gaps', 'recommendations'],
  properties: {
    alignment: { type: 'array', items: { type: 'string' } },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        required: ['area', 'current', 'recommended'],
        properties: {
          area: { type: 'string' },
          current: { type: 'string' },
          recommended: { type: 'string' },
          source: { type: 'string' },
        },
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'detail', 'priority'],
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

function analystPrompt(p) {
  return `You are a Claude Code plugin quality auditor. Analyze the plugin "${p}" at ${ROOT}/${p} exhaustively.

READ (use Read/Glob/Grep):
1. ${ROOT}/${p}/.claude-plugin/plugin.json (manifest) — if missing, look for plugin.json elsewhere in the plugin dir and flag it
2. README.md
3. ALL files under commands/ (command markdown + frontmatter)
4. ALL skills: skills/*/SKILL.md and any references/ files (note their sizes — token-efficiency matters)
5. hooks/ if present (hooks load into EVERY session — flag anything heavy)
6. The marketplace entry for "${p}" in ${MARKETPLACE} — check version consistency between plugin.json, marketplace.json, and README

EVALUATE against Claude Code plugin best practices:
- plugin.json completeness (name, version, description, author)
- Command quality: clear frontmatter (description, allowed-tools), argument handling, no stale references
- Skill quality: description with concrete trigger phrases (EN+TH), progressive disclosure (SKILL.md lean, details in references/), no monolithic SKILL.md that wastes context
- Hook safety: SessionStart hooks must never block, must be cheap
- Version drift between plugin.json / marketplace.json / README changelog
- Stale or contradictory docs (README describing features that don't exist, or missing newly added commands)
- Duplicated content across commands/skills
- ${'${CLAUDE_PLUGIN_ROOT}'} used for intra-plugin paths where needed

INTEGRATION: find every reference to the other plugins among: ${PLUGINS.filter(x => x !== p).join(', ')} (also flow-discovery, code-review). Look for shared artifact files (feature_list.json, qa-tracker.json, design_doc_list.json, mockup_list.json, .design-docs/, .mockups/), command cross-invocations, and documented workflows. For each, record mechanism + file evidence (path:line) + status: working (both sides reference the same contract), partial (one-sided or version-skewed), broken (references something that no longer exists), unverified.

Known baseline (from a March 2026 scan, may be outdated — verify, do not trust):
${BASELINE}

Report concrete issues (with severity + file evidence) and concrete improvements (with priority + effort). Be specific: name files and what to change. Do not pad with generic advice. Your final output is the structured data only.`
}

function verifyPrompt(p, f) {
  return `You are an adversarial verifier. A plugin auditor made this claim about the Claude Code plugin "${p}" at ${ROOT}/${p}:

KIND: ${f.kind}
TITLE: ${f.title}
DETAIL: ${f.detail}
EVIDENCE CITED: ${f.evidence || '(none)'}

Your job: try to REFUTE it. Read the actual files (Read/Glob/Grep) and check whether the claimed problem/gap actually exists right now in the code. Common false positives: the feature exists in a different file, the doc was already updated, the version drift is intentional, the "missing" integration lives in another plugin's side. Marketplace manifest is at ${MARKETPLACE}.

valid=true ONLY if you confirmed the claim with file evidence. If you cannot confirm it, or it is misleading/already handled, valid=false and explain in 'correction'. Default to valid=false when uncertain.`
}

function integratePrompt(claims) {
  return `You are a cross-plugin integration auditor for a Claude Code plugin marketplace at ${ROOT} (plugins: ${PLUGINS.join(', ')}, plus flow-discovery and code-review).

Six per-plugin analysts reported these integration claims (JSON):
${JSON.stringify(claims, null, 2)}

Baseline dependency graph from a March 2026 brain scan (may be outdated):
${BASELINE}

Your job:
1. VERIFY each claimed edge from the actual code: Grep across ${ROOT} for the shared contracts — feature_list.json, qa-tracker.json, design_doc_list.json, mockup_list.json, .design-docs/, .mockups/, .brain/, command cross-references (/continue, /qa-trace, /nfr-check, /sync-with-qa-tracker, /qa-coverage-check, etc.). Confirm BOTH sides of each contract agree on file names, JSON field names, and IDs (AC-NNN, UC-NNN, feature ids).
2. Find contract mismatches: one plugin writes a field the other never reads, renamed files, version-gated features (e.g. "qa-ui-test v2.5 integration") where the partner plugin is behind.
3. Find missing-but-valuable edges: places where two plugins clearly should hand off but no mechanism exists (e.g. dotnet-dev knowledge not consumed by long-running /continue, brain not auto-saving QA results).
4. Produce: map[] with verified status per edge (working/partial/broken/missing), gaps[] (plain sentences), recommendations[] prioritized.

Be evidence-driven: every status needs a file path. Your final output is the structured data only.`
}

const deepDivePromise = agent(`You are a senior .NET architect auditing the "dotnet-dev" Claude Code plugin at ${ROOT}/dotnet-dev for a developer with this profile:
- Thai developer, builds enterprise apps with ASP.NET Core MVC + Web API, React frontends
- Prefers: Clean Architecture, Repository + Unit of Work patterns, EF Core, .NET Aspire, supports BOTH PostgreSQL and SQL Server
- Wants the plugin to match HIS preferred style ("แบบที่ฉันถนัด") while ALSO following official best practices — where the two conflict, flag it honestly with trade-offs.

STEPS:
1. Read the entire skill: ${ROOT}/dotnet-dev/skills/**/SKILL.md and all references/ files, plus README.md and .claude-plugin/plugin.json (check what MCP servers it bundles).
2. Use ToolSearch to load Microsoft Learn MCP tools (query "select:mcp__plugin_dotnet-dev_microsoft-learn__microsoft_docs_search,mcp__plugin_dotnet-dev_microsoft-learn__microsoft_docs_fetch") and verify the skill's guidance against CURRENT official docs (today is June 2026 — .NET 10 is the current LTS, EF Core 10, Aspire 9.x+). Check at minimum: target framework versions the skill recommends, EF Core patterns (AsNoTracking, query splitting, compiled queries, bulk updates ExecuteUpdate/ExecuteDelete), whether generic Repository/UoW over EF Core is still recommended practice and how to do it WELL if the user insists on it, Aspire setup currency, minimal APIs vs MVC guidance, DI/options patterns, nullable reference types, TimeProvider, keyed services, HybridCache.
3. Assess skill STRUCTURE too: is SKILL.md progressive-disclosure friendly or a monolith? Are there missing reference files the user's workflow needs (e.g. testing strategy xUnit+Testcontainers, API versioning, auth/JWT, React+ASP.NET integration, deployment)?
4. Output: alignment[] (where the skill already matches the user's style), gaps[] (area / what skill currently says / what it should say, with doc source), recommendations[] prioritized — concrete edits to the plugin, not generic advice.`, { label: 'dotnet-deepdive', phase: 'DeepDive', schema: DEEPDIVE })

const results = await pipeline(
  PLUGINS,
  p => agent(analystPrompt(p), { label: `analyze:${p}`, phase: 'Analyze', schema: ANALYSIS }),
  (analysis, p) => {
    if (!analysis) return null
    const candidates = []
    for (const i of analysis.issues || []) {
      if (i.severity === 'critical' || i.severity === 'high') candidates.push({ kind: 'issue', ...i })
    }
    for (const i of analysis.improvements || []) {
      if (i.priority === 'high') candidates.push({ kind: 'improvement', ...i })
    }
    const toVerify = candidates.slice(0, 5)
    if (toVerify.length === 0) return { plugin: p, analysis, verdicts: [] }
    return parallel(toVerify.map(f => () =>
      agent(verifyPrompt(p, f), { label: `verify:${p}:${(f.title || '').slice(0, 40)}`, phase: 'Verify', schema: VERDICT })
        .then(v => ({ claim: f, verdict: v }))
    )).then(vs => ({ plugin: p, analysis, verdicts: vs.filter(Boolean) }))
  }
)

const valid = results.filter(Boolean)
log(`Analyzed ${valid.length}/${PLUGINS.length} plugins; verifying integration map`)

const claims = valid.map(r => ({ plugin: r.plugin, integration_points: r.analysis.integration_points }))
const integration = await agent(integratePrompt(claims), { label: 'integration-map', phase: 'Integrate', schema: INTEGRATION })
const deepDive = await deepDivePromise

return { analyses: valid, integration, deepDive }