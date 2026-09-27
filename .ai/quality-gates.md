# Phase 5 — Quality Control Levels

Every level is blocking. A component cannot advance to the next level until the current level passes.

---

## QC Level 0: Generation Gate

**Trigger**: After Phase 1 extraction, before Phase 2 generation.
**Owner**: AI self-check

Checklist:
- [ ] Spec JSON is complete (no empty fields)
- [ ] Token map covers every visual property
- [ ] Variant matrix accounts for all Figma variants
- [ ] SVG inventory is complete
- [ ] No ambiguous specs (every value is explicit)
- [ ] Every icon SVG has `viewBox` matching Figma frame size (not path bounds)
- [ ] All icon fills normalized to `#000000` (not Figma base gray)
- [ ] Icon paths wrapped in `<g transform="translate(x, y)">` with correct MCP inset offsets

**Fail** → Re-extract from Figma. Do not proceed.
**Pass** → Begin generation.

---

## QC Level 1: Visual Fidelity

**Trigger**: Component renders in Storybook or showcase.
**Owner**: Designer (user) — visual inspection

Checklist:
- [ ] Side-by-side Figma vs. rendered output — pixel match
- [ ] Typography: font, weight, size, line-height, color all match
- [ ] Spacing: padding, margin, gap match Figma auto-layout
- [ ] Colors: every fill, stroke, border color matches token
- [ ] Border radius: all corners match
- [ ] Shadows: offset, blur, spread, color match
- [ ] Icons: correct SVG, correct size, correct color, correct position
- [ ] Icons at 1:1 zoom in browser match Figma exactly (no oversized/cropped viewBox)
- [ ] Responsive: component doesn't break at different container widths
- [ ] States: hover, focus, disabled, active all visually correct

**Fail** → User provides specific redline notes (e.g., "padding-left is 16px, should be 12px"). Apply fixes and re-present.
**Pass** → Proceed to refactoring passes.

---

## QC Level 2: Code Quality

**Trigger**: After refactoring passes 1-3 complete.
**Owner**: AI self-audit + linter

Automated checks:
- [ ] `tsc --noEmit` passes with zero errors
- [ ] ESLint: zero warnings, zero errors
- [ ] stylelint passes
- [ ] No `any` types anywhere
- [ ] No hardcoded visual values in `.tsx` or `.css`
- [ ] Bundle size within budget (component < 10KB gzipped)
- [ ] Tree-shaking verified: named exports only

**Fail** → Fix violations. Re-run all checks.
**Pass** → Proceed to QC Level 3.

---

## QC Level 3: Accessibility & Behavior

**Trigger**: After refactoring pass 4 (a11y hardening).
**Owner**: AI + automated testing

Automated checks:
- [ ] `jest-axe`: zero violations across all Storybook stories
- [ ] Keyboard navigation: all interactive elements reachable via Tab
- [ ] Focus management: focus ring visible, logical tab order
- [ ] Screen reader: announcements make sense

Manual checks (designer):
- [ ] Tab through component — flow is logical
- [ ] High contrast mode — component remains usable
- [ ] Zoom to 200% — no overflow, no truncation

**Fail** → A11y violations are P0. Fix before merge.
**Pass** → Proceed to QC Level 4.

---

## QC Level 4: Documentation Completeness

**Trigger**: After refactoring pass 5 (documentation).
**Owner**: AI self-check

Checklist:
- [ ] Storybook renders all variants without console errors
- [ ] README.md exists and is not boilerplate
- [ ] Props table matches actual TypeScript interface
- [ ] Usage examples are copy-pasteable and work
- [ ] Token reference table is accurate
- [ ] Do/Don't section has real, component-specific examples

**Fail** → Update docs. Re-check.
**Pass** → Component is shippable.

---

## QC Level 5: Integration Verification

**Trigger**: After component is merged to main.
**Owner**: CI/CD pipeline

Automated:
- [ ] Build passes
- [ ] All tests pass (unit + accessibility)
- [ ] Storybook builds without errors
- [ ] Visual regression test (Chromatic snapshot) — no unintended changes
- [ ] Bundle size check — no unexpected increase

Manual (sprint review):
- [ ] Component used in at least one real screen/pattern
- [ ] Tokens resolve correctly in app context (not just Storybook)
- [ ] No console errors when component renders
- [ ] Design review: matches Figma in real application context

**Fail** → Revert or hotfix. Create tracking issue.
**Pass** → Component is production-ready.
