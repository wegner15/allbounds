# allbounds — Backend Design Specification

> **Version:** v1.0  
> **Date:** 2025-09-10  
> **Owner:** Platform Team  
> **Scope:** Public content + Admin CMS APIs for a tour company website (no payment/checkout in v1; pluggable later)

---

## 1. Objectives & Non-Goals

**Objectives**
- Expose fast, SEO-friendly read APIs for destinations (Regions → Countries), Packages, Group Trips, Accommodations, Attractions, Activities, Blog, Holiday Types.
- Provide CMS-grade write APIs (admin) with drafts, scheduling, image galleries, and review moderation.
- Deliver instant search (Meilisearch) across key entities.
- Store assets (images, documents) on Cloudflare R2 with signed URLs.

**Non-Goals (v1)**
- Payments/checkout and real-time availability integrations.
- CRM/Marketing automation.
- Multi-tenant white-labeling.

---

## 2. Tech Stack & Key Decisions

- **API**: FastAPI (Python 3.12), Pydantic v2, Uvicorn/Gunicorn.
- **DB**: PostgreSQL 15+ with SQLAlchemy 2 + Alembic.
- **Search**: Meilisearch, incremental indexing via event hooks.
- **Storage**: Cloudflare R2 (S3-compatible) with presigned URL model.
- **Auth**: JWT (access/refresh), OAuth2 password flow, role-based.
- **Containerization**: Docker + docker-compose.
- **Background jobs**: FastAPI `BackgroundTasks` for v1.
- **Observability**: JSON logs, OpenTelemetry traces, Prometheus metrics.
- **I18N**: Default locale English, extensible to multi-locale.

---

## 3. Domain Model (ERD Overview)

**Hierarchy**
- **Region** (e.g., Africa, Europe)  
  ⤷ **Country**

**Core**
- **Activity** (M:N with Country)  
- **Attraction** (belongs to Country)  
- **Accommodation** (belongs to Country)  
- **Package** (belongs to Country; itinerary, inclusions, exclusions, gallery, reviews)  
- **GroupTrip** (belongs to Country; departures, pricing tiers, gallery, reviews)

**Taxonomy & Content**
- **HolidayType** (M:N with Package and GroupTrip)  
- **BlogPost** (tags, hero image, author)  
- **Tag** (M:N with BlogPost)

**Media & Reviews**
- **MediaAsset** (R2 object metadata)  
- **Review** (polymorphic: Package | GroupTrip | Accommodation)  

**SEO**
- **SeoMeta** (slugs, meta tags, open graph)  

**System**
- **User** (admin/editor)  
- **Role**, **Permission** (RBAC)  
- **AuditLog** (who did what, when)  

---

## 4. Key Tables

- `regions`  
- `countries`  
- `activities`, `country_activities` (M:N)  
- `attractions`  
- `accommodations`  
- `packages`  
- `group_trips`, `group_trip_departures`  
- `holiday_types`, `package_holiday_types`, `group_trip_holiday_types`  
- `blog_posts`, `tags`, `blog_post_tags`  
- `media_assets`, `galleries`, `gallery_items`  
- `reviews`  
- `seo_meta`  
- `users`, `roles`, `permissions`, `user_roles`, `role_permissions`  
- `audit_logs`

---

## 5. Storage & Media (R2)

- **Bucket structure**  
  ```
  allbounds/
    media/original/{yyyy}/{mm}/{uuid}.{ext}
    media/derived/{size}/{uuid}.{ext}
  ```

- **Upload flow**  
  1. Request presigned PUT  
  2. Client uploads  
  3. Confirm with metadata  
  4. Derived sizes (optional background)

- **Delivery**: private bucket + presigned GET (admin), public CDN for published assets.

---

## 6. Search (Meilisearch)

**Indices**
- countries, packages, group_trips, accommodations, attractions, blog_posts

**Searchable fields**: `name`, `summary`, `tags`, `activities`  
**Filterable fields**: `region`, `country`, `holiday_types`, `price`, `duration_days`, `stars`  
**Sync strategy**: SQLAlchemy hooks + nightly full sync.

---

## 7. API Design

**Conventions**
- Base path: `/api/v1`
- JSON, camelCase payloads
- Cursor pagination
- ETags for caching

**Public Read APIs**
- `/regions`, `/countries`, `/activities`, `/attractions`  
- `/accommodations` (+reviews)  
- `/packages` (+reviews)  
- `/group-trips` (+departures, reviews)  
- `/holiday-types`  
- `/blog`  
- `/search`

**Admin APIs**
- CRUD for all entities  
- Galleries & Assets management  
- Reviews moderation  
- SEO meta  
- Publish scheduling  
- Reindex endpoints  
- User & Role management  
- Audit log

---

## 8. Authentication & Authorization

- JWT (15m access, 14d refresh)  
- Roles: admin, editor, author, viewer  
- Permissions: `content:write`, `content:publish`, `reviews:moderate`, etc.  

---

## 9. SEO & Caching

- Slug uniqueness enforced.  
- SEO meta per entity.  
- Sitemap generators.  
- ETags + CDN purge webhooks.

---

## 10. Background Tasks

- Reindex on publish/update.  
- CDN purge.  
- Recalculate aggregates on review approval.

---

## 11. Error Model

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "fields": { "name": "too short" }
  }
}
```

---

## 12. Observability & Security

- JSON logs with correlation IDs.  
- Metrics: request latency, db time, index lag.  
- Security: strict CORS, least-privilege DB, presigned R2 URLs, audit logs.

---

## 13. Testing Strategy

- Unit: schemas, services  
- Integration: Postgres + Meili containers  
- Contract: OpenAPI schema snapshots  
- E2E smoke: seed → publish → search → fetch

---

## 14. Deployment

- **docker-compose.dev.yml** with Postgres, Meilisearch, API  
- Health endpoints: `/healthz` (db + Meili status)  
- Alembic migrations on startup (env gated)

---

## 15. Implementation Checklist

- [ ] Alembic migrations for all tables  
- [ ] Slug generator  
- [ ] R2 asset flows  
- [ ] Galleries + reviews  
- [ ] SEO meta + sitemaps  
- [ ] Search sync  
- [ ] Public APIs  
- [ ] Admin APIs + RBAC  
- [ ] Structured logs + metrics  
- [ ] Health checks  
- [ ] Tests + CI pipeline

---

## 16. Future Extensions

- Availability & pricing sync with partners  
- Booking & payments (Stripe/Flutterwave)  
- Advanced faceted search + personalization  
- Multi-currency + localization

---
