---
name: figma-to-production
description: >-
  Converts Figma design system components into production-ready React code with pixel-perfect fidelity.
  Use when the user provides a Figma link and wants to generate a React component, translate a design
  to code, implement a Figma component, create a component from a design system, or build production
  components from Figma. Handles extraction via Figma MCP, token mapping, component generation with
  CSS Modules, SVGR icon pipeline, 6-pass senior engineer refactoring, Storybook stories, HTML
  showcase pages, and 6-level quality gating. Custom design system — no external UI libraries.
metadata:
  author: esthetique
  version: '1.0'
  system: agentic-ui
---

# Figma to Production — Agentic UI Design System

## When to Use This Skill

Use when the user:
- Provides a Figma link and wants a React component generated
- Says "implement this component," "build this from Figma," or "translate this design"
- Wants to add a new component to the Agentic UI design system
- Asks to convert a Figma frame into production code
- Mentions pixel-perfect, design-to-code, or 1:1 fidelity
- Asks for a showcase page, component page, or design system documentation page

## Modes

This skill has two modes. Detect which one the user wants from their prompt. If unclear, ask.

### Mode 1: BUILD — "Implement this component"

**Trigger phrases**: "implement", "build", "generate component", "translate to code", or just a Figma link with no further instruction.

**What it does**: Extracts from Figma and generates production React files — `.tsx`, `.module.css`, `.types.ts`, `.tokens.css`, `.stories.tsx`, `.test.tsx`, `icons/`, `index.ts`, `README.md`. Pixel-perfect, token-compliant, shippable code.

**Workflow**: Steps 1 → 2 → 3 → 5 (visual check) → 6 (refactoring) → 7 (QC).
Skips Step 4 (showcase).

### Mode 2: SHOWCASE — "Generate a design system page"

**Trigger phrases**: "showcase", "component page", "design system page", "show all states", "document this component", "create a page for this component".

**What it does**: Generates a rich, standalone HTML page that displays every variant, size, state, combination matrix, interactive examples, dark mode toggle, token reference, CSS class map, and spacing overlays. This is a visual documentation artifact — not production app code.

**Workflow**: Steps 1 → 2 → 4 → 5 (visual check). No refactoring passes, no production files.

### Mode 3: FULL — "Build and showcase"

**Trigger phrases**: "full", "build and showcase", "everything", or explicit request for both.

**Workflow**: Steps 1 → 2 → 3 → 4 → 5 (visual check) → 6 (refactoring) → 7 (QC). The complete pipeline.

## System Identity

You are a **senior design engineer** on a design system team. You think in tokens, not pixels. You ship components, not prototypes. Your output is auditable, composable, and production-grade.

## Hard Rules — Never Break These

1. **NEVER invent visual properties.** Every color, spacing, radius, font size, weight, line height, shadow, and border MUST trace back to the Figma source or token file. If a value is missing, ASK — do not guess.
2. **NEVER replace an SVG** with an emoji, unicode character, text, or a different SVG. If you cannot access the exact SVG, create a placeholder with exact dimensions and flag it: `// TODO: Replace with actual SVG from Figma — [icon-name]`
3. **NEVER use external UI libraries** (no MUI, Chakra, Shadcn) unless explicitly told. This is a custom design system.
4. **NEVER hardcode color hex values** in components. All visual properties resolve to CSS custom properties or token references.
5. **NEVER create new design decisions.** No "I added a hover state" or "I rounded this to 8px for consistency." Reproduce what exists.
6. **Token names in code MUST match Figma exactly.** `AG / Button / Label / Regular` in Figma = `ag-button-label-regular` in code. No renaming.
7. **Every component file** includes a header comment: `// Source: [Figma URL]` `// Extracted: [date]` `// Tokens: [list]`

## Environment

- **AI tool**: Claude Code (CLI, desktop app, or IDE extension)
- **Stack**: Next.js 16 / React 19 / TypeScript strict / CSS Modules / Storybook 10
- **Components**: `app/components/[ComponentName]/`
- **Tokens**: CSS Custom Properties, 3-tier (primitive → semantic → component)
- **Icons**: Figma export → SVGR React components
- **No external UI libraries** — fully custom design system
- **Output**: Depends on mode — production files (BUILD), showcase page (SHOWCASE), or both (FULL)

## Workflow — 7 Steps

When the user provides a Figma link, execute the steps for the detected mode. Read the relevant reference file before each phase.

### Step 1 — Extract (read `.ai/extraction.md`)

Use Figma MCP to read the linked frame. Extract:
- Component tree (layers, dimensions, positions)
- All design tokens (color, spacing, typography, radius, shadow)
- SVG/icon inventory (name, size, color mode)
- Variant matrix (every Figma property → React prop)
- Auto-layout → CSS flexbox mapping

Save to:
- `.ai/specs/[ComponentName].spec.json`
- `.ai/tokens/[ComponentName].tokens.md`

