# Specification

## Summary
**Goal:** Replace the app’s global background with the newly uploaded image, ensuring it works responsively across screens and continues to read well with the existing overlay.

**Planned changes:**
- Add the uploaded image to frontend static assets (under `frontend/public/assets/generated`) and use it as the global app background.
- Update `frontend/src/index.css` responsive background configuration to reference the new background asset(s) instead of `mawalking-pattern-bg*`.
- Update service worker pre-cache (`frontend/public/service-worker.js`) and Settings “Refresh Background” cache-clearing logic (`frontend/src/screens/SettingsAboutScreen.tsx`) to use the new background filenames.

**User-visible outcome:** All screens (Home, Now Playing, Shows, Settings) display the new uploaded image as the background with responsive behavior and maintained text readability; “Refresh Background” correctly refreshes the cached background.
