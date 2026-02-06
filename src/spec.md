# Specification

## Summary
**Goal:** Make the Home screen’s initial (not playing) Play button visually stand out by rendering it larger and with a black background.

**Planned changes:**
- Update `frontend/src/screens/HomeLiveScreen.tsx` so that when `isPlaying` is false, the circular Play button uses a black background and larger dimensions.
- Ensure the Play icon scales with the new button size without clipping or misalignment.
- Keep existing Pause/connecting/loading states functional and visually consistent, without changing shared UI component source files.

**User-visible outcome:** On the Home screen, before playback starts, the Play button appears bigger and black; once playing (or while connecting/loading), the button continues to behave as it does today.
