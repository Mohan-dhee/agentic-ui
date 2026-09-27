# Phase 1 — Design Extraction & Token Mapping

## Figma MCP Extraction Protocol

Before generating anything, read the Figma source. Use the Figma MCP connection to extract structured data from the linked frame.

### Which MCP server

These docs were written against the **official Figma MCP server** (Dev Mode MCP / the Figma plugin for Claude Code). Its `get_design_context` output is what the inset-based icon rules in `svg-pipeline.md` and `icon-extraction-rules.md` describe, so prefer it.

[figma-console-mcp](https://github.com/southleft/figma-console-mcp) also works. Its tools are named differently:

| Need | Official Figma MCP | figma-console-mcp |
|---|---|---|
| Layer tree, layout, styles for a node | `get_design_context` | `figma_get_component_for_development` |
| Variables / tokens | `get_variable_defs` | `figma_get_variables` |
| Tokens + components + styles in one call | — | `figma_get_design_system_kit` |
| Rendered image | `get_screenshot` | `figma_get_component_image` |
| Node structure only | `get_metadata` | `figma_get_file_data` |
| Designer annotations | — | `figma_get_annotations` |

With figma-console-mcp, icon insets are not pre-computed: derive them from the inner "icon" layer's bounds relative to the icon frame.

Wherever a doc says `get_design_context`, use the equivalent row above.

### Extraction Prompt

```
Figma link: [URL]

Using Figma MCP, extract from this frame:

1. COMPONENT TREE
   - Layer hierarchy (parent → children)
   - Named layers only (skip unnamed groups)
   - For each layer: type, dimensions (w×h), position (x,y relative to parent)

2. DESIGN TOKENS USED
   - Every Figma variable reference (color, spacing, radius, typography)
   - Map each to: token name → resolved value → CSS custom property
   - Flag any hardcoded values that should be tokens

3. TYPOGRAPHY STACK
   For each text layer:
   - Font family, weight, size, line-height, letter-spacing
   - Text alignment, text transform, text decoration
   - Figma text style name (if applied)
   - Resolved token name

4. SPACING MAP
   - Padding (per side if asymmetric)
   - Gap (auto-layout spacing)
   - Margin (if any)
   - All values as token references, not raw px

5. VISUAL EFFECTS
   - Box shadows (offset-x, offset-y, blur, spread, color, inset)
   - Border (width, style, color, per-side if different)
   - Border radius (per-corner if different)
   - Opacity
   - Backdrop filters

6. SVG / ICON INVENTORY
   - Every vector/SVG layer: name, dimensions, color tokens used
   - Whether fill or stroke, with exact color values
   - Export settings (if available via API)

7. VARIANTS & STATES
   - List every Figma variant property and its values
   - Map: Figma property=value → React prop={value}
   - Identify boolean variants (show/hide elements)

8. AUTO-LAYOUT ANALYSIS
   - Direction (horizontal/vertical)
   - Primary axis alignment
   - Counter axis alignment
   - Padding, gap
   - Sizing mode (fixed, hug, fill)
   → Map each to CSS flexbox equivalent
```

### Output Format

Save as structured JSON to `.ai/specs/[ComponentName].spec.json`

## Token Resolution Table

After extraction, produce a mapping table. This is the source of truth for generation.

Format:

```
| Figma Token Name              | Resolved Value | CSS Custom Property          | Usage Context              |
|-------------------------------|----------------|------------------------------|----------------------------|
| AG/Color/Primary/Default      | #2563EB        | --ag-color-primary-default   | Button bg, link color      |
| AG/Color/Primary/Hover        | #1D4ED8        | --ag-color-primary-hover     | Button hover bg            |
| AG/Spacing/Component/Button/Padding | 12px 24px | --ag-spacing-btn-padding    | Button internal padding    |
| AG/Radius/md                  | 6px            | --ag-radius-md               | Button, card, input radius |
```

Save to `.ai/tokens/[ComponentName].tokens.md`

## Pre-Generation Validation (QC-0)

Before writing any code, confirm every item passes:

- [ ] Every color has a token reference (zero raw hex in spec)
- [ ] Every spacing value maps to a token
- [ ] Typography maps to text style tokens
- [ ] All SVG/icons are inventoried with names and dimensions
- [ ] Variant matrix is complete (all property combinations listed)
- [ ] Auto-layout maps to flexbox/grid correctly
- [ ] No Figma-specific concepts leak into spec (e.g., "auto-layout" → "flexbox")

**Fail → re-extract from Figma. Do not proceed to generation.**

## Tips for Reliable Extraction

- Select the PARENT frame that includes everything needed
- If nested components exist, explicitly request: "Also fetch the Icon and Button components nested here"
- Named layers in Figma improve extraction accuracy by ~30%
- Figma variables (design tokens) extract perfectly; hardcoded values force guessing
- If MCP fails: restart Figma, re-select the frame, retry. Don't debug for more than 2 minutes; check `.ai/diagnostics.md`, then report the error.
