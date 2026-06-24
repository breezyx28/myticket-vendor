# Frontend handoff: Vendor platform updates

**Date:** 2026-06-22  
**Audience:** Vendor dashboard / SPA  
**API base:** `https://<host>/api/v1/main`  
**Auth:** Sanctum token with `app:main`  
**Related:** [`frontend-handoff-vendor-api.md`](frontend-handoff-vendor-api.md), [`frontend-handoff-register-with-role.md`](frontend-handoff-register-with-role.md), [`frontend-handoff-api-localization.md`](frontend-handoff-api-localization.md)

---

## Summary

| Area | What changed | Frontend action |
|------|----------------|-----------------|
| Register (`role: vendor`) | Returns main-app token in `201` | Store token after signup |
| Vendor profile images | Full URLs on read | Use `profile_image` / `profile_image_url` as `src` |
| Notifications | Arabic via `Accept-Language` | Locale header on inbox calls |
| Localization | Validation & errors localized | Send `Accept-Language` on all requests |

---

## 1. Signup with `role: vendor`

**Endpoint:** `POST /api/v1/main/auth/register`

```json
{
  "email": "vendor@example.com",
  "password": "Password123!",
  "full_name": "Vendor User",
  "role": "vendor"
}
```

**201 response:**

```json
{
  "message": "Registered successfully.",
  "user_id": 7,
  "role": "vendor",
  "token": "2|…",
  "refresh_token": null,
  "expires_at": "2026-06-23T12:00:00+00:00",
  "user": {
    "id": 7,
    "email": "vendor@example.com",
    "full_name": "Vendor User",
    "role": "vendor"
  }
}
```

### Flow

```
POST /main/auth/register { role: "vendor" }  → store token
→ email verify
GET  /main/me/vendor-profile                 → 404 until approved + provisioned
PATCH /main/me/vendor-profile                → first save bootstraps profile if needed
```

---

## 2. Profile image absolute URLs

**Endpoints:** `GET /me/vendor-profile`, `PATCH /me/vendor-profile`

```json
{
  "data": {
    "profile_image_url": "https://myticket-api.kat-jr.com/storage/users/profile-images/7/avatar.jpg",
    "profile_image": "https://myticket-api.kat-jr.com/storage/users/profile-images/7/avatar.jpg",
    "categories": [],
    "gallery": []
  }
}
```

### Implementation

- Bind avatar directly to `profile_image` or `profile_image_url`.
- Upload flow unchanged: `POST /uploads` (`context: vendor_profile`) → `PATCH /me/vendor-profile` with `profile_image`.
- Gallery `image_url` on upload may still be `/storage/…` relative — profile headshot fields are now absolute.

---

## 3. Notifications

**Base:** `/api/v1/main/me/notifications`

Send `Accept-Language` on list/read.

Relevant kinds:

| `kind` | Typical trigger |
|--------|-----------------|
| `role_application_approved` / `role_application_rejected` | Application decision |
| `government_id_verified` / `government_id_rejected` | ID review |
| `engagement` | Organizer message |
| `tourism_ad_approved` / `tourism_ad_rejected` | If vendor uses tourism ads |

---

## 4. Localization & reference data

```http
Accept-Language: ar
```

| Endpoint | Use |
|----------|-----|
| `GET /reference/vendor-service-categories` | Service category picker |
| `GET /vendor-service-categories` | Same list (auth) + `POST` custom category |
| `GET /reference/saudi-regions` | Regions with nested cities |
| `PUT /me/vendor-profile/categories` | Sync live categories |

---

## QA checklist

- [ ] Register as vendor → token stored; login optional
- [ ] Profile photo displays full URL after GET/PATCH
- [ ] Notifications match UI language
- [ ] Service categories load from reference endpoint
