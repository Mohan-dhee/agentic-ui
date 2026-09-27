# Component Registry — Agentic UI

Read before generating or auditing a component, so you extend what exists instead of recreating it. Update the row whenever a component is added, re-extracted, or audited.

## Status definitions

| Status | Meaning |
|---|---|
| `extracted` | Built from a Figma node; source link recorded below |
| `utility` | Behavior or layout helper with no Figma source (not a visual component) |
| `needs-figma` | Has a known gap that can only be fixed with values from Figma (see Known issues) |
| `stable` | Extracted, tested, has a story, and passes `npm run qc` with no known issues |

## Components

Figma sources are node IDs in **AGENTIC DESIGN SYSTEM v1.2**. A duplicated Figma file keeps node IDs, so the same IDs apply to your own copy; re-verify each one after upgrading to a newer file version.

| Component | Files | Figma node (v1.2) | Test | Story | Status |
|---|---|---|---|---|---|
| Button | Button.tsx | — (not recorded) | ✓ | ✓ | `needs-figma` |
| Dialog | Dialog.tsx (+ Title, Description, Body, Actions) | — | ✓ | — | `extracted` |
| Fieldset | Fieldset.tsx (Field, Label, Description, ErrorMessage) | — | — | — | `needs-figma` |
| Input | Input.tsx | — | — | — | `needs-figma` |
| Select | Select.tsx | — | — | — | `needs-figma` |
| Textarea | Textarea.tsx | — | — | — | `needs-figma` |
| Menu | Menu, MenuItem, MenuDivider, MenuSectionHeader | — | — | — | `needs-figma` |
| Navigation | Navigation, NavSection, NavLink, NavSubLink | — | — | — | `needs-figma` |
| ProgressBar | ProgressBar.tsx | `4072:7707` | — | — | `extracted` |
| Slider | Slider.tsx | `4074:1001` | — | — | `extracted` |
| Stepper | Stepper, StepperStep, StepperSubstep, StepperConnector, PulsatingDot | `4001:1105` | — | — | `extracted` |
| TabGroup | TabGroup (`4056:1461`), Tab (`4052:890`) | `4056:1461` | — | — | `extracted` |
| DialerCard | DialerCard.tsx, DialerCard.types.ts | `8007:10646` in **GENIUS DESIGN SYSTEM V.1** (a different file) | — | — | `needs-figma` |
| SubNav | SubNav.tsx | — (site chrome for this repo's demo pages) | — | — | `utility` |
| SlidingText | SlidingText.tsx | — | — | — | `utility` |
| Icon | Icon.tsx | — | — | — | `utility` |
| TouchTarget | TouchTarget.tsx | — | — | — | `utility` |
| VirtualScroller | VirtualScroller.tsx | — | — | — | `utility` |

Shared: `app/components/motion.ts` (motion constants mirrored from `globals.css`, checked by `npm run sync:motion`) and `src/lib/` (motion presets, focus trap, arrow-key navigation).

## Known issues

| Component | Issue | Needs |
|---|---|---|
| Button, Fieldset, Input, Select, Textarea | Danger/error colors are hardcoded `#dc2626` / `#b91c1c` (Tailwind red-600/700), not tokens. Breaks Hard Rule 4; stylelint warns. | The error/danger color tokens from Figma, added to `globals.css` |
| DialerCard | Hardcoded hex backgrounds (`#1a1a1a`, `#333333`, `#bf0a0a`, `#a80909`, `#ffcaca`); sourced from a different Figma file. | Decide whether it belongs in this system; if so, re-extract from the Agentic file |
| Navigation | No `:focus-visible` rule, so keyboard focus is invisible. Fails `npm run audit:states`. | The focus state from the Navigation component set in Figma |
| MenuItem | `aria-checked` on `role="menuitem"` is invalid ARIA (eslint warning). | Whether selectable menus are single-select (`menuitemradio`) or multi-select (`menuitemcheckbox`) |
| Button and most components | No `// Source / Extracted / Tokens` header (Hard Rule 7), so the Figma node is unknown. | Re-link each to its Figma node |

## Icons

63 SVGs live in `public/assets/icons/`. `.ai/icon-inventory.md` is still an empty template; fill it (layer name, dimensions, fill/stroke) the next time icons are extracted from Figma.
