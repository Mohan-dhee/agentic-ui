# Ready to Work — React Code Quality Rules for AI-Generated Design System Components

> Lives at `.ai/code-quality-rules.md`. Claude reads it after generating any component and before committing.
> These rules exist because LLMs produce specific, predictable failure patterns. Every rule below addresses a real anti-pattern observed in AI-generated React code from Cursor, Claude Code, and Copilot.

---

## 1. THE CORE PROBLEM

AI implements prompts directly without considering refactoring opportunities, architectural patterns, or maintainability tradeoffs. It adds what you asked for — additively, never integratively. Research shows ~30% of AI-generated code contains critical issues, and 90-100% of outputs exhibit refactoring avoidance and comment over-generation ([kluster.ai](https://www.kluster.ai/blog/ai-code-quality-gap-gpt5-cursor), [SoftwareSeni](https://www.softwareseni.com/understanding-anti-patterns-and-quality-degradation-in-ai-generated-code/)). The patterns below counteract this.

---

## 2. AI-SPECIFIC ANTI-PATTERNS — DETECT AND KILL

These appear in nearly every AI-generated component. Scan for them explicitly.

### 2.1 The Monolith Component
**What AI does**: Generates one massive component file with all logic, styles, state, data fetching, and rendering in a single function.
**Rule**: No component function body exceeds 50 lines of JSX. If it does, extract sub-components. Each component has one responsibility — it renders OR it manages state, never both in the same block.

### 2.2 Refactoring Avoidance
**What AI does**: When asked to add a feature, it appends code rather than restructuring existing code to integrate the new feature cleanly.
**Rule**: Before adding new logic, evaluate whether existing code should be restructured first. If a new variant requires duplicating more than 5 lines, refactor the shared logic into a helper, hook, or sub-component.

### 2.3 Comment Spam
**What AI does**: Adds a comment above every single line of code, often restating what the code already says.
**Rule**: Comments explain WHY, never WHAT. Delete every comment that restates the code. The only acceptable comments are:
- `// Source: [Figma URL]` headers
- `// TODO:` with actionable description
- Complex business logic rationale that isn't obvious from variable names
- JSDoc on exported interfaces/types

### 2.4 Phantom Edge Cases
**What AI does**: Adds null checks, fallbacks, and error handling for scenarios that can never occur given the component's props and context.
**Rule**: Only handle states that are possible given the component's typed props. If `variant` is `'primary' | 'secondary'`, there is no need for a `default` case that renders nothing. TypeScript's exhaustive checks via `never` are sufficient.

### 2.5 Copy-Paste Variants
**What AI does**: Creates separate blocks of near-identical JSX for each variant instead of using a data-driven approach.
**Rule**: Variant-specific values (colors, sizes, padding) go in a lookup map. The JSX template is written once. Variants are resolved via the map, not via `if/else` chains or duplicated markup.

```tsx
// BAD — AI's default output
if (variant === 'primary') return <button className={styles.primary}>...
if (variant === 'secondary') return <button className={styles.secondary}>...
if (variant === 'ghost') return <button className={styles.ghost}>...

// GOOD — one template, variant resolved via CSS class
const variantClass = styles[variant]; // styles.primary | styles.secondary | styles.ghost
return <button className={clsx(styles.root, variantClass, styles[size])}>...
```

### 2.6 Prop Explosion
**What AI does**: Flattens every Figma property into an individual top-level prop, resulting in 15+ props on a single component.
**Rule**: Maximum 7-8 props per component. If exceeding this:
- Group related props into objects (`appearance={{ variant, size }}`)
- Use compound component pattern for structural variations
- Use `children` composition instead of `leftIcon`, `rightIcon`, `prefix`, `suffix` props

### 2.7 Inline Style Leakage
**What AI does**: Sprinkles `style={{}}` throughout JSX for "quick fixes" instead of using CSS classes.
**Rule**: Zero inline styles for design properties. The only acceptable inline style is a CSS custom property override passed via `style` prop for dynamic values (e.g., progress bar width). All other visual properties live in `.module.css`.

### 2.8 Stale Type Assertions
**What AI does**: Uses `as Type` to force TypeScript compliance instead of fixing the actual type mismatch.
**Rule**: Zero type assertions unless accompanied by a comment explaining why. If you need `as`, the types are probably wrong — fix them. `as unknown as X` is a code smell that must be flagged.

---

## 3. COMPONENT ARCHITECTURE RULES

### 3.1 Separation of Concerns — Four Layers

Every component implicitly operates across four layers. Keep them separate ([Cheesecake Labs](https://cheesecakelabs.com/blog/react-best-practices-in-projects/)):

| Layer | What Lives Here | Where It Goes |
|-------|----------------|---------------|
| Presentation | JSX, CSS classes, layout structure | Component `.tsx` file (return statement) |
| Application Logic | State management, effect orchestration | Custom hooks (`use[ComponentName].ts`) |
| Business Logic | Validation, transformation, computation | Pure functions in `utils/` or `.helpers.ts` |
| External World | API calls, browser APIs, storage | Isolated service modules, never in components |

For design system primitives (Button, Input, Tag): layers 1-2 only. No business logic, no API calls.

### 3.2 Compound Component Pattern

Use when a component has structural variations that can't be expressed through simple props ([freeCodeCamp](https://www.freecodecamp.org/news/compound-components-pattern-in-react/)):

```tsx
// Consumer API — declarative, composable
<Card>
  <Card.Header>
    <Card.Title>Dashboard</Card.Title>
    <Card.Actions><IconButton icon={MoreIcon} /></Card.Actions>
  </Card.Header>
  <Card.Body>Content here</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

Rules:
- Parent manages shared state via Context
- Children render independently — no prop drilling
- TypeScript: use `Object.assign` or namespace pattern to attach sub-components while preserving `forwardRef` types
- Every sub-component validates it's used inside the parent (throw if context is null)

### 3.3 Composition Over Configuration

```tsx
// BAD — prop-heavy configuration
<Button
  leftIcon={<SearchIcon />}
  rightIcon={<ChevronIcon />}
  iconPosition="left"
  iconSpacing={8}
  label="Search"
/>

// GOOD — composition via children
<Button>
  <SearchIcon />
  Search
  <ChevronIcon />
</Button>
```

The component provides the layout contract (flex, gap, alignment). The consumer decides what goes inside.

### 3.4 forwardRef as Default

Every design system component uses `React.forwardRef`. No exceptions. This enables:
- Parent focus management
- Scroll-to-element behaviors
- Animation libraries that need DOM references
- Compound component ref forwarding

```tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(styles.root, styles[variant], styles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

---

## 4. CSS ARCHITECTURE RULES

### 4.1 Three-Tier Token Aliasing (never skip a tier)

```css
/* primitives.css — raw scale values */
:root {
  --ag-blue-500: #2563EB;
  --ag-blue-600: #1D4ED8;
  --ag-spacing-3: 12px;
  --ag-spacing-6: 24px;
  --ag-radius-2: 6px;
}

/* semantic.css — intent-based */
:root {
  --ag-color-primary-default: var(--ag-blue-500);
  --ag-color-primary-hover: var(--ag-blue-600);
  --ag-spacing-component-padding-x: var(--ag-spacing-6);
  --ag-spacing-component-padding-y: var(--ag-spacing-3);
}

/* Button.tokens.css — component-scoped aliases */
.ag-button {
  --ag-button-bg: var(--ag-color-primary-default);
  --ag-button-bg-hover: var(--ag-color-primary-hover);
  --ag-button-padding: var(--ag-spacing-component-padding-y) var(--ag-spacing-component-padding-x);
  --ag-button-radius: var(--ag-radius-2);
}
```

Component CSS only references component-tier tokens:
```css
/* Button.module.css */
.root {
  background: var(--ag-button-bg);
  padding: var(--ag-button-padding);
  border-radius: var(--ag-button-radius);
}
.root:hover {
  background: var(--ag-button-bg-hover);
}
```

This means theming only touches primitives or semantics — component CSS never changes.

### 4.2 Specificity Management

- Single-class selectors only: `.root`, `.label`, `.icon` — never `.root .label .icon`
- No IDs in CSS
- Variant classes are additive: `.root.primary` not `.primary` alone
- Use `:where()` for inherited overrides to keep specificity at 0
- State via pseudo-classes (`:hover`, `:focus-visible`, `:disabled`), never `.isHovered` JS-toggled classes for native HTML states
- `!important` count must be zero

### 4.3 CSS Module Naming Convention

```css
/* Structure-based names, not visual-based */
.root { }           /* component root element */
.label { }          /* text label */
.icon { }           /* icon container */
.content { }        /* main content area */
.action { }         /* interactive child */

/* Variant modifiers */
.primary { }
.secondary { }
.ghost { }
.destructive { }

/* Size modifiers */
.sm { }
.md { }
.lg { }

/* State modifiers (only for states not expressible via pseudo-classes) */
.loading { }
.error { }
.selected { }
```

Never: `.blueButton`, `.smallText`, `.leftAligned`, `.mt-4`

### 4.4 Figma Auto-Layout → CSS Flexbox Mapping

| Figma Property | CSS Equivalent |
|---------------|---------------|
| Direction: Horizontal | `flex-direction: row` |
| Direction: Vertical | `flex-direction: column` |
| Gap: 8 | `gap: 8px` (or token reference) |
| Padding: 12 16 12 16 | `padding: 12px 16px` |
| Primary axis: Space between | `justify-content: space-between` |
| Counter axis: Center | `align-items: center` |
| Child: Fill container | `flex: 1` or `width: 100%` |
| Child: Hug contents | `width: auto` (default) |
| Child: Fixed width | `width: [value]px` / `flex: 0 0 [value]px` |
| Clip content | `overflow: hidden` |

Do not use `position: absolute` to replicate auto-layout. If Figma uses auto-layout, the code uses flexbox.

---

## 5. TYPESCRIPT STRICTNESS RULES

### 5.1 tsconfig Baseline (non-negotiable)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 5.2 Component Type Patterns

```tsx
// Props interface — always in .types.ts
export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Discriminated union for structural variants
type CardProps =
  | { variant: 'default'; children: React.ReactNode }
  | { variant: 'interactive'; onClick: () => void; children: React.ReactNode }
  | { variant: 'link'; href: string; children: React.ReactNode };

// Exhaustive variant checking
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

// Event handler typing — always specific, never `any`
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
```

### 5.3 Forbidden Patterns

| Pattern | Why | Fix |
|---------|-----|-----|
| `any` | Disables type safety | Use `unknown` + narrowing, or define the actual type |
| `as Type` | Hides real mismatch | Fix the types at the source |
| `// @ts-ignore` | Suppresses compiler | Fix the error. Use `@ts-expect-error` only with comment if unavoidable |
| `!` (non-null assertion) | Lies to compiler | Use optional chaining or null check |
| `{} as Props` | Empty assertion | Provide actual default or use Partial |
| `Object`, `Function` | Too broad | Use specific interfaces and function signatures |

---

## 6. ESLINT RULES — DESIGN SYSTEM STRICT CONFIG

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "react/prefer-stateless-function": "error",
    "react/button-has-type": "error",
    "react/no-unused-prop-types": "error",
    "react/jsx-pascal-case": "error",
    "react/no-unstable-nested-components": ["error", { "allowAsProps": true }],
    "react/jsx-no-leaked-render": ["error", { "validStrategies": ["ternary"] }],
    "react/jsx-key": ["error", {
      "checkFragmentShorthand": true,
      "checkKeyMustBeforeSpread": true,
      "warnOnDuplicates": true
    }],
    "react/destructuring-assignment": ["error", "always"],
    "react/self-closing-comp": "warn",
    "react/display-name": "warn",
    "react/jsx-max-depth": ["warn", { "max": 5 }],
    "react/function-component-definition": ["warn", {
      "namedComponents": "arrow-function"
    }],
    "react/jsx-no-useless-fragment": "warn",
    "react/jsx-curly-brace-presence": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-console": "error",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

---

## 7. IMPORT ORDER (enforced via ESLint `import/order`)

```tsx
// 1. React
import React, { forwardRef, useState } from 'react';

// 2. Third-party (if any)
import clsx from 'clsx';

// 3. Internal components
import { Icon } from '../Icon';

// 4. Types
import type { ButtonProps } from './Button.types';

// 5. Styles
import styles from './Button.module.css';

// 6. Assets (icons, images)
import { ChevronDown } from './icons/ChevronDown';
```

Blank line between each group. `type` imports always use `import type`.

---

## 8. NAMING CONVENTIONS

| What | Convention | Example |
|------|-----------|---------|
| Component file | PascalCase | `Button.tsx` |
| Component name | PascalCase | `export const Button` |
| Props interface | PascalCase + "Props" | `ButtonProps` |
| CSS module file | PascalCase + `.module.css` | `Button.module.css` |
| CSS class (in module) | camelCase | `.root`, `.iconWrapper` |
| CSS custom property | kebab-case with prefix | `--ag-button-bg` |
| Token file | PascalCase + `.tokens.css` | `Button.tokens.css` |
| Hook | camelCase with `use` prefix | `useButton`, `useToggle` |
| Handler (internal) | `handle` + action | `handleClick`, `handleClose` |
| Handler (prop) | `on` + action | `onClick`, `onClose` |
| Boolean prop | `is`/`has`/`should` prefix | `isLoading`, `hasIcon`, `shouldAnimate` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_ITEMS`, `DEFAULT_VARIANT` |
| Enum/union values | lowercase kebab in types | `'primary' \| 'secondary'` |

---

## 9. PERFORMANCE GUARDRAILS

### Only Memoize When Justified

```tsx
// DO memoize: component receives non-primitive props from parent
export const ListItem = React.memo(({ item, onSelect }: ListItemProps) => { ... });

// DO memoize: expensive computation
const sortedItems = useMemo(() => items.sort(compareFn), [items]);

// DO memoize: callback passed to memoized child
const handleSelect = useCallback((id: string) => onSelect(id), [onSelect]);

// DON'T memoize: leaf component with no children, primitive props only
// DON'T memoize: values that change every render anyway
// DON'T memoize: simple string concatenation or object spread
```

### Bundle Rules
- Every SVG icon: named export (tree-shakeable)
- No barrel re-exports from `app/components/index.ts` that pull the entire library
- Component-level code splitting for route-specific components via `React.lazy`
- Target: each component < 10KB gzipped (excluding shared tokens)

---

## 10. PRE-COMMIT CHECKLIST (run before every commit)

```bash
# Automated (must pass) — npm run qc runs all five in order
npm run typecheck               # tsc --noEmit: zero type errors
npm run lint                    # ESLint 9 flat config: zero errors
npm run lint:css                # stylelint "**/*.css": zero errors
npm test                        # vitest run: all tests pass, incl. jest-axe
npm run audit:states            # scripts/audit-interactive-states.sh

# Manual review
grep -rn "any" app/components/             # Should return zero results in component code
grep -rn "as " app/components/             # Flag type assertions — each needs justification
grep -rn "console\." app/components/       # Should return zero (unless error boundary)
grep -rn "!important" app/components/      # Must be zero
grep -rn "style={{" app/components/        # Should be zero or justified
grep -rn "#[0-9a-fA-F]" app/components/   # Hardcoded hex — must be zero in .tsx, .css
```

---

## SOURCES

- [Understanding Anti-Patterns in AI-Generated Code](https://www.softwareseni.com/understanding-anti-patterns-and-quality-degradation-in-ai-generated-code/) — 90-100% occurrence rates for refactoring avoidance and comment spam in LLM output
- [The AI Code Quality Gap](https://www.kluster.ai/blog/ai-code-quality-gap-gpt5-cursor) — 30% of AI-generated code contains critical issues; GPT-5 at 47% failure rate
- [Continuous Code Refactoring with LLMs](https://dextralabs.com/blog/continuous-refactoring-with-llms/) — Specifying refactoring type raises LLM success from 15.6% to 86.7%
- [Writing High Quality Production Code with LLMs](https://www.linkedin.com/pulse/writing-high-quality-production-code-llms-solved-problem-esco-obong-odx7f) — Spec-Driven Development and system prompts as "engineering brain"
- [Scalable React Component Patterns](https://dev.to/vishw-patel/scalable-react-component-patterns-from-atomic-design-to-compound-components-13l7) — Compound components, headless patterns, container/presentational
- [Compound Components Pattern in React](https://www.freecodecamp.org/news/compound-components-pattern-in-react/) — Full implementation with React 19 and Context
- [React Best Practices: Separation of Concerns](https://cheesecakelabs.com/blog/react-best-practices-in-projects/) — Four-layer architecture for React apps
- [15 React Component Principles](https://thetshaped.dev/p/15-react-component-principles-for-better-design) — Props management, component sizing, hook patterns
- [CSS Architecture for Scalability](https://feature-sliced.design/blog/scalable-css-architecture) — CSS Modules vs BEM vs utility-first comparative analysis
- [Design Tokens and CSS Variables](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/) — Three-tier token architecture, scoping, and theming patterns
- [Scalable CSS Architecture for Enterprise](https://laur.design/blog/css-architecture-scalable-stylesheets/) — CUBE CSS, design tokens, specificity management
- [Strict TypeScript for React](https://oneuptime.com/blog/post/2026-01-15-strict-typescript-configuration-react/view) — Full tsconfig strict configuration with ESLint integration
- [Best ESLint Rules for React](https://timjames.dev/blog/the-best-eslint-rules-for-react-projects-30i8) — Curated rule set for React TypeScript projects
- [TypeScript Code Review Guide](https://kodus.io/en/typescript-code-review-guide/) — Senior-level review checklist for TypeScript
- [React Code Review Checklist](https://devcom.com/tech-blog/react-code-review/) — Comprehensive review checklist covering component design, types, testing, security
- [Typing Compound Components with forwardRef](https://stevekinney.com/courses/react-typescript/compound-components-and-slots-typing) — TypeScript patterns for compound components
- [Sentrux — Real-time Code Quality MCP](https://www.reddit.com/r/ClaudeCode/comments/1rrvx6h/my_claude_code_kept_getting_worse_on_large/) — 14-dimension quality grading with AI feedback loop
