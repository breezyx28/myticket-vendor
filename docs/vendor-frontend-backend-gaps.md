# Vendor dashboard — frontend vs backend API gaps

**Date:** 2026-06-08  
**Audience:** Backend team  
**Reference:** [`vendor-api-endpoints.md`](vendor-api-endpoints.md)  
**Frontend:** Vendor SPA (`vendor/`)

The vendor dashboard implements features against the contracts below. Where the backend is not yet aligned, the UI degrades gracefully (read-only fallback, toast error).

---

## P0 — Post-approval media

| Frontend need | Documented in `vendor-api-endpoints.md` | Proposed contract |
|---------------|----------------------------------------|-------------------|
| Update profile logo | `PATCH /me/vendor-profile` lists only `business_name`, `bio`, `website_url`, `instagram_handle`, `coverage_area` | Add `profile_image` (string URL alias → `profile_image_url`), mirroring talent `PATCH /me/talent-profile` |
| Add portfolio image | Gallery CRUD only on `POST/DELETE /role-applications/vendor/{id}/gallery` (draft/rejected) | `POST /me/vendor-profile/gallery` body: `{ image_url, caption?, position? }` → `201` gallery row |
| Remove portfolio image | — | `DELETE /me/vendor-profile/gallery/{itemId}` → `200` |
| Upload context | `POST /uploads` contexts: `vendor_application`, `vendor_document` | Add `vendor_profile` (or accept `vendor_application` for live gallery uploads) |

**Frontend behavior until shipped:** Portfolio page shows read-only gallery from `GET /me/vendor-profile`; upload controls show API error toast on 404/422.

---

## P1 — Notifications

| Frontend need | Documented | Proposed / shared contract |
|---------------|------------|---------------------------|
| In-app inbox | §8 lists kinds only; `GET /me/notifications` cross-referenced | Full schema in vendor doc (paginated `data`, `unread_count`, `read_at`, `href`) |
| Engagement alerts | Handoff mentions `/engagements?focus={id}` deep links | Kinds: `engagement_message`, `new_engagement` (or equivalent) with `href` relative to `FRONTEND_VENDOR_URL` |
| Per-channel prefs | — | `GET/PATCH /me/notifications/preferences` OR document that `PATCH /me/preferences` is sufficient |
| Polling guidance | — | `GET /me/notifications/stream` → `{ transport: "polling", poll_interval_seconds, since }` |

**Vendor-relevant notification kinds (§8):**

- `role_application_approved` → `/`
- `role_application_rejected` → `/application/status`
- `government_id_verified` / `government_id_rejected` → `/government-id`
- Engagement message (vendor recipient) → `/engagements?focus={engagementId}`

---

## P2 — Account management (shared main API)

Not duplicated in vendor doc; frontend uses shared main endpoints:

| Endpoint | Purpose |
|----------|---------|
| `PATCH /me` | `full_name`, `display_name`, `bio`, `avatar_url`, `phone` |
| `POST /auth/password/change` | `{ current_password, new_password }` |
| `POST /auth/email/change` | `{ new_email, current_password }` → verification email |
| `GET /me/preferences` + `PATCH /me/preferences` | Language, theme, email/push/sms/marketing toggles |
| `GET /me/sessions`, `DELETE /me/sessions/{id}` | Session list / revoke |
| `GET /me/devices`, `POST /me/devices`, `DELETE /me/devices/{id}` | Push device tokens |

---

## Already aligned (no gap)

| Feature | Endpoints |
|---------|-----------|
| Live profile text | `GET/PATCH /me/vendor-profile` |
| Availability | `GET/PUT /me/vendor-availability` |
| Engagements / chat | `GET /me/engagements`, messages, accept/decline/complete |
| Ratings display | `GET /me/vendor-profile` stats + `GET /vendors/{slug}/ratings` |
| Onboarding gallery | Application gallery endpoints |
| Government ID | `GET/POST /me/government-id-verification` (§6) |

---

## Out of scope (by design)

- Post-approval **service category** editing (provisioned at approval)
- Region/city on live vendor profile via `PATCH /me/vendor-profile`
- Dedicated analytics / revenue API
- SSE for notifications (polling only)

---

## Tests to add (backend)

Extend [`VendorDashboardGapsTest.php`](../tests/Feature/Marketplace/VendorDashboardGapsTest.php) or equivalent:

1. `PATCH /me/vendor-profile` with `profile_image` updates `profile_image_url`
2. `POST/DELETE /me/vendor-profile/gallery` CRUD after approval
3. Notification `href` values resolve to vendor SPA paths
4. `GET /me/notifications` returns vendor engagement notifications for vendor users
