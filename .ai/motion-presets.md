# Motion Rules for Component Generation
> Version: 1.0 | System: Esthétique Design System | Runtime: Next.js + Framer Motion (motion/react)

<source_of_truth>
Import ALL animation values from:
- `@/lib/motionPresets` — Framer Motion variant objects (variants + transition + intent)
- `@/tokens/motion`    — Raw token values (semanticMotion, motionDuration, motionEasing)
- `@/lib/contextAnimationMap` — Context → preset mappings
- `@/lib/springs`      — Named spring configurations
- `@/lib/motionHooks`  — useMotionPreset, useContextAnimation, useReducedMotionSafe

NEVER hardcode duration values (e.g. `0.3`) or easing arrays (e.g. `[0.4, 0, 1, 1]`) in component files.
ALWAYS reference token names and preset keys. ALWAYS import from the paths above.
</source_of_truth>

<lookup_table>
## Primary Lookup: Component × Trigger → Preset

| Component      | Trigger       | Preset               | Framer Motion API                    |
|----------------|---------------|----------------------|--------------------------------------|
| button         | hover         | hover-scale          | whileHover                           |
| button         | tap           | press-scale          | whileTap                             |
| button         | mount         | enter-fade-up        | initial/animate                      |
| modal          | mount         | enter-scale-spring   | AnimatePresence + initial            |
| modal          | unmount       | exit-scale-down      | exit prop                            |
| modal backdrop | mount/unmount | enter-fade / exit-fade | Separate motion.div                |
| dropdown       | open          | enter-fade-up        | AnimatePresence                      |
| dropdown       | close         | exit-fade            | exit prop                            |
| dropdown item  | hover         | state-change-color   | whileHover                           |
| toast          | enter         | enter-slide-top      | AnimatePresence mode="popLayout"     |
| toast          | exit          | exit-fade            | exit prop                            |
| sidebar        | open/close    | enter-slide-right    | AnimatePresence (spring, re-dock rule) |
| card (in list) | mount         | enter-fade-up        | variants + parent stagger            |
| card           | hover         | hover-lift           | whileHover                           |
| card (modal)   | mount         | enter-scale-spring   | Context overrides default            |
| input          | focus         | state-change-color   | CSS transition only                  |
| accordion      | expand        | expand-height        | AnimatePresence + layout             |
| accordion      | collapse      | expand-height        | exit prop                            |
| list/grid      | items mount   | stagger-children (parent) + enter-fade-up (items) | Parent variants |
| page           | mount         | enter-fade-up        | whileInView OR initial               |
| tooltip        | show          | enter-fade           | AnimatePresence                      |
| tooltip        | hide          | exit-fade            | exit prop                            |
</lookup_table>

<context_overrides>
## Context Override Rules

When a `context` prop or comment indicates deployment context, these override the default lookup:

- `in-list`:          enter-fade-up + stagger-children on parent (50ms stagger, 10 item max)
- `standalone-modal`: enter-scale-spring (spring physics always)
- `in-hero`:          enter-fade-up with whileInView + viewport={{ once: true, margin: "-100px" }}
- `in-form`:          enter-fade (opacity only — no spatial motion in forms)
- `toast-stack`:      enter-slide-top + AnimatePresence mode="popLayout"
- `in-sidebar`:       enter-slide-right (re-dock rule — standard easing, NOT exit easing)
- `drag-reorder`:     NO variants — layout prop + AnimatePresence only
- `content-replace`:  enter-fade / exit-fade only (AI skeleton → content swap)
</context_overrides>

<behavioral_rules>
## Behavioral Rules (Non-negotiable)

1. ASYMMETRIC DURATION: Exits are always shorter than entrances.
   Base: 150ms exit vs. 300ms enter. Tooltip: 75ms exit vs. 100ms enter.

2. EXIT EASING: Permanent exits → ease-in [0.4, 0, 1, 1].
   Re-docking panels (sidebar, drawer) → standard [0.4, 0, 0.6, 1].

3. ANIMATEPRESENCE REQUIRED: Any component with an `exit` prop MUST be wrapped
   in <AnimatePresence>. Conditional render lives INSIDE AnimatePresence.

4. STAGGER CAP: Total stagger time must stay ≤500ms.
   At staggerChildren: 0.05, max 10 items. Reduce to 0.03 for larger lists.

5. SPRING FOR MODALS: Modal, dialog, sheet, command palette → always use spring
   physics (stiffness: 300, damping: 24), not duration-based easing.

6. GPU PROPERTIES ONLY: Only animate `opacity` and `transform`.
   NEVER animate width, height, top, left, margin, padding, border-width.
   For height expansion → expand-height preset + overflow: hidden wrapper.

7. LIST EXIT — NO STAGGER: List items exit simultaneously (no staggerChildren on exit).

