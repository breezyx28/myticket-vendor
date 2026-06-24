# Vendor dashboard — categories & profile image updates

**Date:** 2026-06-12  
**Audience:** Vendor dashboard SPA (`FRONTEND_VENDOR_URL`)  
**Full API reference:** [`vendor-api-endpoints.md`](vendor-api-endpoints.md)

---

## Summary

| Topic | Change |
|-------|--------|
| Profile image upload | `POST /uploads` accepts `context=vendor_profile` |
| Live profile photo | `PATCH /me/vendor-profile` accepts `profile_image` |
| Category badges | List from reference; create custom when missing |
| Multi-category select | `PUT` bulk sync on application + live profile |

---

## 1. Profile image upload (fix)

### Problem

`POST /uploads` with `context=vendor_profile` returned **`422`** (`The selected context is invalid.`).

### Solution

`vendor_profile` is now a valid upload context.

```
POST /api/v1/main/uploads
Content-Type: multipart/form-data
```

| Field | Value |
|-------|--------|
| `file` | image (max 12 MB) |
| `context` | `vendor_profile` |

**`201`**

```json
{
  "data": {
    "url": "https://<host>/storage/marketplace/vendor-profiles/abc.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 102400
  }
}
```

### Save to profile

```
PATCH /api/v1/main/me/vendor-profile
```

```json
{
  "profile_image": "https://<host>/storage/marketplace/vendor-profiles/abc.jpg"
}
```

**`200`** — response includes both `profile_image_url` and `profile_image` alias.

### Allowed upload contexts (vendor-related)

| `context` | Use for |
|-----------|---------|
| `vendor_profile` | Live profile photo |
| `vendor_application` | Application gallery images |
| `vendor_document` | CR / license PDFs and docs |

---

## 2. Business category badges

Vendors pick **service categories** as badges during onboarding and on the live profile. Preset badges come from the reference list; vendors can **create a custom badge** if none fits.

### List badges

**Public (no auth):**

```
GET /api/v1/main/reference/vendor-service-categories
```

**Authenticated (same payload):**

```
GET /api/v1/main/vendor-service-categories
```

**`200`**

```json
{
  "data": [
    {
      "id": 1,
      "slug": "catering",
      "name_en": "Catering",
      "name_ar": "تموين الطعام",
      "is_active": true,
      "display_order": 1,
      "is_custom": false,
      "created_by_user_id": null
    }
  ]
}
```

| Field | Meaning |
|-------|---------|
| `is_custom` | `true` when created by a vendor user |
| `created_by_user_id` | User who created a custom badge; `null` for seeded/system badges |

### Create custom badge

When the vendor types a category that is not in the list:

```
POST /api/v1/main/vendor-service-categories
```

```json
{
  "name_en": "Balloon Art",
  "name_ar": "فن البالونات"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name_en` | yes* | English label |
| `name` | yes* | Alias for `name_en` |
| `name_ar` | no | Defaults to `name_en` |

\* One of `name_en` or `name` is required.

**`201`** — returns the new (or existing) category with `is_custom: true`.

If another vendor already created the same `name_en`, the API returns the **existing** row (no duplicate).

---

## 3. Multi-category sync (bulk replace)

Use **`PUT`** to set all selected badges in one request instead of many `POST`/`DELETE` calls.

### During application (draft or rejected only)

```
PUT /api/v1/main/role-applications/vendor/{role_application_id}/categories
```

`{role_application_id}` = `role_applications.id` from `POST /role-applications/vendor`.

### On live profile (after approval)

```
PUT /api/v1/main/me/vendor-profile/categories
```

### Request body

```json
{
  "categories": [
    { "service_category_id": 1 },
    { "slug": "catering" },
    { "name_en": "Balloon Art", "name_ar": "فن البالونات" }
  ]
}
```

Each array item must include **one** of:

| Key | Description |
|-----|-------------|
| `service_category_id` | ID from badge list |
| `slug` | e.g. `catering` |
| `name_en` or `name` | Creates or reuses a custom badge |

Minimum **1** category in the array.

### Response `200`

```json
{
  "data": {
    "categories": [
      {
        "id": 12,
        "vendor_application_id": 3,
        "service_category_id": 1,
        "slug": "catering",
        "name_en": "Catering",
        "name_ar": "تموين الطعام",
        "is_active": true,
        "display_order": 1,
        "is_custom": false,
        "created_by_user_id": null
      }
    ]
  }
}
```

On live profile sync, rows use `vendor_profile_id` instead of `vendor_application_id`.

### Legacy single attach/detach (still supported)

```
POST   /role-applications/vendor/{id}/categories   { "slug": "catering" }
DELETE /role-applications/vendor/{id}/categories/{rowId}
```

---

## 4. Recommended frontend flows

### Onboarding wizard — categories step

1. `GET /reference/vendor-service-categories` → render badge chips.
2. User selects multiple badges.
3. Optional: user types a new name → `POST /vendor-service-categories` **or** include `{ "name_en": "..." }` in the bulk `PUT`.
4. `PUT /role-applications/vendor/{id}/categories` with full selection before submit.

### Profile settings — photo

1. `POST /uploads` with `context=vendor_profile`.
2. `PATCH /me/vendor-profile` with `{ "profile_image": data.url }`.

### Profile settings — categories (approved vendor)

1. Load current badges from `GET /me/vendor-profile` → `data.categories`.
2. On save → `PUT /me/vendor-profile/categories` with updated `categories` array.

---

## 5. Validation reminders

Submit (`POST /role-applications/vendor/{id}/submit`) still requires **≥ 1 category** (among bio, documents, gallery rules). Use bulk `PUT` before submit to satisfy this.

Application category `PUT` is only allowed while status is **`draft`** or **`rejected`**. Live profile `PUT /me/vendor-profile/categories` works anytime the vendor has a profile.

---

## 6. Database / deploy

New migration (production):

```bash
php artisan migrate
```

Adds `vendor_service_categories.created_by_user_id` (nullable) for custom badges.

---

## 7. Tests

[`tests/Feature/Marketplace/VendorDashboardGapsTest.php`](../tests/Feature/Marketplace/VendorDashboardGapsTest.php) — covers:

- `vendor_profile` upload context
- `profile_image` on `PATCH /me/vendor-profile`
- Custom category creation
- Bulk category sync (application + live profile)

---

## Related docs

- [`vendor-api-endpoints.md`](vendor-api-endpoints.md) — full vendor endpoint reference
- [`frontend-handoff-vendor-backend-updates.md`](frontend-handoff-vendor-backend-updates.md) — earlier P0/P1 vendor work
- [`marketplace-gaps-and-solutions.md`](marketplace-gaps-and-solutions.md) — cross-platform gap log
