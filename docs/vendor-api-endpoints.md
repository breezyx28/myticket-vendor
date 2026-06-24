# Vendor API — endpoints, request & response schemas

**Base URL (main):** `https://<host>/api/v1/main`  
**Base URL (admin):** `https://<host>/api/v1/admin`  
**Date:** 2026-05-18

**Auth**

| Scope | Header | Used by |
|-------|--------|---------|
| Public | none | Discovery, categories reference, ratings list |
| Main dashboard | `Authorization: Bearer <token>` + Sanctum ability `app:main` | Vendor SPA |
| Admin | `Authorization: Bearer <token>` + Sanctum ability `app:admin` | Admin dashboard |

**Conventions**

- JSON bodies unless noted (`multipart/form-data` for uploads).
- Success wrappers: `{ "data": ... }` or Laravel pagination.
- Validation errors: **`422`** with `{ "message": "...", "errors": { "<field>": ["..."] } }`.
- `{id}` on role-application routes = **`role_applications.id`**.

---

## 1. Public discovery

### `GET /vendors`

List active vendor profiles.

**Query**

| Param | Type | Notes |
|-------|------|-------|
| `city_id` | integer | Optional |
| `page` | integer | Default 20 |

**Response `200`** — paginated `VendorProfile`

```json
{
  "data": [
    {
      "id": 5,
      "user_id": 30,
      "application_id": 2,
      "slug": "demo-vendor",
      "business_name": "Demo Premium Vendor",
      "bio": "string|null",
      "region_id": 1,
      "city_id": 1,
      "coverage_area": "Riyadh",
      "profile_image_url": "string|null",
      "website_url": "string|null",
      "instagram_handle": "string|null",
      "availability_status": "available|reserved",
      "rating_average": "4.50",
      "rating_count": 8,
      "completed_bookings": 0,
      "is_active": true,
      "created_at": "ISO8601",
      "updated_at": "ISO8601",
      "deleted_at": null
    }
  ]
}
```

---

### `GET /vendors/{slug}`

**Response `200`**

```json
{
  "data": {
    "...": "VendorProfile fields",
    "categories": [
      {
        "id": 1,
        "vendor_profile_id": 5,
        "service_category_id": 2
      }
    ],
    "gallery": [
      {
        "id": 1,
        "vendor_profile_id": 5,
        "image_url": "https://...",
        "caption": null,
        "position": 0,
        "created_at": "string"
      }
    ]
  }
}
```

---

### `GET /vendors/{slug}/ratings`

