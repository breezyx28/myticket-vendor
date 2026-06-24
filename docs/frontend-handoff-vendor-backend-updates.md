# Vendor dashboard — backend updates (P0/P1 resolution)

**Date:** 2026-05-18  
**Audience:** Vendor dashboard SPA (`FRONTEND_VENDOR_URL`)  
**Supersedes gaps in:** [`vendor-backend-gaps.md`](../vendor-backend-gaps.md) (P0/P1 items)  
**Base guide:** [`frontend-handoff-vendor-api.md`](frontend-handoff-vendor-api.md)  
**Shared (upload, engagements):** [`frontend-handoff-talent-backend-updates.md`](frontend-handoff-talent-backend-updates.md)

---

## Summary

| Topic | Status |
|-------|--------|
| Vendor availability | `GET/PUT /me/vendor-availability` |
| Service categories reference | `GET /reference/vendor-service-categories` |
| Application categories | `POST/DELETE /role-applications/vendor/{id}/categories` |
| Submit validation | Bio ≥ 25, ≥ 1 document, gallery, category |
| Profile relations | `GET /me/vendor-profile` includes `categories` + `gallery` |
| Hybrid availability | Accept → `reserved`; complete/cancel from accepted → `available` |
| Notifications | Approve/reject use `FrontendUrl::vendor(...)` |

---

## Environment

```env
FRONTEND_VENDOR_URL=https://myticket-vendor.kat-jr.com
```

Notification deep links:

| Event | `href` |
|-------|--------|
| Application approved | `{FRONTEND_VENDOR_URL}/` |
| Application rejected | `{FRONTEND_VENDOR_URL}/application/status` |
| New engagement message (recipient is vendor) | `{FRONTEND_VENDOR_URL}/engagements?focus={engagementId}` |

---

## Vendor availability

Mirror talent endpoints:

```
GET  /api/v1/main/me/vendor-availability
PUT  /api/v1/main/me/vendor-availability
```

**GET/PUT `200`**

```json
{ "status": "available" }
```

**PUT body:** `{ "status": "available" | "reserved" }`

Hybrid side effects on engagements — see talent backend updates doc.

---

## Service categories

### Reference — `GET /reference/vendor-service-categories`

Public. Active categories ordered by `display_order`.

```json
{
  "data": [
    {
      "id": 1,
      "slug": "catering",
      "name_en": "Catering",
      "name_ar": "تموين الطعام",
      "is_active": true,
      "display_order": 1
    }
  ]
}
```

Replace hardcoded `vendorServiceCategories.ts` with this endpoint.

### Application attach

```
POST   /api/v1/main/role-applications/vendor/{id}/categories
DELETE /api/v1/main/role-applications/vendor/{id}/categories/{rowId}
```

**POST body** (one required):

| Field | Type |
|-------|------|
| `service_category_id` | integer |
| `slug` | string (resolves to active category) |

**`201`**

```json
{
  "data": {
    "id": 12,
    "vendor_application_id": 3,
    "service_category_id": 2
  }
}
```

Draft or rejected applications only. Unique `(vendor_application_id, service_category_id)`.

`GET /role-applications/vendor/{id}` returns enriched categories:

```json
{
  "id": 12,
  "service_category_id": 1,
  "slug": "catering",
  "name_en": "Catering",
  "name_ar": "تموين الطعام"
}
```

```ts
async function attachCategory(appId: number, slug: string) {
  await api.post(`/role-applications/vendor/${appId}/categories`, { slug });
}
```

---

## Submit validation

On `POST /role-applications/vendor/{id}/submit`:

| Field | Rule |
|-------|------|
| `profile_name`, `contact_email` | Required (existing) |
| `bio` | Trimmed length ≥ 25 |
| `documents` | ≥ 1 row |
| `gallery` | ≥ 1 row |
| `categories` | ≥ 1 row |

Returns **`422`** with structured `errors` map.

---

## `GET /me/vendor-profile`

Now eager-loads `categories` and `gallery` (same relations as public `GET /vendors/{slug}`).

```json
{
  "data": {
    "id": 5,
    "business_name": "Vendor Co",
    "categories": [{ "vendor_profile_id": 5, "service_category_id": 1 }],
    "gallery": [{ "image_url": "https://...", "position": 0 }]
  }
}
```

---

## Shared endpoints (cross-link)

| Endpoint | Doc |
|----------|-----|
| `POST /uploads` | [Talent backend updates — upload](frontend-handoff-talent-backend-updates.md#post-apiv1mainuploads) |
| `GET /me/engagements/{id}/messages` | [Talent backend updates — engagements](frontend-handoff-talent-backend-updates.md#engagements) |

---

## Frontend unblock checklist

- [ ] Remove hardcoded category list; fetch reference on wizard load
- [ ] Persist category selections via POST/DELETE categories
- [ ] Enable availability toggle with `PUT /me/vendor-availability`
- [ ] Show gallery + categories on profile/preview from `GET /me/vendor-profile`
- [ ] Handle submit `422` field map in wizard
- [ ] Use shared upload for documents/gallery images

---

## Tests

[`tests/Feature/Marketplace/VendorDashboardGapsTest.php`](../tests/Feature/Marketplace/VendorDashboardGapsTest.php)
