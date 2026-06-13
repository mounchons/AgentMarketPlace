---
description: Interactive brainstorming and Q&A session for system design
allowed-tools: Read(*), Write(*), Bash(*), Glob(*), Grep(*), WebSearch(*)
---

# Brainstorm Design — Interactive Discovery Session

Interactive brainstorming and Q&A to gather comprehensive system requirements before creating a design document.

## ⚠️ CRITICAL RULES (MUST FOLLOW)

1. **Complete ALL 8 phases** — never skip or abbreviate any phase
2. **Confirm before proceeding** — display summary and get user confirmation after each phase
3. **Save brainstorm file** — always save results to `.design-docs/brainstorm-[name].md`
4. **Ask, don't assume** — when uncertain about requirements, ask the user rather than guessing
5. **No design document creation** — this command only gathers requirements, it does NOT create the design doc

### 🔍 Self-Check Checklist (MANDATORY before submitting output)

- [ ] All 8 phases completed?
- [ ] User confirmed summary at end of each phase?
- [ ] Brainstorm file saved to `.design-docs/brainstorm-[name].md`?
- [ ] All entities identified with complexity classification?
- [ ] All user roles identified with permission levels?
- [ ] Architecture approach selected or confirmed?
- [ ] No assumptions made without user input?

If ANY checkbox is unchecked, DO NOT submit. Fix the issue first.

### ❌ Output Rejection Criteria

Your output will be REJECTED if: any phase was skipped, brainstorm file not saved, or entities/roles not identified.

### ⚠️ Penalty

Violating these rules means the brainstorm output is INVALID. You must redo from scratch.

---

## Usage

```
/brainstorm-design
/brainstorm-design [system-name]
/brainstorm-design ระบบจัดการ HR
```

---

## Step 0: Setup

```bash
# Create .design-docs folder if not exists
mkdir -p .design-docs

# Check for existing brainstorm files
ls -la .design-docs/brainstorm-*.md 2>/dev/null
```

**If existing brainstorm found:**
```
📋 Found existing brainstorm: brainstorm-[name].md
   Do you want to:
   1. Continue from existing brainstorm
   2. Start fresh (existing will be backed up)
```

---

## Phase 1: Requirements Discovery

**Ask the user:**

```
🧠 Phase 1: Requirements Discovery

Let's start by understanding the system you want to build.

1. System Name: What should this system be called?
2. Problem Statement: What problem does this system solve?
3. Primary Users: Who will use this system?
4. Scope:
   - IN scope: What features/capabilities are included?
   - OUT of scope: What is explicitly excluded?
5. User Roles: List all user roles and their permission levels
   (e.g., Super Admin, Admin, Manager, Employee, Guest)
6. Core Features: What are the top 5-7 must-have features?
7. Data Sources: Where does data come from? (user input, APIs, databases, files)
```

**Display summary → confirm before next phase:**

```
📋 Phase 1 Summary:
   System: [name]
   Problem: [statement]
   Users: [count] roles identified
   Scope: [count] features in scope

   ✅ Confirm and proceed to Phase 2? (or suggest changes)
```

---

## Phase 2: Competitor/Reference Analysis

**Ask the user:**

```
🔍 Phase 2: Competitor/Reference Analysis

Are there similar systems or references we can learn from?

1. Reference Systems: Any existing systems that do something similar?
   (e.g., "like Jira but for...", "similar to Shopify's...")
2. Strengths: What do those systems do well?
3. Weaknesses: What could be improved?
4. Differentiation: How should your system be different?
5. Features to Adopt: What specific features should we borrow?
```

**Display comparison summary:**

```
📊 Reference Comparison:
   ┌──────────────────┬─────────────────┬─────────────────┐
   │ Feature          │ Reference       │ Our System      │
   ├──────────────────┼─────────────────┼─────────────────┤
   │ [Feature 1]      │ [How they do]   │ [How we'll do]  │
   │ [Feature 2]      │ [How they do]   │ [How we'll do]  │
   └──────────────────┴─────────────────┴─────────────────┘

   ✅ Confirm and proceed to Phase 3?
```

---

## Phase 3: Architecture Brainstorming

**Propose 2-3 approaches:**

```
🏗️ Phase 3: Architecture Brainstorming

Based on your requirements, here are architecture options:

Option A: [Architecture Name]
   Pros: [list]
   Cons: [list]
   Complexity: [Low/Medium/High]
   Best for: [scenario]
   Technology: [suggestions]

Option B: [Architecture Name]
   Pros: [list]
   Cons: [list]
   Complexity: [Low/Medium/High]
   Best for: [scenario]
   Technology: [suggestions]

Option C: [Architecture Name]
   Pros: [list]
   Cons: [list]
   Complexity: [Low/Medium/High]
   Best for: [scenario]
   Technology: [suggestions]

Which option do you prefer? (or combine elements from multiple options)
```

**Wait for user selection → confirm.**

---

## Phase 4: Entity & Relationship Discovery

**Guide through entity identification:**

```
📦 Phase 4: Entity & Relationship Discovery

Let's identify the "things" in your system.

1. Core Entities: What are the main objects/things your system manages?
   (e.g., User, Order, Product, Department, etc.)

For each entity:
2. Key Attributes: What are the important fields? (approximate count)
3. Relationships: How do entities relate to each other?
   - 1:1 (one-to-one)
   - 1:N (one-to-many)
   - M:N (many-to-many)
4. CRUD Operations: Which operations are needed?
   - Create ✅/❌
   - Read ✅/❌
   - Update ✅/❌
   - Delete: soft (deactivate) / hard (permanent) / ❌
5. Complexity Classification:
   - Simple: < 10 fields, no complex relations → Modal UI pattern
   - Complex: >= 10 fields or complex relations → Page UI pattern
```

