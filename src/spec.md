# Specification

## Summary
**Goal:** Preserve the right-to-left scrolling marquee for overflowing track titles across the app, and improve mobile background image framing without changing referenced asset filenames.

**Planned changes:**
- Ensure the track title marquee scroll direction remains right-to-left wherever the marquee is used (including the mini player), persists after rebuild/deploy, and respects `prefers-reduced-motion`.
- Re-crop/adjust the existing mobile background image to better fit common mobile viewports while keeping the exact existing filenames, dimensions, and asset paths used by the app.
- Ensure updated background assets are served to PWA users after reload by refreshing/invalidating relevant service worker caching for those assets.

**User-visible outcome:** On mobile and desktop, long track titles scroll continuously from right to left (or remain static/readable when reduced motion is enabled), and the mobile background appears properly framed on common phone screens with updated visuals showing up after reload.
