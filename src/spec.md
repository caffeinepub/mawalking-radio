# Specification

## Summary
**Goal:** Make the right-to-left track title marquee feel calmer by slightly reducing scroll speed and adding a subtle pause at the loop boundary, without changing behavior or accessibility.

**Planned changes:**
- Tune the marquee animation parameters on both Mini Player and Now Playing so overflowed track titles scroll right-to-left a bit slower than the current default.
- Add a small, perceptible pause at the end/start repeat point while keeping the scrolling portion smooth and continuous (no jumps/stutter) and preserving the seamless duplicate-text marquee effect.
- Keep existing interactions and accessibility behavior unchanged (pause/resume via pointer and keyboard; no animation under prefers-reduced-motion).

**User-visible outcome:** On Mini Player and Now Playing, long track titles still marquee only when needed, but the motion feels slightly slower and less aggressive with a brief pause at each loop point, while all existing pause/resume and reduced-motion behavior remains the same.
