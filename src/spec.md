# Specification

## Summary
**Goal:** Ensure the global page background image is always fully visible (no cropping) on both mobile and desktop.

**Planned changes:**
- Update global body background CSS to switch from `background-size: cover` to `background-size: contain` for both mobile and the `@media (min-width: 768px)` rule, keeping existing `--bg-image-mobile` / `--bg-image-desktop` asset references and `background-repeat: no-repeat`.
- Adjust global `background-position` values (mobile default and desktop media rule) as needed so the contained background remains fully visible and not shifted off-screen.

**User-visible outcome:** On mobile and desktop, the full background image is shown without any cut-off, and it does not tile.
