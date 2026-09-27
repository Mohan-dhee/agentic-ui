# Icon SVG Extraction Rules

> Mandatory for all Figma-to-code pipelines. Append this to the Component Prompt.

---

## The Problem

Figma MCP exports icon SVGs with the `viewBox` cropped to just the vector path bounds. This strips the internal padding that exists between the icon vectors and the Figma frame boundary.

**Example — Chevron Down icon:**
- Figma: 16×16 frame, chevron paths occupy ~10×5.7px centered with padding
- Exported SVG: `viewBox="0 0 10 5.7"` — padding lost
- Rendered at 16×16 via `mask-size: contain`: chevron scales to fill entire box — **60% larger than design**

---

## Rules

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

---

## How to Read MCP Insets

The MCP `get_design_context` output shows each icon's internal positioning as CSS percentage-based insets on the inner "icon" layer:

```jsx
// MCP output for Chevron Down (16×16 frame)
<div className="absolute inset-[33.13%_18.75%_31.25%_18.75%]" data-name="icon">
```

Convert to pixel offsets:
- `left: 18.75% × 16 = 3px` → offsetX = 3
- `top: 33.13% × 16 = 5.3px` → offsetY = 5.3

---

## Before / After Example

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

---

## Common Figma Inset Reference (16px icons)

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

## CSS Requirements

The `.bn-icon` class must use:
```css
.bn-icon {
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

---

## Validation Checklist

- [ ] Every icon SVG has `viewBox="0 0 {frameSize} {frameSize}"`
- [ ] No icon SVG has a viewBox smaller than its rendering container
- [ ] All monochrome icon fills are `#000000` (not Figma base component gray)
- [ ] Paths are wrapped in `<g transform="translate(x, y)">` when offset is needed
- [ ] Visual comparison: icon in browser matches icon in Figma at 1:1 zoom
