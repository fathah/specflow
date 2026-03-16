# SpecFlow — Open-Source Requirement & Architecture Engine for AI Coding Agents

## 1. Project Overview

**Name:** SpecFlow  
**Type:** Open-source, model-agnostic, agent-agnostic developer tool  
**Primary Interface:** CLI-first  
**Core Purpose:** Convert vague project ideas into structured, versioned project intelligence that any AI coding agent can use.

### Core Vision

SpecFlow is **not another coding agent**.  
It is a **specification and architecture layer** that sits on top of existing AI coding tools.

It helps users go from:

> "Build a school management system"

to:

- clarified requirements
- confirmed decisions
- structured project memory
- architecture summary
- modules/entities/workflows
- open questions
- exportable artifacts that tools like Claude Code, Cursor, Antigravity, OpenAI-based agents, and future agents can consume

### Positioning

SpecFlow should be positioned as:

> The missing layer between vague user intent and AI code generation.

Or:

> An open-source requirement-to-architecture engine for AI coding agents.

---

## 2. Goals

### Main Goals

1. Accept a vague project idea from the user.
2. Detect the domain or project type.
3. Ask intelligent follow-up questions dynamically.
4. Store answers as structured project memory.
5. Distinguish between:
   - confirmed requirements
   - inferred assumptions
   - rejected scope
   - deferred features
   - unresolved questions
6. Generate project artifacts that downstream coding agents can use.
7. Be model-agnostic and platform-agnostic.
8. Be extensible so the community can add:
   - more model providers
   - more domains
   - more output formats
   - more integrations

### Non-Goals for v1

1. Do **not** try to become a full autonomous coding agent.
2. Do **not** replace Claude Code / Cursor / other agents.
3. Do **not** build complex cloud collaboration in v1.
4. Do **not** require a hosted SaaS account.
5. Do **not** make code generation the main feature in v1.

---

## 3. Primary Use Cases

### Use Case 1 — New Project Discovery

User runs:

```bash
npx specflow init
```

SpecFlow asks:

- What are you building?
- Is it single-tenant or SaaS?
- Who are the user roles?
- What core modules are required?
- What payment/auth/integration needs exist?
- What is MVP vs future scope?

Then generates a project intelligence folder.

### Use Case 2 — Existing Project Clarification

User already has a repo but wants structured specification.  
SpecFlow can initialize project intelligence and continue requirement discovery.

### Use Case 3 — Agent Augmentation

After SpecFlow produces artifacts, the user can tell another agent:

> Read `.specflow/` as the source of truth and implement the project.

### Use Case 4 — Community Domain Packs

Contributors can add domain packs such as:

- school management
- CRM
- POS
- ERP
- e-commerce
- LMS
- healthcare systems

---

## 4. UX / CLI Experience

## Main CLI Commands

### `specflow init`

Bootstraps SpecFlow in the current project.

Expected behavior:

1. Create `.specflow/`
2. Ask initial questions
3. Detect domain if possible
4. Save initial configuration
5. Generate draft project artifacts

Example:

```bash
npx specflow init
```

Example interaction:

```text
? What are you building?
> school management system

Detected likely domain: education_erp

? Is this for a single institution or multiple institutions (SaaS)?
> single institution

? Which user roles are needed?
> admin, teacher, student, parent

? Which features are definitely required for MVP?
> admissions, attendance, exams, fees
```

### `specflow status`

Shows current project state:

- project summary
- confirmed decisions
- unresolved questions
- inferred assumptions
- deferred items

### `specflow ask`

Continue requirement discovery from the current project state.

It should ask the next highest-value questions based on what is still missing.

### `specflow generate`

Generate or regenerate artifacts such as:

- architecture.md
- modules.md
- entities.md
- open_questions.md
- decisions.json
- prompts/

### `specflow config`

Manage settings such as:

- model provider
- model name
- default output formats
- preferred interaction style
- domain pack settings

### `specflow doctor`

Checks installation, config, provider availability, and project state validity.

### `specflow export`

Export project intelligence in formats useful for agents and humans.

Formats may include:

- markdown
- json
- yaml
- prompt bundles

---

## 5. Installation Expectations

SpecFlow should support:

### Global install

```bash
npm install -g specflow
```

Then:

```bash
specflow init
```

### NPX usage

```bash
npx specflow init
```

This is important because many users will try it without installing globally.

---

## 6. Project Output Structure

When initialized, SpecFlow should create:

