# Agentic UI — Design System Foundation

## System Prefix
All tokens, classes, and component names use the `ag-` prefix.

## Token Architecture (3-tier)
1. **PRIMITIVE** — Raw values (scale-based)
   `ag-color-blue-500`, `ag-spacing-4`, `ag-radius-2`
2. **SEMANTIC** — Intent-based (what it's for)
   `ag-color-primary-default`, `ag-spacing-component-padding`
3. **COMPONENT** — Scoped aliases (per-component overrides)
   `ag-button-bg`, `ag-input-border`

## CSS Custom Property Convention
`--ag-[category]-[role]-[modifier]`

Examples:
- `--ag-color-primary-default`
- `--ag-color-text-on-primary`
- `--ag-spacing-component-button-padding`
- `--ag-radius-md`

## Component Naming
- PascalCase for React components: `Button`, `InputField`, `DataTable`
- kebab-case for CSS classes: `.ag-button`, `.ag-input-field`
- camelCase for props: `variant`, `size`, `isDisabled`, `showIcon`

## File Structure
Every component lives in `app/components/[ComponentName]/` with:
- `[ComponentName].tsx`
- `[ComponentName].module.css`
- `[ComponentName].types.ts`
- `[ComponentName].stories.tsx`
- `[ComponentName].test.tsx`
- `[ComponentName].tokens.css`
- `icons/` (if component has SVGs)
- `index.ts`
- `README.md`

## Styling Approach
- CSS Modules (`.module.css`) for scoped styles
- CSS Custom Properties for all design tokens
- NO Tailwind, NO styled-components, NO CSS-in-JS runtime
- Component tokens alias semantic tokens (never skip the alias)

## State Handling
- Visual states (hover, focus, disabled) via CSS pseudo-classes
- Behavioral states (loading, error) via props + CSS class
- Transitions: max 150ms ease-in-out
- `prefers-reduced-motion`: disable all animation

## Import Rules
- Import design system components, never recreate them
- Named exports only (tree-shaking)
- Types exported separately

## Decisions Log
- YYYY-MM-DD: [Decision]: [Rationale]
