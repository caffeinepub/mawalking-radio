# Specification

## Summary
**Goal:** Shift the existing global background image positioning 2 inches down and 3 inches left on both mobile and desktop.

**Planned changes:**
- Update `frontend/src/index.css` `body` (mobile default) `background-position` values to achieve ~2in down / ~3in left offset while keeping `background-size: cover` and the same background image reference.
- Update `frontend/src/index.css` `@media (min-width: 768px) { body { ... } }` (desktop) `background-position` values to achieve ~2in down / ~3in left offset while keeping `background-size: cover` and the same background image reference.

**User-visible outcome:** On both mobile and desktop, the site’s existing background image appears shifted downward and to the left compared to the prior positioning, with the image still covering the viewport.
