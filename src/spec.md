# Specification

## Summary
**Goal:** Redesign Mawalking Radio’s frontend into a modern, mobile-first, TuneIn-style listening-first experience with a cohesive dark theme and strong African Rhumba visual identity, enabling one-tap live playback from app open.

**Planned changes:**
- Update the app’s mobile-first Home/Live experience to load by default and feature a prominent “Play Live Rhumba / Listen Live” hero action, Live Now status with subtle on-air indicator, and quick actions (Favorite, Share, Schedule).
- Add a 3-tab bottom navigation (Home, Browse/Shows, Settings/About) with touch-friendly targets and persistent audio playback across navigation.
- Implement a persistent bottom mini-player visible during playback (optionally paused) that opens an expanded Now Playing screen.
- Build an expanded Now Playing screen with branded background/art, metadata display with truncation/marquee, playback controls, compact volume slider, and optional sleep-timer UI (or “Coming soon”).
- Create a Browse/Shows/Schedule area with card-based show list, client-side filters (using local/mock data if needed), show detail view, and “Add to calendar” via downloadable .ics.
- Add a minimal Settings/About screen with mission copy, contact info placeholder, and optional theme/stream-quality controls (dark by default).
- Define and apply a small reusable component set (buttons, show cards, bottom nav, mini-player, live badges/indicators) consistently across screens.
- Update visual styling tokens for a dark, high-contrast theme with a non-blue/non-purple accent color, ensuring readability over album-art backgrounds and keeping existing fallback/overlay behavior.
- Add and reference new static generated Mawalking African Rhumba visual assets from `frontend/public/assets/generated` (hero/artwork, logo mark, background pattern, show placeholders).

**User-visible outcome:** On mobile, users land on a listening-first Home screen and can start the live stream in one tap, navigate via bottom tabs without interrupting audio, access a persistent mini-player and a full Now Playing view, browse shows/schedule with filters and add events to their calendar, and view a simple Settings/About page—presented in a cohesive dark African Rhumba style.
