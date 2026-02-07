# Specification

## Summary
**Goal:** Ensure the TrackTitleMarquee right-to-left scrolling animation works reliably in production when the track title overflows, across both the MiniPlayer and NowPlayingScreen.

**Planned changes:**
- Fix the right-to-left marquee animation so it continuously scrolls only when the track title overflows its container in both MiniPlayer and NowPlayingScreen.
- Update the overflow measurement logic to re-measure after layout-affecting events (font loading, track title changes, and container resizing) so the marquee cannot get stuck in a non-animated state.
- Ensure the marquee respects reduced-motion preferences and that existing pause/resume interactions continue to work without breaking subsequent scrolling.
- Ensure any observers/listeners used for measurement are properly cleaned up on unmount to avoid leaks across navigation/remounts.

**User-visible outcome:** Long track titles smoothly scroll right-to-left in both player views when needed, remain static when not overflowing, respect reduced-motion settings, and continue working correctly after title/size/font changes and after pausing/resuming.