```text
.specflow/
  config.json
  project.json
  requirements.json
  decisions.json
  assumptions.json
  open_questions.json
  rejected_scope.json
  deferred_scope.json
  architecture.md
  modules.md
  entities.md
  workflows.md
  prompts/
    implement-project.md
    generate-schema.md
    build-module.md
  logs/
  domains/
```

### Folder Purpose

#### `config.json`
Stores local configuration for provider, model, behavior, and output preferences.

#### `project.json`
High-level project metadata.

#### `requirements.json`
All requirement items with status and metadata.

#### `decisions.json`
Confirmed decisions made by the user or accepted by the project.

#### `assumptions.json`
AI-inferred assumptions not yet confirmed.

#### `open_questions.json`
Important unresolved questions.

#### `rejected_scope.json`
Features intentionally excluded.

#### `deferred_scope.json`
Planned future-phase items.

#### `architecture.md`
Readable architecture summary.

#### `modules.md`
List of system modules with descriptions.

#### `entities.md`
List of likely entities and relationships.

#### `workflows.md`
Key business workflows.

#### `prompts/`
Agent-friendly prompt templates based on the project state.

---

## 7. Canonical Project State

SpecFlow must maintain a **canonical source of truth**.

Every agent interaction and artifact generation should derive from structured state.

### Suggested high-level project state shape

```json
{
  "project": {
    "name": "School Management System",
    "slug": "school-management-system",
    "domain": "education_erp",
    "description": "School ERP for managing students, staff, attendance, exams, and fees",
    "createdAt": "",
    "updatedAt": ""
  },
  "requirements": [],
  "decisions": [],
  "assumptions": [],
  "openQuestions": [],
  "rejectedScope": [],
  "deferredScope": [],
  "modules": [],
  "entities": [],
  "workflows": []
}
```

### Requirement Item Shape

Each requirement item should support fields like:

```json
{
  "id": "req_001",
  "title": "Parent can have multiple children",
  "description": "Parent-child relationship must support one parent linked to multiple students",
  "status": "confirmed",
  "source": "user",
  "domain": "education_erp",
  "tags": ["relationships", "parents", "students"],
  "impacts": ["entities", "workflows", "permissions"],
  "createdAt": "",
  "updatedAt": ""
}
```

### Supported statuses

These statuses are very important:

- `proposed`
- `inferred`
- `confirmed`
- `rejected`
- `deferred`
- `conflicting`

---

## 8. Core Product Principles

### 1. Never re-ask confirmed decisions
If the user already answered something, SpecFlow should not ask it again unless context changed.

### 2. Ask only high-value questions
Do not ask everything at once.  
Ask only what most improves architecture clarity.

### 3. Distinguish fact from suggestion
The tool must clearly label:

- user-confirmed items
- AI suggestions
- inferred assumptions
- unresolved gaps

### 4. Show progress
Users should feel that clarity is increasing as they answer.

### 5. Create artifacts early
Even with partial data, SpecFlow should generate useful draft outputs.

### 6. Work with any agent
All outputs should be readable by humans and AI agents.

### 7. Be transparent
Artifacts should live in the repository and be versionable with Git.

---

## 9. Domain Detection and Domain Packs

SpecFlow should support domain packs.

### Initial supported domains for v1

- generic_saas
- education_erp
- ecommerce
- crm
- pos
- lms

### Domain pack responsibilities

A domain pack can define:

- common modules
- common entities
- recommended workflows
- common edge cases
- question trees
- dependency maps
- best practices

### Example structure

```text
src/domains/
  education_erp/
    manifest.json
    modules.json
    entities.json
    questions.json
    dependencies.json
    best_practices.json
```

### Example for education domain

Possible modules:

- student management
- teacher management
- class/section management
- attendance
- exams/results
- fees/payments
- parent portal
- timetable
- notifications

### Domain Detection

When the user enters a vague idea, SpecFlow should infer likely domain candidates.

Example:

Input:
> create a school management system

Potential output:
- education_erp (high confidence)
- generic_saas (fallback)

The selected domain influences the next questions.

---

## 10. Question Engine

The question engine is the heart of SpecFlow.

### Core responsibility

Determine:

> What is the most important missing information needed to improve the project specification?

### It should not:
- ask random questions
- dump a giant questionnaire immediately
- ask low-value details too early

### It should:
- prioritize missing high-impact decisions
- adapt based on previous answers
- skip irrelevant questions
- infer when safe
- expose assumptions for confirmation

### Example high-level question groups

1. Product shape
   - What is being built?
   - Who will use it?
   - Single-tenant or multi-tenant?
