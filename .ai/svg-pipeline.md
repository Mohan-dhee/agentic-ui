# Phase 3 — SVG & Icon Pipeline

## Critical: Figma MCP viewBox Cropping Fix

Figma MCP exports icon SVGs with the `viewBox` cropped to just the vector path bounds. This strips the internal padding between the icon vectors and the Figma frame boundary.

**Example — Chevron Down icon:**
- Figma: 16×16 frame, chevron paths occupy ~10×5.7px centered with padding
- Exported SVG: `viewBox="0 0 10 5.7"` — padding lost
- Rendered at 16×16 via `mask-size: contain`: chevron scales to fill entire box — **60% larger than design**

### Rule 1: viewBox Must Match Figma Frame Size

Every icon SVG must have a `viewBox` that matches the Figma icon component's frame dimensions:
- 16px icons → `viewBox="0 0 16 16"`
- 20px icons → `viewBox="0 0 20 20"`
- 24px icons → `viewBox="0 0 24 24"`

**Never** use a viewBox smaller than the icon's rendering container.

### Rule 2: Preserve Internal Padding via translate()

After extracting an SVG from Figma MCP:
1. Read the MCP output for the icon's inner layer insets (e.g., `inset-[33.13%_18.75%_31.25%_18.75%]`)
2. Calculate pixel offsets: `offsetX = left% × frameSize`, `offsetY = top% × frameSize`
3. Wrap all `<path>` elements in `<g transform="translate(offsetX, offsetY)">`
4. Set `viewBox="0 0 {frameSize} {frameSize}"`

**Fallback** (no MCP inset data): center the paths within the frame:
```
offsetX = (frameSize - currentViewBoxWidth) / 2
offsetY = (frameSize - currentViewBoxHeight) / 2
```

### Rule 3: Normalize Fills to #000000

Figma exports icons with the base component fill color (often gray `#8F8F8F`), not the instance override. Always change all `fill` values to `#000000` for correct `mask-image` rendering.

### How to Read MCP Insets

The MCP `get_design_context` output shows each icon's internal positioning as CSS percentage-based insets on the inner "icon" layer:

```jsx
// MCP output for Chevron Down (16×16 frame)
<div className="absolute inset-[33.13%_18.75%_31.25%_18.75%]" data-name="icon">
```

Convert to pixel offsets:
- `left: 18.75% × 16 = 3px` → offsetX = 3
- `top: 33.13% × 16 = 5.3px` → offsetY = 5.3

### Before / After Example

**Extracted from Figma (broken):**
```svg
<svg viewBox="0 0 10 5.7" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 5.7L0 0.7L0.7 0L5 4.3L9.3 0L10 0.7L5 5.7Z" fill="#8F8F8F"/>
</svg>
```

**Fixed (correct):**
```svg
<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(3, 5.3)">
    <path d="M5 5.7L0 0.7L0.7 0L5 4.3L9.3 0L10 0.7L5 5.7Z" fill="#000000"/>
  </g>
</svg>
```

### Common Figma Inset Reference (16px icons)

| Icon | Figma Insets (T R B L %) | Pixel Offset (x, y) |
|------|--------------------------|---------------------|
| Chevron Down | 33.13% 18.75% 31.25% 18.75% | translate(3, 5.3) |
| Chevron Up | 31.25% 18.75% 33.13% 18.75% | translate(3, 5) |
| Close | 18.75% all | translate(3, 3) |
| Close Large | 18.75% all | translate(3, 3) |
| Menu Open | 12.5% all | translate(2, 2) |
| Overflow Menu Vertical | 18.75% 43.75% | translate(7, 3) |
| Arrow Up Right | 18.75% all | translate(3, 3) |
| Home | 6.25% 3.13% 12.5% 3.13% | translate(0.5, 1) |
| Apps | 6.25% all | translate(1, 1) |
| Caret Down | 37.5% 25% 31.25% 25% | translate(4, 6) |
| Caret Up | 31.25% 25% 37.5% 25% | translate(4, 5) |

---

## SVG Export from Figma

