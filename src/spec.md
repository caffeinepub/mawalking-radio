# Specification

## Summary
**Goal:** Improve frontend visuals and performance by shrinking the global background asset, making the Home tab label white/bolder, and increasing the prominence of the Home Play/Pause button.

**Planned changes:**
- Create a new global background image asset at 1/5 the original width and height, and update all references to use the new filename (App fixed background, Settings/About cache-clearing logic, and service worker special-casing).
- Update bottom navigation styling so the “Home” label renders in white with a bolder font weight, without unintentionally changing other tabs.
- Adjust the Home screen Play/Pause button styling to be more visually prominent while preserving existing behavior, loading spinner, and disabled states.

**User-visible outcome:** The app looks the same but loads a smaller global background image, the “Home” tab label is white and bolder, and the Play/Pause button on Home is easier to see while functioning exactly as before.
