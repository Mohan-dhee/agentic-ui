#!/bin/bash
# ==========================================================================
# Interactive States Audit
# Checks that every CSS module with a cursor:pointer element also has
# :hover, :focus-visible pseudo-class rules.
# Run: bash scripts/audit-interactive-states.sh
# ==========================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

echo "=========================================="
echo " Interactive States Audit"
echo "=========================================="
echo ""

# Find all CSS module files that contain cursor: pointer (interactive elements)
for cssfile in $(grep -rl "cursor:\s*pointer\|cursor: pointer" app/components/**/*.module.css 2>/dev/null); do
  component=$(basename "$(dirname "$cssfile")")
  echo "Checking: $cssfile"

  # Extract the class names that have cursor: pointer
  # These are the interactive selectors that need state rules
  has_hover=false
  has_focus=false

  if grep -q ":hover" "$cssfile"; then
    has_hover=true
  fi

  if grep -qE ":focus-visible|:focus" "$cssfile"; then
    has_focus=true
  fi

  if $has_hover && $has_focus; then
    echo -e "  ${GREEN}✓ :hover${NC}"
    echo -e "  ${GREEN}✓ :focus-visible${NC}"
    PASS=$((PASS + 1))
  else
    if ! $has_hover; then
      echo -e "  ${RED}✗ MISSING :hover rule${NC}"
      FAIL=$((FAIL + 1))
    else
      echo -e "  ${GREEN}✓ :hover${NC}"
    fi
    if ! $has_focus; then
      echo -e "  ${RED}✗ MISSING :focus-visible rule${NC}"
      FAIL=$((FAIL + 1))
    else
      echo -e "  ${GREEN}✓ :focus-visible${NC}"
    fi
  fi

  echo ""
done

# Check that interactive components are client components
echo "=========================================="
echo " Client Component Audit"
echo "=========================================="
echo ""

for tsxfile in $(grep -rl "cursor:\s*pointer\|cursor: pointer" app/components/**/*.module.css 2>/dev/null | sed 's/\.module\.css//' | while read base; do
  dir=$(dirname "$base")
  # Skip tests and stories: the pipeline generates them next to every component
  find "$dir" -maxdepth 1 -name "*.tsx" ! -name "*.test.tsx" ! -name "*.stories.tsx"
done | sort -u); do
  component=$(basename "$tsxfile")
  echo "Checking: $tsxfile"

  # Check if it has onClick, onChange, or other event handlers in props
  has_handler=$(grep -cE "onClick|onChange|onKeyDown|onFocus|onBlur" "$tsxfile" 2>/dev/null)

  if [ "$has_handler" -gt 0 ]; then
    # If it handles events, it must be a client component
    if grep -q "'use client'" "$tsxfile" || grep -q '"use client"' "$tsxfile"; then
      echo -e "  ${GREEN}✓ 'use client' directive present${NC}"
    else
      echo -e "  ${RED}✗ Has event handlers but MISSING 'use client' directive${NC}"
      FAIL=$((FAIL + 1))
    fi
  fi

  # Check if component accepts active/selected state prop
  if grep -qE "active\?|selected\?|isActive|isSelected" "$tsxfile"; then
    # If it has a state prop, check that the parent manages it (harder to verify statically)
    echo -e "  ${YELLOW}⚠ Has state prop (active/selected) — verify parent manages state via useState${NC}"
    WARN=$((WARN + 1))
  fi

  echo ""
done

# Summary
echo "=========================================="
echo " Summary"
echo "=========================================="
if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}FAIL: $FAIL issue(s) found${NC}"
  echo -e "${YELLOW}WARNINGS: $WARN${NC}"
  exit 1
else
  echo -e "${GREEN}PASS: All interactive elements have required states${NC}"
  if [ "$WARN" -gt 0 ]; then
    echo -e "${YELLOW}WARNINGS: $WARN (review manually)${NC}"
  fi
  exit 0
fi
