# Agentic Design System

A production-grade design system built with Next.js, React, and CSS Modules. Components are extracted from Figma via MCP and implemented with full token fidelity, interactive states, and motion.

## Setup

### Prerequisites

- Node.js 22.12+ (required by Vitest 5)
- npm
- Git Bash on Windows (the state audit is a bash script)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- A Figma MCP server, signed in to the account that owns your copy of the Figma file: the official Figma MCP server (preferred; the extraction docs follow its output) or [figma-console-mcp](https://github.com/southleft/figma-console-mcp). See `.ai/extraction.md` for the tool mapping.

### Install and run

```bash
git clone https://github.com/<your-account>/agentic-ui.git
cd agentic-ui
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`. Storybook runs with `npm run storybook` at `http://localhost:6006`.

### Connect Claude Code

1. Open the project directory in your terminal
2. Run `claude` to start a Claude Code session
3. Claude reads `CLAUDE.md` automatically and operates as a design system agent
4. Connect the Figma MCP server for design extraction
5. Optional: keep `npm run storybook` running so Claude can read existing stories through the Storybook MCP at `http://localhost:6006/mcp`

## Commands

Use these commands inside a Claude Code session to work with components:

### `implement [figma-link]`

Extracts a component from Figma and generates production-ready code: `.tsx`, `.module.css`, `.types.ts`, `.tokens.css`, `.stories.tsx`, `.test.tsx`, and icons. Includes all interactive states, token mapping, and a self-review pass.

```
implement https://www.figma.com/design/FLribG.../node-id=123-456
```

### `animate [ComponentName]`

Adds `motion/react` (Framer Motion v11+) animations to an existing component. Follows strict easing and duration tokens defined in `.ai/motion-rules.md`.

```
animate Button
```

### `refactor [ComponentName]`

Runs 6 refactoring passes on an existing component: token audit, structure cleanup, motion compliance, accessibility, naming, and final QC. One commit per pass.

```
refactor TabGroup
```

### `audit [ComponentName]`

Runs quality gates 0-5 on an existing component. Checks token fidelity, pixel accuracy, accessibility, state coverage, and motion compliance.

```
audit Slider
```

### `showcase [figma-link]`

Generates an HTML documentation page with variant gallery, state matrix, dark mode preview, and token table.

```
showcase https://www.figma.com/design/FLribG.../node-id=123-456
```

### `full [figma-link]`

Runs both `implement` and `showcase` in sequence -- production files plus documentation page.

```
full https://www.figma.com/design/FLribG.../node-id=123-456
```

## Project structure

```
app/
  components/       # Reusable UI components (Button, Input, TabGroup, etc.)
  fonts/            # Self-hosted font files
  fonts.ts          # next/font setup shared by the layout and Storybook
  globals.css       # Design tokens (colors, spacing, typography, shadows, radii)
  layout.tsx        # Root layout with SubNav
  page.tsx          # Token showcase / style guide

src/
  lib/              # Motion presets, focus trap, arrow-key navigation
  tokens/           # Motion tokens (TS + JSON)

.ai/                        # Agent instruction files (CLAUDE.md says when to load each)
  design-system-foundation.md
  extraction.md             # Figma MCP extraction protocol + MCP tool mapping
  generation.md             # Component generation rules
  svg-pipeline.md           # Icon extraction and SVGR conversion
  icon-extraction-rules.md
  motion-rules.md           # Animation tokens and CSS/motion rules
  motion-presets.md         # Preset lookup for src/lib
  refactoring.md            # 6-pass refactoring checklist
  code-quality-rules.md     # AI anti-patterns + pre-commit checklist
  quality-gates.md          # QC levels 0-5
  component-registry.md     # What exists, status, known issues
  diagnostics.md            # Troubleshooting guide

.storybook/         # Storybook config (loads globals.css + fonts)
scripts/            # State audit, motion token sync

public/
  assets/icons/     # Extracted SVG icons
```

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | CSS Modules + CSS Custom Properties |
| Animation | motion/react (Framer Motion v11+) |
| Icons | Figma export via SVGR |
| Language | TypeScript (strict mode) |
| Stories | Storybook 10 (a11y, docs, MCP addons) |
| Tests | Vitest + Testing Library + jest-axe |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run storybook` | Start Storybook (and its MCP endpoint) on port 6006 |
| `npm run build-storybook` | Static Storybook build |
| `npm run qc` | Full quality gate: typecheck, lint, lint:css, test, audit:states |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm run lint:css` | Run stylelint |
| `npm test` | Run Vitest once (`npm run test:watch` to watch) |
| `npm run audit:states` | Check interactive components have hover/focus styles and `'use client'` |
| `npm run sync:motion` | Check motion tokens match between CSS and JS |

## Known issues

See `.ai/component-registry.md`. In short: several components hardcode danger/error colors instead of tokens, and Navigation has no keyboard focus style. Both need values from the Figma file, so `npm run qc` fails on the state audit until Navigation's focus state is extracted.
