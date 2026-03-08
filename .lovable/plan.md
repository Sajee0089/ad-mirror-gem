

## Plan: Enhanced Admin Panel & Agent Contact Integration

### Summary
Expand the admin panel into a full site management dashboard with multiple tabs, add member blocking, ad label management, admin manual posting, delete-any-ad capability, and display the agent WhatsApp contact (0789663179) on the ad posting page.

---

### 1. Database Migration

Add a `blocked_users` table and an RLS policy for admin deletion of any ad:

- **`blocked_users` table**: `id (uuid PK)`, `user_id (uuid, NOT NULL)`, `blocked_by (uuid, NOT NULL)`, `reason (text)`, `created_at (timestamptz)`. RLS: admins can SELECT/INSERT/DELETE.
- **RLS policy on `ads`**: Add `"Admins can delete any ad"` DELETE policy using `has_role(auth.uid(), 'admin')`.
- **Update `ads` SELECT policy**: blocked users' ads should not appear publicly.

### 2. Revamp Admin Panel (`AdminAds.tsx`)

Replace the current single-tab admin page with a tabbed dashboard:

- **Tab 1 — Ads Management** (existing approve/reject + new features):
  - Add a **Delete** button on every ad (not just pending) so admin can remove any ad
  - Add a **Label** dropdown per ad to assign badge: "Super Ad", "VIP Ad", "NRA Ad" (updates `badge` column)
  - Show all ads with status filter (pending/approved/rejected)

- **Tab 2 — Members**:
  - List all users (query via `ads` table grouped by `user_id` or a simple distinct query)
  - **Block/Unblock** button per user (inserts/deletes from `blocked_users`)
  - Show blocked status

- **Tab 3 — Post Ad** (admin manual posting):
  - Same form as `PostAd.tsx` but status defaults to `"approved"` (skips moderation)
  - Admin is exempt from 5-ad daily limit

### 3. Agent WhatsApp Contact on PostAd Page

Add a prominent contact banner on the `PostAd.tsx` page:
- Display: "Need help? Contact our agent via WhatsApp: 0789663179"
- Include a clickable WhatsApp link (`https://wa.me/94789663179`)

### 4. Block Enforcement

- Update `Index.tsx` query to exclude ads from blocked users (join or subquery against `blocked_users`)
- Blocked users attempting to post will be rejected by an RLS policy or trigger check

### 5. Update Sidebar Agent Button

Wire the "Agents" button in the sidebar to open the WhatsApp contact link instead of doing nothing.

### 6. File Changes Summary

| File | Change |
|------|--------|
| Migration SQL | New `blocked_users` table, admin DELETE policy on `ads`, blocked-user filtering |
| `src/pages/AdminAds.tsx` | Full rewrite with tabs: Ads Management, Members, Manual Post |
| `src/pages/PostAd.tsx` | Add agent WhatsApp contact banner |
| `src/pages/Index.tsx` | Filter out blocked users' ads |
| `src/components/Sidebar.tsx` | Wire Agents button to WhatsApp link |
| `src/App.tsx` | No change needed (route already exists) |