2. Roles and permissions
3. Core modules
4. Key workflows
5. Data relationships
6. Integrations
7. Auth and security
8. Payment/billing if relevant
9. Reporting/analytics
10. MVP vs future scope

### Question prioritization logic

Questions should be ranked by expected impact on:
- architecture
- entity modeling
- permission system
- module boundaries
- integrations
- UI/API structure

### Contradiction detection

If the user says:
- earlier: single institution
- later: multiple schools under one platform

The system should mark conflict and ask for resolution.

---

## 11. Model-Agnostic Provider Layer

SpecFlow must be provider-agnostic.

### Initial provider goals

Support these through adapters:

- OpenAI
- Anthropic
- Gemini
- Ollama / local models
- future providers

### Provider abstraction

Create a provider interface such as:

```ts
interface LLMProvider {
  name: string;
  isConfigured(): Promise<boolean>;
  generate(input: ProviderPromptInput): Promise<ProviderPromptOutput>;
}
```

### Local config example

```json
{
  "provider": "anthropic",
  "model": "claude-3-7-sonnet",
  "temperature": 0.2
}
```

### Future support

Make it easy for contributors to add new providers without changing core logic.

---

## 12. Agent-Agnostic Interoperability

SpecFlow should integrate with current and future AI coding tools.

### Important principle

Do not deeply couple SpecFlow to one vendor or platform.

### First-class interoperability should happen through:

1. files
2. markdown
3. json
4. prompts
5. CLI commands

### Example downstream usage

User runs SpecFlow and then tells Claude Code:

> Read `.specflow/architecture.md`, `.specflow/modules.md`, and `.specflow/requirements.json` and use them as the source of truth.

### Future integrations

Later, contributors may add:

- Cursor-specific helpers
- Claude Code prompt exporters
- MCP server integration
- editor extensions
- API server mode

But v1 should already work through simple artifacts.

---

## 13. Output Artifacts to Generate

SpecFlow should generate strong, useful artifacts.

### Human-readable docs

- `architecture.md`
- `modules.md`
- `entities.md`
- `workflows.md`
- `project-summary.md` (optional)
- `open-questions.md` (optional)

### Machine-readable docs

- `project.json`
- `requirements.json`
- `decisions.json`
- `assumptions.json`
- `open_questions.json`

### AI prompt bundles

Inside `prompts/`, generate prompts like:

#### `implement-project.md`
Prompt that instructs any agent to implement using `.specflow` as source of truth.

#### `generate-schema.md`
Prompt for generating database schema.

#### `build-module.md`
Prompt template for implementing one module at a time.

---

## 14. Suggested Tech Stack

Use a stack that is practical for open-source CLI development.

### Recommended stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Package manager:** pnpm or npm
- **CLI framework:** Commander or similar
- **Prompts:** Inquirer / prompts library
- **Validation:** Zod
- **File handling:** Node fs/promises
- **Formatting:** Prettier-compatible output
- **Testing:** Vitest or Jest
- **Build tool:** tsup / unbuild / esbuild-based approach

### Why TypeScript

- strong ecosystem for CLI tools
- contributor-friendly
- easier integrations
- easy npm distribution
- familiar to most AI/dev-tool contributors

---

## 15. Suggested Architecture

```text
specflow/
  src/
    cli/
      commands/
        init.ts
        ask.ts
        status.ts
        generate.ts
        config.ts
        export.ts
        doctor.ts
    core/
      state/
      engine/
      question-engine/
      artifact-engine/
      domain-engine/
      conflict-engine/
    providers/
      openai/
      anthropic/
      gemini/
      ollama/
    domains/
      generic_saas/
      education_erp/
      ecommerce/
      crm/
      pos/
      lms/
    utils/
    types/
  templates/
  tests/
```

### Core modules

#### `state`
Read/write canonical project state.

#### `engine`
Orchestrates discovery flow.

#### `question-engine`
Chooses next best questions.

#### `artifact-engine`
Generates markdown/json outputs.

#### `domain-engine`
Loads domain packs and domain logic.

#### `conflict-engine`
Detects contradictions and missing high-impact decisions.

---

## 16. Initialization Flow

### `specflow init` expected sequence

1. Check if `.specflow/` exists.
2. Ask whether to create new or continue existing.
3. Ask for:
   - project name or idea
   - optional stack preference
   - provider preference
   - model preference
4. Detect likely domain
5. Ask first high-value batch of questions
6. Save project state
7. Generate initial artifacts
8. Show what was created

### Example questions during init

- What are you building?
- Is it for one organization or many?
- Who are the main user roles?
- What features are essential for the MVP?
- Are there integrations you already know you need?
- Do you want SpecFlow to ask more questions now or stop after generating the first draft?

