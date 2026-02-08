# Specification

## Summary
**Goal:** Keep the live audio stream playing continuously and auto-recover from interruptions, while preventing any automatic resume after an intentional user pause.

**Planned changes:**
- Add a dedicated “user intent” playback state (e.g., `userWantsToPlay`) that is set to true only on user-initiated Play and set to false on user-initiated Pause and sleep-timer pauses.
- Update the existing playback recovery logic to automatically reconnect/resume after interruptions only when `userWantsToPlay` is true.
- Ensure recovery/transition states (e.g., connecting/buffering/reconnecting) are reflected in the UI during auto-recovery instead of remaining stuck in paused/error states.
- Integrate changes using the existing audio element in `frontend/src/App.tsx` and the existing lifecycle recovery hook `frontend/src/hooks/useAppLifecyclePlaybackRecovery.ts` (no additional audio elements).

**User-visible outcome:** After pressing Play, the stream will keep trying to recover and continue playing through interruptions; after pressing Pause (including sleep-timer pauses), the app will stay paused and won’t auto-resume until the user presses Play again.
