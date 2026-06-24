# Vendor dashboard — live profile gallery updates

**Date:** 2026-06-12  
**Audience:** Vendor dashboard SPA (`FRONTEND_VENDOR_URL`)  
**Full API reference:** [`vendor-api-endpoints.md`](vendor-api-endpoints.md)  
**Related:** [`frontend-handoff-vendor-categories-and-profile-updates.md`](frontend-handoff-vendor-categories-and-profile-updates.md)

---

## Summary

| Topic | Change |
|-------|--------|
| Live gallery route missing | Added `GET/POST/PUT/DELETE /me/vendor-profile/gallery` |
| Direct image upload | `POST /me/vendor-profile/gallery` accepts multipart `file` |
| Two-step upload | `POST /uploads` → `POST /me/vendor-profile/gallery` with `image_url` |
| Upload context | Added `vendor_profile_gallery` on `POST /uploads` |

---

## Problem

Calling:

```
POST /api/v1/main/me/vendor-profile/gallery
```

returned **`404`** — route did not exist. Gallery was only available during onboarding via:

```
POST /api/v1/main/role-applications/vendor/{id}/gallery
```

Approved vendors editing their live profile had no gallery API.

---

## New endpoints

All require **Bearer auth** (`app:main`) and an existing **vendor profile**.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/main/me/vendor-profile/gallery` | List gallery items |
| `POST` | `/api/v1/main/me/vendor-profile/gallery` | Add one image |
| `PUT` | `/api/v1/main/me/vendor-profile/gallery` | Replace entire gallery |
| `DELETE` | `/api/v1/main/me/vendor-profile/gallery/{id}` | Remove one item |

`GET /api/v1/main/me/vendor-profile` still includes `gallery` on the profile payload.

---

## 1. Add gallery image — direct upload (recommended)

Send the image file directly to the gallery endpoint.

```
POST /api/v1/main/me/vendor-profile/gallery
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

| Field | Required | Rules |
|-------|----------|-------|
| `file` | yes | Image, max 12 MB |
| `caption` | no | max 255 chars |

**`201`**

```json
{
  "data": {
    "id": 4,
    "vendor_profile_id": 5,
    "image_url": "https://<host>/storage/marketplace/vendor-gallery/abc.jpg",
    "caption": "Main booth",
    "position": 0,
    "created_at": "2026-06-12T10:00:00.000000Z"
  }
}
```

**Errors**

| Code | When |
|------|------|
| `404` | No vendor profile for user |
| `422` | Missing file, or file is not an image |

---

## 2. Add gallery image — two-step (upload + attach)

Use when the client already uploads through the shared upload service.

### Step 1 — upload file

```
POST /api/v1/main/uploads
Content-Type: multipart/form-data
```

| Field | Value |
|-------|--------|
| `file` | image |
| `context` | `vendor_profile_gallery` (or `vendor_application`) |

**`201`**

```json
{
  "data": {
    "url": "https://<host>/storage/marketplace/vendor-gallery/abc.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 204800
  }
}
```

### Step 2 — attach to gallery

```
POST /api/v1/main/me/vendor-profile/gallery
Content-Type: application/json
```

```json
{
  "image_url": "https://<host>/storage/marketplace/vendor-gallery/abc.jpg",
  "caption": "Main booth",
  "position": 0
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `image_url` | yes | URL from step 1 |
| `caption` | no | |
| `position` | no | defaults to next available index |

---

## 3. List gallery

```
GET /api/v1/main/me/vendor-profile/gallery
```

**`200`**

```json
{
  "data": [
    {
      "id": 4,
      "vendor_profile_id": 5,
      "image_url": "https://...",
      "caption": "Main booth",
      "position": 0,
      "created_at": "2026-06-12T10:00:00.000000Z"
    }
  ]
}
```

Items are ordered by `position`, then `id`.

---

## 4. Replace full gallery (bulk sync)

Use when saving the whole gallery editor state in one request.

```
PUT /api/v1/main/me/vendor-profile/gallery
Content-Type: application/json
```

```json
{
  "gallery": [
    {
      "image_url": "https://<host>/storage/marketplace/vendor-gallery/a.jpg",
      "caption": "Front view",
      "position": 0
    },
    {
      "image_url": "https://<host>/storage/marketplace/vendor-gallery/b.jpg",
      "caption": null,
      "position": 1
    }
  ]
}
```

| Field | Required |
|-------|----------|
| `gallery` | yes, min 1 item |
| `gallery[].image_url` | yes |
| `gallery[].caption` | no |
| `gallery[].position` | no |

**`200`**

```json
{
  "data": {
    "gallery": [ "...same item shape as GET..." ]
  }
}
```

This **replaces** all existing gallery rows for the profile.

---

## 5. Delete one item

```
DELETE /api/v1/main/me/vendor-profile/gallery/{id}
```

`{id}` = gallery row id from `GET` or `POST` response.

**`200`**

```json
{ "message": "Deleted" }
```

---

## Upload contexts (vendor gallery)

| `context` on `POST /uploads` | Storage folder |
|------------------------------|----------------|
| `vendor_profile_gallery` | `marketplace/vendor-gallery` |
| `vendor_application` | `marketplace/vendor-gallery` (same folder) |
| `vendor_profile` | `marketplace/vendor-profiles` (profile photo only) |

Do **not** use `vendor_profile` for gallery images — that context is for the profile avatar.

---

## Onboarding vs live profile

| Phase | Endpoint |
|-------|----------|
| Application wizard (draft/rejected) | `POST /role-applications/vendor/{id}/gallery` |
| Live profile (after approval) | `POST /me/vendor-profile/gallery` |

On admin approval, gallery rows are copied from the application to `vendor_profile_gallery` automatically. After that, use the `/me/vendor-profile/gallery` routes for edits.

---

## Recommended frontend flow

### Gallery settings page

1. `GET /me/vendor-profile/gallery` (or read `gallery` from `GET /me/vendor-profile`).
2. On add:
   - **Simple:** `POST /me/vendor-profile/gallery` with `FormData` (`file`, optional `caption`).
   - **Or:** `POST /uploads` → `POST /me/vendor-profile/gallery` with `{ image_url }`.
3. On remove: `DELETE /me/vendor-profile/gallery/{id}`.
4. On save-all/reorder: `PUT /me/vendor-profile/gallery` with full `gallery` array.

### TypeScript example (direct upload)

```ts
async function addVendorGalleryImage(file: File, caption?: string) {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);

  const res = await api.post('/me/vendor-profile/gallery', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data;
}
```

---

## Tests

[`tests/Feature/Marketplace/VendorDashboardGapsTest.php`](../tests/Feature/Marketplace/VendorDashboardGapsTest.php) — `adds vendor profile gallery items via dedicated gallery endpoint`.

---

## Deploy

No new migration. Deploy latest API code so routes are registered on production.

---

## Related docs

- [`vendor-api-endpoints.md`](vendor-api-endpoints.md) — full vendor endpoint reference
- [`frontend-handoff-vendor-backend-updates.md`](frontend-handoff-vendor-backend-updates.md) — earlier P0/P1 vendor work
- [`frontend-handoff-vendor-categories-and-profile-updates.md`](frontend-handoff-vendor-categories-and-profile-updates.md) — categories + profile photo
