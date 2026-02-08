# Specification

## Summary
**Goal:** Make the track title marquee scroll slightly slower across the app so it feels less rushed.

**Planned changes:**
- Reduce the default `speedPxPerSecond` value used by `TrackTitleMarquee` (currently `200`) in `frontend/src/components/player/TrackTitleMarquee.tsx`.
- Ensure the Mini Player and Now Playing screen marquees continue using the default speed without changing how `TrackTitleMarquee` is called.
- Confirm the marquee duration (distance / speed) increases accordingly while still respecting the existing 3–30 second clamp, and that reduced-motion and pause-on-interaction behavior remain unchanged.

**User-visible outcome:** Track titles that scroll right-to-left in the Mini Player and Now Playing screen move at a slightly slower, less rushed speed.
