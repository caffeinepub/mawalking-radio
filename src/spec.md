# Specification

## Summary
**Goal:** Grant admin access to the currently logged-in user by adding their principal ID to the backend admin list.

**Planned changes:**
- Add the user's principal ID to the backend's admin principals collection
- Ensure admin status persists across canister upgrades
- Verify the Admin Panel section becomes visible in Settings after admin status is granted

**User-visible outcome:** After logging in, the user will see the Admin Panel section with the "Manage Venues" button in the Settings screen, allowing them to access admin features.