1. Select the icon frame (not the parent component)
2. Right panel → Export → SVG
3. Settings: Include "id" attribute = OFF
4. Flatten boolean operations before export
5. Outline strokes if stroke-based icon
6. Export at 1x (not 2x)

## SVGR Conversion

Each SVG becomes a React component. Either run:
```
npx @svgr/cli --typescript --ref --memo -- [file.svg]
```

Or manually create following this template:

```tsx
// icons/ChevronDown.tsx — CORRECTED with viewBox fix
import type { SVGProps } from 'react';

export const ChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}              // ← exact Figma FRAME dimensions
    height={16}
    viewBox="0 0 16 16"    // ← MUST match frame, not path bounds
    fill="none"
    aria-hidden="true"     // ← decorative by default
    {...props}             // ← allows overrides
  >
    <g transform="translate(3, 5.3)">  {/* ← offset from MCP insets */}
      <path
        d="M5 5.7L0 0.7L0.7 0L5 4.3L9.3 0L10 0.7L5 5.7Z"
        fill="#000000"       // ← normalized fill for mask-image
      />
    </g>
  </svg>
);
```

## CSS Requirements for Icon Rendering

Icons rendered via CSS `mask-image` require this base class:

```css
.ag-icon {
  display: inline-block;
  flex-shrink: 0;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
```

This only produces correct results when the SVG `viewBox` matches the frame size.

## Color Handling in SVGs

- **Mask-image icons** (preferred for monochrome): `fill="#000000"` — color comes from CSS `background-color: currentColor` on the mask container
- **Inline SVG icons**: `fill="currentColor"` or `stroke="currentColor"` — inherits from parent CSS `color`
- **Multi-color SVGs**: Use CSS custom properties:
  - `fill="var(--ag-icon-primary)"` for the primary shape
  - `fill="var(--ag-icon-secondary)"` for accent elements
- **NEVER** hardcode a Figma base component fill color (like `#8F8F8F`) — normalize to `#000000`

## Sizing

- `width` and `height` from Figma frame dimensions (exact px, no rounding)
- `viewBox` MUST match the Figma frame size, NOT the path bounding box
- CSS can override via `width`/`height` props on the component

## Logo vs Icon Distinction

**Icons:**
- Live in `app/components/[ComponentName]/icons/`
- Use `currentColor` for color inheritance
- Decorative by default (`aria-hidden="true"`)
- Named exports for tree-shaking

**Logos:**
- Live in `src/assets/logos/`
- Preserve exact Figma dimensions
- Use explicit color tokens (NOT `currentColor`)
- Include both the React component AND the raw `.svg` file
- Are NOT decorative — may need `aria-label` or `role="img"`

## Naming Convention

- PascalCase: `ChevronDown`, `ArrowRight`, `Close`
- Match Figma layer name (converted to PascalCase)
- Prefix with `Icon` if needed to avoid naming conflicts: `IconChevronDown`, `IconClose`

## Icon Inventory

Maintain a running inventory at `.ai/icon-inventory.md`:

```
| Icon Name     | Figma Layer    | Dimensions | Type    | Color Mode     | Used In            |
|---------------|----------------|------------|---------|----------------|--------------------|
| ChevronDown   | Icon/Chevron/D | 16×16      | Stroke  | currentColor   | Select, Accordion  |
| Close         | Icon/Close     | 12×12      | Stroke  | currentColor   | Modal, Tag, Toast  |
| Logo          | Brand/Logo     | 120×32     | Multi   | Explicit tokens| Header, Footer     |
```

Update this file every time a new icon is extracted.

## Absolute Never-Do List

- ❌ Replace an SVG with a unicode character (`✕` instead of close icon)
- ❌ Use emoji as icon placeholders
- ❌ Approximate an icon with CSS shapes
- ❌ Scale icons disproportionally (if Figma says 16×16, it's 16×16)
- ❌ Remove SVG metadata that affects rendering (`viewBox`, `fill-rule`)
- ❌ Convert stroked icons to filled or vice versa
- ❌ Add decorative SVGs that don't exist in the Figma source
