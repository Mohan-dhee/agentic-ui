# Diagnostics — When a Pipeline Step Fails

Load this only when something fails. Find the symptom, apply the fix, retry once. If it still fails, stop and report the exact error to the user instead of improvising.

## Figma MCP

| Symptom | Cause | Fix |
|---|---|---|
| "authentication required" / 401 / 403 | The MCP server is connected but not signed in to Figma | Ask the user to authorize the Figma connector (claude.ai connector settings, or `/mcp` in an interactive `claude` session). Never ask for a token in chat. |
| figma-console-mcp: "REST API authentication required" | Its REST features need OAuth | Same as above, or have the user run the Desktop Bridge plugin in Figma Desktop and use the plugin-backed tools (`figma_capture_screenshot`, `figma_execute`) |
| Node not found | Wrong file, or ID format | URLs use `node-id=123-456`; the API wants `123:456`. Confirm the file key in the URL matches the file the user owns |
| File not found / no access | The file lives in another account (e.g. the vendor's) | The user duplicates it to their drafts and shares the new link |
| Tool names in the docs don't exist | Different MCP server | See the mapping table in `.ai/extraction.md` |
| Output has no variables, only raw values | Layers use detached/hardcoded styles | Stop. Report which layers, per Hard Rule 1. Do not guess tokens |

## Build and types

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module '@/tokens/…'` | `@/*` maps to the repo root, not `src/` | Import as `@/src/tokens/…` or `@/app/…` |
| `Property 'hidden' does not exist on type …` in motion code | Presets have different variant keys, so the union type lacks the key | Widen with `Variants` first (see `variantsOf` in `src/lib/motionHooks.ts`) |
| ESLint `Cannot access refs during render` | Reading or writing `ref.current` in the render body | Move it into an effect or event handler; return memoized APIs from hooks |
| ESLint reports thousands of problems | It is linting build output | Add the folder to `globalIgnores` in `eslint.config.mjs` |

## CSS and tokens

| Symptom | Cause | Fix |
|---|---|---|
| Fonts fall back to system fonts | `--font-*` classes are not on `<html>` | `app/layout.tsx` and `.storybook/preview.tsx` both apply `fontVariables` from `app/fonts.ts` |
| A `var(--…)` resolves to nothing | Token missing from `app/globals.css` | Check the token exists; if Figma has it but code doesn't, add it to `globals.css` with the exact Figma name |
| `npm run sync:motion` fails | CSS motion tokens and `app/components/motion.ts` drifted | Update whichever side is wrong so both match Figma |
| stylelint `color-no-hex` warning | Hardcoded color in a component | Replace with the matching token |

## Tests (Vitest + jsdom)

| Symptom | Cause | Fix |
|---|---|---|
| Focus assertions fail in a focus-trap test | jsdom has no layout, so `offsetParent` is always `null` and the trap finds nothing focusable | Test focus behavior in Storybook or a real browser; test the rest (Escape, scroll lock) in Vitest |
| `toHaveNoViolations` is not a function | Setup file not loaded | Check `setupFiles` in `vitest.config.mts` points at `vitest.setup.ts` |

## Storybook

| Symptom | Cause | Fix |
|---|---|---|
| Story not listed | Stories are only read from `app/**` | Put `[Name].stories.tsx` beside the component |
| Components render unstyled | `globals.css` not loaded | `.storybook/preview.tsx` must import `../app/globals.css` |
| Build warns "module level directive may not be preserved" | `'use client'` inside Storybook's bundle | Harmless; ignore |
| Storybook MCP not reachable at `localhost:6006/mcp` | Storybook isn't running | Start it with `npm run storybook` |

## State audit

| Symptom | Cause | Fix |
|---|---|---|
| `MISSING :focus-visible rule` | CSS module has `cursor: pointer` without a focus style | Pull the focus state from the Figma variant matrix. Do not invent one (Hard Rule 5) |
| `MISSING 'use client'` | Component takes event handlers | Add `'use client';` as the first line |
| `bash: not found` on Windows | npm runs scripts through cmd.exe | Install Git for Windows so `bash` is on PATH |

## SVG and icons

See `.ai/svg-pipeline.md` for viewBox, fill, and inset problems.