8. REDUCED MOTION: Root layout MUST wrap <MotionConfig reducedMotion="user">.
   Do not add this to individual components — it belongs in the root provider.

9. VALUE-SPECIFIC TRANSITIONS: When one element needs different physics for
   position vs. opacity, use value-specific transitions:
   ```tsx
   transition={{
     default: { type: "spring", stiffness: 300, damping: 28 },  // for y
     opacity: { duration: 0.2, ease: "linear" },                // for opacity
   }}
   ```
   Spring physics on opacity looks wrong (overshoots → flash of white).
   Always use tween for opacity, spring for spatial transforms.

10. IMPORT PATH: Always `from "motion/react"` — never `from "framer-motion"`.
    The package was renamed in 2025.
</behavioral_rules>

<code_patterns>
## Code Pattern Reference

### Standard mount/unmount:
```tsx
import { AnimatePresence, motion } from "motion/react";
import { motionPresets } from "@/lib/motionPresets";

const preset = motionPresets["enter-fade-up"];

<AnimatePresence>
  {isVisible && (
    <motion.div
      variants={preset.variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={preset.transition}
    />
  )}
</AnimatePresence>
```

### Hover + tap interaction:
```tsx
const hover = motionPresets["hover-lift"];
const press = motionPresets["press-scale"];

<motion.div
  initial="rest"
  whileHover={hover.variants.hovered}
  whileTap={press.variants.pressed}
  animate="rest"
  transition={hover.transition}
/>
```

### Staggered list:
```tsx
const parent = motionPresets["stagger-children"];
const item   = motionPresets["enter-fade-up"];

<motion.ul
  variants={parent.variants}
  initial="hidden"
  animate="visible"
>
  {items.map(i => (
    <motion.li key={i.id} variants={item.variants} transition={item.transition}>
      {i.content}
    </motion.li>
  ))}
</motion.ul>
```

### Modal (spring + AnimatePresence):
```tsx
const modalPreset   = motionPresets["enter-scale-spring"];
const exitPreset    = motionPresets["exit-scale-down"];
const overlayPreset = motionPresets["enter-fade"];

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        key="overlay"
        variants={overlayPreset.variants}
        initial="hidden" animate="visible" exit="hidden"
        transition={overlayPreset.transition}
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        key="modal"
        role="dialog"
        variants={modalPreset.variants}
        initial="hidden" animate="visible"
        exit={exitPreset.variants.hidden}
        transition={modalPreset.transition}
      >
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Scroll-triggered reveal (in-hero context):
```tsx
const preset = motionPresets["enter-fade-up"];

<motion.div
  variants={preset.variants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  transition={preset.transition}
/>
```

### Using the useContextAnimation hook:
```tsx
import { useContextAnimation } from "@/lib/motionHooks";

function CardGrid({ items }) {
  const { itemProps, parentProps } = useContextAnimation("in-list");

  return (
    <motion.div {...parentProps} className="grid grid-cols-3 gap-4">
      {items.map(item => (
        <motion.div key={item.id} {...itemProps}>
          <Card data={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Skeleton-to-content swap (AI/agentic):
```tsx
<AnimatePresence mode="wait">
  {isLoading ? (
    <motion.div
      key="skeleton"
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
    >
      <ComponentSkeleton />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
    >
      {streamedContent}
    </motion.div>
  )}
</AnimatePresence>
```
</code_patterns>

<few_shot_example>
## Few-Shot Example: Correctly Animated Card in List

INPUT: "Generate an AICard component for use in a grid of AI-generated results"

OUTPUT:
```tsx
import { motion } from "motion/react";
import { motionPresets } from "@/lib/motionPresets";

const enterPreset = motionPresets["enter-fade-up"];
const hoverPreset = motionPresets["hover-lift"];
const pressPreset = motionPresets["press-scale"];

// Parent grid — controls stagger for all AICards
export function AICardGrid({ items }: { items: AIResult[] }) {
  const stagger = motionPresets["stagger-children"];
  return (
    <motion.div
      className="grid grid-cols-3 gap-4"
      variants={stagger.variants}
      initial="hidden"
      animate="visible"
    >
      {items.map(item => (
        <AICard key={item.id} item={item} />
      ))}
    </motion.div>
  );
}

// Individual card — inherits stagger timing from parent
export function AICard({ item }: { item: AIResult }) {
  return (
    <motion.div
      variants={enterPreset.variants}
      transition={enterPreset.transition}
      whileHover={hoverPreset.variants.hovered}
      whileTap={pressPreset.variants.pressed}
      className="rounded-xl border border-gray-100 p-4 cursor-pointer"
    >
      {item.content}
    </motion.div>
  );
}
```
</few_shot_example>
