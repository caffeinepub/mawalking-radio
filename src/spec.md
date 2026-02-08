# Specification

## Summary
**Goal:** Replace the app’s global background with a Nairobi, Kenya skyline image while keeping existing styling and asset references intact.

**Planned changes:**
- Add new Nairobi skyline background image assets using the exact existing filenames and dimensions already referenced by the app (mobile and desktop variants) under `frontend/public/assets/generated/`.
- Update PWA/service worker caching/versioning so the new background assets are fetched on the next reload without requiring users to clear caches.
- Keep the existing dark overlay readability treatment (`body::before`) unchanged so the UI remains readable.

**User-visible outcome:** After reloading the app, users see a Nairobi skyline background on both mobile and desktop, and the updated image appears without needing manual cache clearing or using any refresh setting.