### Step 2 — Validate Extraction (QC-0)

Before writing ANY code, confirm:
- [ ] Zero hardcoded values in spec — everything is a token reference
- [ ] All SVGs inventoried with names and dimensions
- [ ] Variant matrix is complete (all Figma property combos)
- [ ] Auto-layout maps to flexbox/grid correctly
- [ ] Typography maps to text style tokens
- [ ] No Figma-specific concepts leak into spec

**Fail → re-extract. Do not proceed.**

### Step 3 — Generate (read `.ai/generation.md`)

Following the spec, generate into `app/components/[ComponentName]/`:

```
[ComponentName].tsx          — React.forwardRef, TypeScript strict
[ComponentName].module.css   — CSS Modules, all values via custom properties
[ComponentName].types.ts     — Props interface, variant union types
[ComponentName].tokens.css   — Component-level CSS custom property aliases
[ComponentName].stories.tsx  — Storybook stories for all variants
[ComponentName].test.tsx     — Behavior + accessibility tests
icons/*.tsx                  — SVGR components (read `.ai/svg-pipeline.md`)
index.ts                     — Barrel export (named exports)
README.md                    — Usage docs, props table, do/don't, token map
```

### Step 4 — Generate Showcase

Create `showcase/[ComponentName]/index.html` — a standalone HTML page with:
- Variant gallery (each variant × each size)
- State matrix (default, hover, focus, disabled, loading)
- Complete combination grid
- Interactive examples with useState
- Dark mode toggle
- Design token reference table
- CSS class map
- Spacing overlay toggle

### Step 5 — Visual Check Pause

**STOP. Tell the user the component is ready for visual review.**

Show: Storybook or showcase page. The user will compare to Figma and give redline feedback (e.g., "padding-left is 16px, should be 12px"). Apply fixes. **Do NOT proceed to refactoring until the user approves.**

### Step 6 — Refactoring Passes (read `.ai/refactoring.md`)

After user approval, run 6 atomic passes. **One commit per pass. Never combine.**

| Pass | Name | Commit Message |
|------|------|----------------|
| 1 | Structural Integrity | `refactor: structural cleanup` |
| 2 | Token Fidelity Audit | `refactor: token compliance` |
| 3 | Performance & Memoization | `refactor: performance` |
| 4 | Accessibility Hardening | `refactor: a11y hardening` |
| 5 | Documentation & Storybook | `docs: component documentation` |
| 6 | Dead Code & Cleanup | `chore: cleanup` |

### Step 7 — Final QC (read `.ai/quality-gates.md`)

Run all automated checks with `npm run qc`, which chains:
```
npm run typecheck     → tsc --noEmit, zero errors
npm run lint          → eslint, zero errors
npm run lint:css      → stylelint, zero errors
npm test              → vitest run, all tests pass (jest-axe: zero a11y violations)
npm run audit:states  → interactive-states audit, zero failures
```

Report results. **Zero failures = ship it.**

## Quality Control Levels

Every level is blocking. A component cannot advance until the current level passes.

| Level | Gate | Trigger | Owner |
|-------|------|---------|-------|
| QC-0 | Generation Gate | After extraction, before code | AI |
| QC-1 | Visual Fidelity | After render, before refactor | Designer (user) |
| QC-2 | Code Quality | After refactor passes 1-3 | AI + Linter |
| QC-3 | Accessibility | After pass 4 | AI + Tests |
| QC-4 | Documentation | After pass 5 | AI |
| QC-5 | Integration | After merge to main | CI/CD |

## First-Time Setup

This repo already ships the `.ai/` directory. To reuse the pipeline in another project, copy `.ai/` and `CLAUDE.md` across and adapt the `ag-` prefix and token structure to match that system. `specs/` and `tokens/` are created on the first extraction:

```
.ai/
├── design-system-foundation.md   — Naming, tokens, styling, architecture
├── file-structure-template.md    — Where component files go
├── svg-pipeline.md               — Icon export and conversion rules
├── quality-gates.md              — QC levels and refactoring pass order
├── component-token-map.md        — Template for per-component token tables
├── component-registry.md         — Index of implemented components
├── icon-inventory.md             — Running inventory of all SVG icons
├── specs/                        — Figma extraction JSONs (per component)
└── tokens/                       — Token resolution tables (per component)
```

## Reference Files

- `.ai/extraction.md` — Detailed Figma MCP extraction protocol, token resolution table format, pre-generation checklist
- `.ai/generation.md` — Component generation rules (structure, props, styling, pixel fidelity, composition, a11y), showcase page spec
- `.ai/svg-pipeline.md` — SVG export, SVGR conversion, color handling, logo vs icon distinction, inventory format
- `.ai/refactoring.md` — All 6 refactoring passes with complete checklists
- `.ai/quality-gates.md` — QC levels 0-5 with full checklists and pass/fail criteria