---

## 17. Config and Extensibility

### Local project config

Store config inside `.specflow/config.json`.

### User/global config
Optional future support for:

- default provider
- default model
- output preferences
- preferred question depth

### Community contributions should support:

1. new providers
2. new domain packs
3. new artifact generators
4. new exporters
5. integration packages

---

## 18. v1 Scope Recommendation

### Must build in v1

- CLI setup
- `init`
- `ask`
- `status`
- `generate`
- local project state
- markdown/json artifact generation
- at least 2-3 domain packs
- provider abstraction layer
- one or two working providers
- high-quality generic discovery flow

### Good to include if time allows

- contradiction detection
- open question prioritization
- prompt exporters
- schema prompt generation

### Do not include in v1

- hosted SaaS backend
- cloud collaboration
- direct repo code writing
- heavy IDE integrations
- too many providers
- too many domains

---

## 19. Suggested v2 / v3 Roadmap

### v2
- richer domain packs
- more providers
- better contradiction resolution
- prompt bundles for multiple agents
- architecture consequences and dependency tracing

### v3
- editor integrations
- team collaboration
- online shared state
- MCP / protocol server
- structured code-generation orchestration

---

## 20. Important UX Expectations

The tool should feel:

- useful in under 2 minutes
- intelligent, not noisy
- structured, not chaotic
- transparent, not magical
- extensible, not locked-down

### Bad UX to avoid

- asking 40 questions in one session
- forcing the user to answer tiny details too early
- inventing features without marking them as suggestions
- re-asking already answered items
- making the user depend on one model provider

---

## 21. Contribution Philosophy

This project is open source and should be easy for contributors.

### Contribution areas

- providers
- domain packs
- question logic
- exporters
- prompt templates
- docs
- tests

### Good open-source qualities

- modular codebase
- stable interfaces
- strong README
- good examples
- contribution guide
- clear domain pack format
- plugin-friendly internals

---

## 22. Example of Initial Project Files

### Example `project.json`

```json
{
  "name": "School Management System",
  "slug": "school-management-system",
  "domain": "education_erp",
  "description": "System for managing students, teachers, attendance, exams, and school operations"
}
```

### Example `decisions.json`

```json
[
  {
    "id": "dec_001",
    "title": "Tenancy model",
    "value": "single_institution",
    "status": "confirmed",
    "source": "user"
  },
  {
    "id": "dec_002",
    "title": "Parent-student relation",
    "value": "one parent can be linked to multiple children",
    "status": "confirmed",
    "source": "user"
  }
]
```

### Example `open_questions.json`

```json
[
  {
    "id": "q_001",
    "title": "Should fee collection support online payment?",
    "priority": "high",
    "reason": "Payment flow affects modules, integrations, and workflows"
  }
]
```

---

## 23. Initial README Messaging

The AI building this project should also generate a strong README.

Suggested README messaging:

### Headline

**SpecFlow**  
Open-source requirement and architecture intelligence for AI coding agents.

### Subheadline

Turn vague product ideas into structured project intelligence that any coding agent can use.

### Core value bullets

- CLI-first
- model-agnostic
- agent-agnostic
- file-based project memory
- domain-aware requirement discovery
- exportable artifacts for downstream AI tools

---

## 24. Success Criteria

SpecFlow v1 is successful if a user can:

1. Run `npx specflow init`
2. Enter a vague project idea
3. Answer a small set of meaningful questions
4. Get a `.specflow/` folder with clear artifacts
5. Hand those artifacts to another AI coding agent
6. Feel that the resulting implementation context is far better than starting from one vague prompt

---

## 25. Final Build Instruction to the AI

Build **SpecFlow** as a real open-source CLI tool focused on:

- requirement discovery
- project memory
- architecture generation
- agent interoperability
- extensibility

Keep the codebase modular and contributor-friendly.  
Do not overcomplicate v1.  
Prioritize a clean local-first developer experience.

### Key v1 outcome

A developer should be able to run:

```bash
npx specflow init
```

and receive a meaningful `.specflow/` project intelligence folder that improves the output of existing AI coding agents.

---

## 26. Suggested Next Deliverables After This Spec

After implementing the core, the AI should also generate:

1. a complete folder structure
2. package.json
3. CLI commands scaffolding
4. TypeScript interfaces for state models
5. initial domain pack examples
6. provider abstraction
7. artifact generation templates
8. README.md
9. CONTRIBUTING.md
10. example output for one sample project
