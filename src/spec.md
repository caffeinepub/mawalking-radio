# Specification

## Summary
**Goal:** Improve full-page background image alignment/visibility by changing the global `body` background sizing mode from `contain` to either `100% auto` or `auto 100%`.

**Planned changes:**
- Update `frontend/src/index.css` `body` background to remove `background-size: contain` and apply `background-size: 100% auto` and/or `background-size: auto 100%`.
- Keep existing background image asset references (including current `image-set` URLs), `background-repeat: no-repeat`, and current positioning unless adjustment is necessary for the new sizing behavior.

**User-visible outcome:** The app’s global background image displays with the new sizing mode (no tiling) and should appear better aligned/visible across mobile and desktop without introducing obvious cropping.
