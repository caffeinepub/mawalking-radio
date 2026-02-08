# Specification

## Summary
**Goal:** Update the right-to-left track title marquee scrolling speed across the app.

**Planned changes:**
- Update the default `speedPxPerSecond` used by `TrackTitleMarquee` so overflowed track titles scroll at the new desired rate.
- Ensure both `MiniPlayer` and `NowPlayingScreen` use the same updated marquee speed behavior while keeping direction right-to-left.
- Preserve existing reduced-motion behavior (disables marquee) and the existing duration calculation and clamp (3s–30s).

**User-visible outcome:** Long track titles in the Mini Player and Now Playing screen scroll right-to-left at the updated speed, while reduced-motion preference still prevents scrolling.