**Response `200`** — paginated ratings (`target_type: "vendor"`).

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 10,
      "target_type": "vendor",
      "target_id": 5,
      "stars": 5,
      "comment": "string|null",
      "is_visible": true,
      "created_at": "ISO8601"
    }
  ]
}
```

---

### `GET /reference/vendor-service-categories`

Public reference for onboarding category picker.

**Response `200`**

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

---

## 2. File upload (vendor onboarding)

### `POST /uploads`

**Auth:** main  
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `file` | file | yes | Image or PDF, max 12 MB |
| `context` | string | no | `vendor_application` (gallery) or `vendor_document` (docs) |

**Response `201`**

```json
{
  "data": {
    "url": "https://<host>/storage/marketplace/vendor-gallery/<file>.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 204800
  }
}
```

| `context` | Storage folder |
|-----------|----------------|
| `vendor_application` | `marketplace/vendor-gallery` |
| `vendor_document` | `marketplace/vendor-documents` |

---

## 3. Role applications (vendor)

### `GET /role-applications/me`

Includes vendor applications when present (same envelope as talent; `application_type: "vendor"`).

---

### `POST /role-applications/vendor`

Create draft vendor application.

**Request body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `profile_name` | string | yes | max 160 (business display name) |
| `contact_email` | string | yes | email |
| `contact_phone` | string | no | max 20 |

**Response `201`** — `RoleApplication` + nested `vendor_application`.

---

### `GET /role-applications/vendor/{id}`

**Response `200`**

```json
{
  "data": {
    "id": 2,
    "application_type": "vendor",
    "status": "draft",
    "vendor_application": {
      "id": 2,
      "application_id": 2,
      "profile_name": "Vendor Co",
      "contact_email": "vendor@example.com",
      "contact_phone": "string|null",
      "bio": "string|null",
      "region_id": 1,
      "city_id": 1,
      "coverage_area": "string|null",
      "website_url": "string|null",
      "instagram_handle": "string|null",
      "documents": [
        {
          "id": 1,
          "vendor_application_id": 2,
          "kind": "document|url",
          "value": "https://...",
          "label": "CR copy",
          "position": 0,
          "created_at": "ISO8601"
        }
      ],
      "gallery": [
        {
          "id": 1,
          "vendor_application_id": 2,
          "image_url": "https://...",
          "caption": null,
          "position": 0,
          "created_at": "ISO8601"
        }
      ],
      "categories": [
        {
          "id": 12,
          "vendor_application_id": 2,
          "service_category_id": 1,
          "slug": "catering",
          "name_en": "Catering",
          "name_ar": "تموين الطعام"
        }
      ]
    }
  }
}
```

---

### `PATCH /role-applications/vendor/{id}`

**Request body** (vendor-relevant fields, all optional)

| Field | Type | Maps to |
|-------|------|---------|
| `business_name` | string | `vendor_applications.profile_name` |
| `contact_email` | string | `contact_email` |
| `contact_phone` | string | `contact_phone` |
| `bio` | string | `bio` |
| `city` | integer | `city_id` |
| `coverage_area` | string | `coverage_area` |
| `internal_note` | string | `role_applications.internal_note` |

**Response `200`** — updated application payload.

---

### `POST /role-applications/vendor/{id}/documents`

**Request body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `kind` | string | yes | `url`, `document` |
| `value` | string | yes | max 500 |
| `label` | string | no | max 255 |
| `position` | integer | no | min 0 |

**Response `201`**

```json
{
  "data": {
    "id": 1,
    "vendor_application_id": 2,
    "kind": "document",
    "value": "https://...",
    "label": "Commercial registration",
    "position": 0,
    "created_at": "ISO8601"
  }
}
```

---

### `DELETE /role-applications/vendor/{id}/documents/{docId}`

**Response `200`:** `{ "message": "Deleted" }`

---

### `POST /role-applications/vendor/{id}/gallery`

**Request body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `image_url` | string | yes | max 500 |
| `caption` | string | no | max 255 |
| `position` | integer | no | min 0 |

**Response `201`** — gallery row.

---

### `DELETE /role-applications/vendor/{id}/gallery/{itemId}`

**Response `200`:** `{ "message": "Deleted" }`

---

### `POST /role-applications/vendor/{id}/categories`

Allowed only while application is **`draft`** or **`rejected`**.

**Request body** (one required)

| Field | Type | Rules |
|-------|------|-------|
| `service_category_id` | integer | exists in `vendor_service_categories` |
| `slug` | string | resolves active category by slug |

**Response `201`**

```json
{
  "data": {
    "id": 12,
    "vendor_application_id": 2,
    "service_category_id": 1
  }
}
```

**Errors:** `422` if neither field provided, unknown slug, or application not draft/rejected.

---

### `DELETE /role-applications/vendor/{id}/categories/{rowId}`

**Response `200`:** `{ "message": "Deleted" }`

---

### `POST /role-applications/vendor/{id}/submit`

**Request body:** none

**Submit validation (`422`)**

| Field | Rule |
|-------|------|
| `application` | `profile_name` + `contact_email` required |
| `bio` | trimmed length ≥ 25 |
| `documents` | ≥ 1 document row |
| `gallery` | ≥ 1 gallery image |
| `categories` | ≥ 1 service category |

**Response `200`** — `status: "submitted"`.

---

### `POST /role-applications/vendor/{id}/resubmit`

**Response `200`** — after rejection.

---

### `POST /role-applications/vendor/{id}/withdraw`

**Response `200`** — withdrawn.

---

## 4. Live vendor profile (post-approval)

### `GET /me/vendor-profile`

**Auth:** main  
**Response `200`**

```json
{
  "data": {
    "id": 5,
    "user_id": 30,
    "application_id": 2,
    "slug": "demo-vendor",
    "business_name": "Demo Premium Vendor",
    "bio": "string|null",
    "region_id": 1,
    "city_id": 1,
    "coverage_area": "Riyadh",
    "profile_image_url": "string|null",
    "website_url": "string|null",
    "instagram_handle": "string|null",
    "availability_status": "available|reserved",
    "rating_average": "4.50",
    "rating_count": 8,
    "completed_bookings": 0,
    "is_active": true,
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "categories": [],
    "gallery": []
  }
}
```

**Errors:** `404` if no vendor profile for user.

---

### `PATCH /me/vendor-profile`

**Request body** (all optional)

| Field | Type | Rules |
|-------|------|-------|
| `business_name` | string | max 160 |
| `bio` | string | nullable |
| `website_url` | string | valid URL, max 500 |
| `instagram_handle` | string | max 120 |
| `coverage_area` | string | max 255 |

**Response `200`** — `{ "data": VendorProfile }` (without re-loaded relations).

---

## 5. Availability

### `GET /me/vendor-availability`

**Response `200`**

```json
{ "status": "available|reserved" }
```

---

### `PUT /me/vendor-availability`

**Request body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `status` | string | yes | `available` or `reserved` |

**Response `200`**

```json
{ "status": "reserved" }
```

**Side effects:** same engagement hybrid rules as talent (accept → `reserved`; complete/close from accepted → `available`).

---

## 6. Government ID verification

Vendors use the same endpoints as talent (shared marketplace KYC table).

### `GET /me/government-id-verification`

### `POST /me/government-id-verification`

See [`talent-api-endpoints.md`](talent-api-endpoints.md) §6 for request/response schemas.  
`government_id_status` on `talent_applications` is talent-only; vendor status lives on `government_id_verifications.status`.

---

## 7. Engagements (vendor as target)

Same routes as talent; filter inbox by `target_type: "vendor"`.

### `GET /me/engagements`

**Query:** `page`, `per_page` (max 50), `status`

**Response `200`** — paginated engagements where `target_user_id` = current user and `target_type` may be `vendor`.

---

### `GET /me/engagements/{id}/messages`

**Response `200`** — `{ "data": EngagementMessage[] }` ascending.

---

### `POST /me/engagements/{id}/accept`

### `POST /me/engagements/{id}/decline`

Optional body: `{ "reason": "string" }` on decline.

---

### `POST /me/engagements/{id}/complete`

---

### `POST /me/engagements/{id}/messages`

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `body` | string | yes |
| `attachment_url` | string | no |

**Response `201`** — `{ "data": EngagementMessage }`.

**Engagement message schema**

```json
{
  "id": 1,
  "engagement_id": 12,
  "sender_user_id": 30,
  "sender": "vendor",
  "body": "We can provide catering for 200 guests.",
  "attachment_url": null,
  "read_at": null,
  "created_at": "ISO8601"
}
```

---

## 8. Notifications (vendor-relevant)

| `kind` | When |
|--------|------|
| `role_application_approved` | Admin approves vendor application |
| `role_application_rejected` | Admin rejects application |
| `government_id_verified` | Admin verifies government ID |
| `government_id_rejected` | Admin rejects government ID |

Deep links use `FRONTEND_VENDOR_URL` (e.g. `/`, `/application/status`, `/engagements?focus={id}`, `/government-id`).

---

## 9. Ratings (vendor as target)

### `POST /ratings`

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `target_type` | string | yes | `vendor` |
| `target_id` | integer | yes | `vendor_profiles.id` |
| `engagement_id` | integer | no | |
| `stars` | integer | yes | 1–5 |
| `review` | string | no | stored as `comment` |

**Response `201`** — `{ "data": Rating }`.

---

## 10. Admin API (vendor)

**Base:** `/api/v1/admin` · **Auth:** `app:admin`

### `GET /role-applications?type=vendor`

Vendor application queue. **Query:** `status`, `type=vendor`.

---

### `GET /role-applications/{id}`

Full vendor application with documents, gallery, categories.

---

### `POST /role-applications/{id}/approve`

Provisions `vendor_profiles`; notifies vendor.

---

### `POST /role-applications/{id}/reject`

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `rejection_reason` | string | yes |

---

### `GET /profiles/vendors`

Paginated `VendorProfile` list (simple pagination, 20 per page).

**Response `200`**

```json
{
  "data": [
    {
      "id": 5,
      "user_id": 30,
      "slug": "demo-vendor",
      "business_name": "Demo Premium Vendor",
      "is_active": true,
      "...": "VendorProfile fields"
    }
  ]
}
```

---

### `POST /profiles/vendors/{id}/suspend`

### `POST /profiles/vendors/{id}/unsuspend`

**`{id}` = `vendor_profiles.id`**  
**Response `200`** — `{ "data": VendorProfile }`.

---

### `POST /profiles/vendors/{id}/verify-government-id`

### `POST /profiles/vendors/{id}/reject-government-id`

Same contract as talent; `{type}` = `vendors`.

**Reject body**

```json
{ "reason": "Document expired" }
```

**Verify response**

```json
{
  "data": {
    "id": 1,
    "user_id": 30,
    "status": "verified",
    "...": "GovernmentIdVerification"
  }
}
```

---

## Shared with talent (cross-reference)

| Endpoint | Doc section |
|----------|-------------|
| `POST /uploads` | §2 |
| `GET/POST /me/government-id-verification` | §6 + [talent doc §6](talent-api-endpoints.md#6-government-id-verification) |
| Engagements | §7 + [talent doc §7](talent-api-endpoints.md#7-engagements-talent-as-target) |
| `GET /me/notifications` | §8 |

---

## Related docs

- [`frontend-handoff-vendor-backend-updates.md`](frontend-handoff-vendor-backend-updates.md)
- [`frontend-handoff-talent-backend-updates.md`](frontend-handoff-talent-backend-updates.md) (uploads, engagements)
- [`marketplace-gaps-and-solutions.md`](marketplace-gaps-and-solutions.md)
- [`API_REFERENCE.md`](API_REFERENCE.md)
