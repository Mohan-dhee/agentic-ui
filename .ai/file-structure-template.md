# File Structure Template

## Component

```
app/components/[ComponentName]/
├── [ComponentName].tsx          # Component implementation
├── [ComponentName].module.css   # Scoped CSS Modules styles
├── [ComponentName].types.ts     # TypeScript interfaces & types
├── [ComponentName].tokens.css   # Component-level CSS custom properties
├── [ComponentName].stories.tsx  # Storybook stories
├── [ComponentName].test.tsx     # Tests (behavior + a11y)
├── icons/                       # SVG React components (via SVGR)
│   └── [IconName].tsx
├── index.ts                     # Barrel export
└── README.md                    # Usage documentation
```

## Tokens

```
src/tokens/
├── primitives.css               # Raw scale values
├── semantic.css                 # Intent-based aliases
├── themes/
│   ├── light.css                # Light theme overrides
│   └── dark.css                 # Dark theme overrides
└── index.css                    # Imports all token files
```

## AI Specs (not shipped to production)

```
.ai/
├── specs/
│   └── [ComponentName].spec.json    # Extracted from Figma
└── tokens/
    └── [ComponentName].tokens.md    # Token mapping table
```

## Showcase Pages (QA only, not shipped)

```
showcase/
└── [ComponentName]/
    ├── index.html               # Standalone visual QA page
    └── component.css            # Showcase-specific styles
```