**Display entity summary table:**

```
📊 Entity Summary:
   ┌──────────────┬────────┬────────────┬───────┬──────────┬──────────────┐
   │ Entity       │ Fields │ Complexity │ CRUD  │ Delete   │ Relationships│
   ├──────────────┼────────┼────────────┼───────┼──────────┼──────────────┤
   │ User         │ ~15    │ complex    │ CRUD  │ soft     │ 1:N Dept     │
   │ Department   │ ~5     │ simple     │ CRUD  │ soft     │ 1:N User     │
   │ AuditLog     │ ~8     │ simple     │ R     │ none     │ N:1 User     │
   └──────────────┴────────┴────────────┴───────┴──────────┴──────────────┘

   ✅ Confirm and proceed to Phase 5?
```

---

## Phase 5: NFR Discovery (Non-Functional Requirements)

**Ask about each category:**

```
⚡ Phase 5: Non-Functional Requirements

1. Performance:
   - Expected concurrent users: [number]
   - Expected response time: [ms]
   - Expected throughput: [requests/sec]

2. Security:
   - Authentication: [JWT / OAuth2 / Session / SAML]
   - Authorization: [RBAC / ABAC / Custom]
   - Data encryption: [at rest? in transit?]
   - Compliance: [PDPA / GDPR / HIPAA / none]

3. Scalability:
   - Growth expectations: [users/year]
   - Scaling strategy: [horizontal / vertical]

4. Availability:
   - Uptime requirement: [99% / 99.9% / 99.99%]
   - Disaster recovery: [RTO/RPO targets]
   - Backup strategy: [frequency]

5. Other:
   - Logging/Monitoring requirements
   - Internationalization (i18n)
   - Accessibility (a11y)
```

**Display NFR summary → confirm.**

---

## Phase 6: Integration Discovery

**Ask about external systems:**

```
🔌 Phase 6: Integration Discovery

1. External Systems: What systems does this connect to?
   (APIs, databases, 3rd party services, legacy systems)

For each integration:
2. Authentication: How to authenticate? (OAuth, API key, certificate)
3. Data Flow: Which direction?
   - Inbound (receive data)
   - Outbound (send data)
   - Bidirectional
4. Sync Strategy:
   - Real-time (webhook, WebSocket)
   - Batch (scheduled sync)
   - Event-driven (message queue)
5. Error Handling: What happens when integration fails?
```

**Display integration map → confirm.**

---

## Phase 7: User Journey Mapping

**For each user role:**

```
🗺️ Phase 7: User Journey Mapping

For each role, let's map their primary journey:

Role: [Role Name]
1. Entry Point: How do they access the system? (login, SSO, public URL)
2. Primary Actions: What do they do most often? (list top 3-5)
3. Key Workflows: Describe the main workflow step by step
4. Exit Points: How do they finish their session?
5. Error Scenarios: What can go wrong? How should the system respond?
6. Cross-Role Interactions: Does this role interact with other roles?
```

**Display journey summary for each role → confirm.**

---

## Phase 8: Risk Assessment & Confirmation

**Identify and assess risks:**

```
⚠️ Phase 8: Risk Assessment & Final Confirmation

Technical Risks:
1. [Risk]: [Impact] / [Probability] → Mitigation: [strategy]
2. [Risk]: [Impact] / [Probability] → Mitigation: [strategy]

Business Risks:
1. [Risk]: [Impact] / [Probability] → Mitigation: [strategy]
2. [Risk]: [Impact] / [Probability] → Mitigation: [strategy]
```

**Display complete brainstorm summary:**

```
📋 COMPLETE BRAINSTORM SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System: [name]
Architecture: [chosen option]
Entities: [count] ([simple count] simple, [complex count] complex)
User Roles: [count]
Integrations: [count]
Key NFRs: [highlights]
Top Risks: [count]

Do you want to:
1. ✅ Confirm and save
2. ✏️ Go back and modify a specific phase
3. ❌ Start over
```

---

## Save Brainstorm File

**Save to `.design-docs/brainstorm-[name].md`:**

```markdown
# Brainstorm: [System Name]

**Created**: [DATE]
**Status**: Confirmed

---

## Phase 1: Requirements
[All Phase 1 findings]

## Phase 2: Reference Analysis
[All Phase 2 findings]

## Phase 3: Architecture
[Chosen architecture with rationale]

## Phase 4: Entities
[Entity table with relationships]

## Phase 5: NFRs
[All non-functional requirements]

## Phase 6: Integrations
[Integration map]

## Phase 7: User Journeys
[Journey maps per role]

## Phase 8: Risks
[Risk assessment table]

---

## Next Steps
- Run `/create-design-doc [system-name]` to generate the full design document
- The design doc will automatically use this brainstorm data
```

---

## Output

```
✅ Brainstorm session complete!

📁 File: .design-docs/brainstorm-[name].md

📊 Summary:
   • System: [name]
   • Architecture: [choice]
   • Entities: [count]
   • User Roles: [count]
   • Integrations: [count]
   • Risks identified: [count]

💡 Next steps:
   • /create-design-doc [name] → Generate full design document (will auto-detect this brainstorm)
   • Review brainstorm file and make adjustments if needed
```

> 💬 **Note**: This command responds in Thai (คำสั่งนี้จะตอบกลับเป็นภาษาไทย)
