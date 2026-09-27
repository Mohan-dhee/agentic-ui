# Phase 2 — Component Generation (1:1 Fidelity)

## File Structure (mandatory)

Every component follows this structure exactly:

```
app/components/[ComponentName]/
  [ComponentName].tsx          ← Main component
  [ComponentName].module.css   ← Scoped styles (CSS Modules)
  [ComponentName].types.ts     ← Props interface + variant types
  [ComponentName].stories.tsx  ← Storybook stories (all variants)
  [ComponentName].test.tsx     ← Tests (behavior + accessibility)
  [ComponentName].tokens.css   ← Component-level CSS custom properties
  icons/                       ← SVGs as React components (SVGR)
    IconName.tsx
  index.ts                     ← Barrel export
  README.md                    ← Usage docs, do/don't, token map
```

## Component Generation Rules

### Structure
- Functional component with `React.forwardRef`
- TypeScript strict mode (no `any`, no type assertions unless justified with comment)
- Props interface in separate `.types.ts` file
- Named exports from barrel `index.ts` (no default exports)

### Props Derivation from Figma
- Map every Figma variant property to a typed prop:
  - `Variant=Solid,Outline` → `variant: 'solid' | 'outline'`
  - `Size=Small,Medium,Large` → `size: 'sm' | 'md' | 'lg'`
  - `State=Default,Hover,Disabled` → handled via CSS pseudo-classes, NOT props
  - Boolean `Show Icon=true/false` → `showIcon?: boolean`
- Include: `className`, `children` (if applicable), all native HTML props via `ComponentPropsWithRef<'element'>`
- Default values must match Figma's default variant

### Styling Rules
- **CSS Modules** with `.module.css` (scoped class names)
- Every visual value references a CSS custom property
- Component-level tokens in `[ComponentName].tokens.css`:
  ```css
  .ag-[component] {
    --ag-[component]-bg: var(--ag-color-primary-default);
    --ag-[component]-text: var(--ag-color-text-on-primary);
    --ag-[component]-padding: var(--ag-spacing-btn-padding);
    --ag-[component]-radius: var(--ag-radius-md);
  }
  ```
- Variant classes: `styles.[variant]` + `styles.[size]`
- State styles via CSS pseudo-classes: `:hover`, `:focus-visible`, `:disabled`, `:active`
- **NEVER** use inline styles for design properties

### Pixel Fidelity Rules
- **Dimensions**: If Figma says 40px height, the component is 40px. Period.
- **Spacing**: Figma padding `12px 24px` = `padding: 12px 24px`. No rounding.
- **Border radius**: Per-corner if Figma specifies: `border-radius: 6px 6px 0 0`
- **Font rendering**: `-webkit-font-smoothing: antialiased` (match Figma)
- **Line height**: Use exact value from Figma (not unitless approximations)
- **Letter spacing**: Convert Figma's % to em (e.g., 2% = 0.02em)

### Composition
- If the component contains other design system components, **IMPORT them** — do not recreate
- Slot pattern for customizable regions (icon slots, action slots)
- Children composition with `displayName` checks where needed

### Accessibility (built-in, not bolted-on)
- Semantic HTML element (`<button>`, `<input>`, `<nav>` — not `<div>`)
- `role` attribute ONLY when semantic HTML isn't possible
- `aria-label` on icon-only variants
- `aria-disabled="true"` alongside disabled prop
- Focus-visible ring (never `outline: none` without replacement)
- Keyboard handlers: Enter + Space for buttons, Escape for dismissals
- `@media (prefers-reduced-motion: reduce)` gate on all animations

## Showcase Page Generation

After the production component, generate a standalone visual QA page.

### Showcase Spec

Create `showcase/[ComponentName]/index.html`:

- Self-contained HTML with embedded styles and inline React via Babel standalone
- CDN links: React 18, ReactDOM 18, Babel standalone
- Import the component's CSS tokens as embedded `<style>`

### Required Sections

1. **HEADER** — Component name, stats grid (variants × sizes × states = total combos)
2. **VARIANT GALLERY** — Each variant rendered at each size
3. **STATE MATRIX** — Default, hover (simulated via class), focus, disabled, loading
4. **COMPLETE MATRIX** — Every combination rendered in a grid
5. **INTERACTIVE EXAMPLES** — With working state management (`useState`)
6. **DARK MODE TOGGLE** — Switch themes to verify token resolution
7. **DESIGN TOKEN REFERENCE** — Table: token name → value → CSS property
8. **CSS CLASS MAP** — All generated classes with naming convention explanation
9. **SPACING OVERLAY** — Toggle to show padding/margin boundaries (dev tool style)

### Showcase Styling
- Font: Inter, system-ui fallback
- Background: `#f8fafc`
- Cards: white bg, 12px radius, subtle shadow, 2rem padding
- Code blocks: `#1f2937` bg, `#f9fafb` text, JetBrains Mono / Monaco font
- Grid: CSS Grid for matrix layouts, Flexbox for inline groups
