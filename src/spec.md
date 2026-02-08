# Specification

## Summary
**Goal:** Make the app’s UI fully responsive and usable on small mobile devices across all major screens.

**Planned changes:**
- Update layouts for Home, Now Playing, Browse Shows, Show Detail, and Settings to prevent horizontal overflow, clipping, and overlaps on small viewports.
- Adjust screen and global spacing to account for safe-area insets and the fixed bottom UI (MiniPlayer + BottomTabNav), ensuring content/actions aren’t obscured.
- Improve mobile background rendering behavior to avoid fixed-background issues (e.g., iOS Safari jitter/blank areas) and keep a consistent full-viewport appearance during scroll.

**User-visible outcome:** On common mobile sizes, all screens fit without horizontal scrolling, content remains readable and reachable above the MiniPlayer/BottomTabNav (including on notched devices), and backgrounds render smoothly while scrolling.
