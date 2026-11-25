"""
IndexNow instant indexing service for Allbounds.

Submits newly published or updated public URLs to the IndexNow API
(https://api.indexnow.org/indexnow), which notifies Bing, ChatGPT Search,
Copilot, Perplexity, Yandex, Seznam, and Naver in real time.

Production setup:
1. Generate a 32-character hex key (e.g. `openssl rand -hex 16`).
2. Set `INDEXNOW_KEY=<key>`, `INDEXNOW_ENABLED=true`, and
   `PUBLIC_SITE_URL=https://allboundvacations.com` in the backend environment.
3. Host the key verification file at `https://allboundvacations.com/<key>.txt`
   containing only `<key>` (UTF-8 plain text):
   - Recommended for Cloudflare Pages: place `<key>.txt` in `frontend/public/<key>.txt`.
   - Alternatively, route `/<key>.txt` on the public domain to this FastAPI backend's
     `GET /{indexnow_key}.txt` verification endpoint.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urlparse

import httpx
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from app.core.config import settings

logger = logging.getLogger("app.services.indexnow")

INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
INDEXNOW_TIMEOUT_SECONDS = 5.0
MAX_URLS_PER_BATCH = 10_000

# Mapping from logical entity type to public URL path prefix (single-slug entities).
_SIMPLE_ENTITY_PREFIXES: Dict[str, str] = {
    "group_trip": "/group-trips",
    "country": "/destinations",
    "hotel": "/hotels",
    "attraction": "/attractions",
    "activity": "/activities",
    "blog": "/blog",
    "blog_post": "/blog",
    "region": "/regions",
    "holiday_type": "/holiday-types",
}


def get_configured_key() -> Optional[str]:
    """Return the stripped IndexNow API key if configured, else None."""
    key = (settings.INDEXNOW_KEY or "").strip()
    return key or None


def verify_indexnow_key(requested_key: str) -> Optional[str]:
    """
    Validate a requested `/{key}.txt` verification path against `settings.INDEXNOW_KEY`.

    Returns the configured key string if it matches, otherwise None.
    """
    configured = get_configured_key()
    if not configured or requested_key != configured:
        return None
    return configured


def is_indexnow_enabled() -> bool:
    """
    Return True only when IndexNow is explicitly enabled AND a non-empty key is set.

    This guarantees local development and test runs never spam the IndexNow API.
    """
    return bool(settings.INDEXNOW_ENABLED and get_configured_key())


def get_public_site_url(base_url: Optional[str] = None) -> str:
    """Return the normalized public site origin without a trailing slash."""
    raw = (base_url or settings.PUBLIC_SITE_URL or "https://allboundvacations.com").strip()
    return raw.rstrip("/")


def get_indexnow_host(base_url: Optional[str] = None) -> str:
    """Extract the hostname (netloc) for the IndexNow payload `host` field."""
    site_url = get_public_site_url(base_url)
    parsed = urlparse(site_url)
    return parsed.netloc or site_url.replace("https://", "").replace("http://", "").split("/")[0]


def get_key_location(key: Optional[str] = None, base_url: Optional[str] = None) -> str:
    """Build the canonical IndexNow key verification file URL."""
    resolved_key = (key or get_configured_key() or "").strip()
    return f"{get_public_site_url(base_url)}/{resolved_key}.txt"


def build_public_url(path: str, base_url: Optional[str] = None) -> str:
    """
    Build a canonical trailing-slash public URL for Allbounds.

    Examples:
        build_public_url("/destinations/uganda") -> "https://allboundvacations.com/destinations/uganda/"
        build_public_url("blog/gorilla-trekking/") -> "https://allboundvacations.com/blog/gorilla-trekking/"
        build_public_url("/") -> "https://allboundvacations.com/"
    """
    site_url = get_public_site_url(base_url)
    cleaned = (path or "").strip()
    if not cleaned or cleaned == "/":
        return f"{site_url}/"
    cleaned = cleaned.strip("/")
    return f"{site_url}/{cleaned}/"


def build_entity_url(
    entity_type: str,
    slug: str,
    *,
    country_slug: Optional[str] = None,
    base_url: Optional[str] = None,
) -> str:
    """
    Build the canonical trailing-slash public URL for an Allbounds entity.

    Supported entity types:
      - package:      /packages/{country_slug}/{slug}/ (falls back to /packages/{slug}/)
      - group_trip:   /group-trips/{slug}/
      - country:      /destinations/{slug}/
      - hotel:        /hotels/{slug}/
      - attraction:   /attractions/{slug}/
      - activity:     /activities/{slug}/
      - blog / blog_post: /blog/{slug}/
      - region:       /regions/{slug}/
      - holiday_type: /holiday-types/{slug}/
    """
    normalized_type = (entity_type or "").strip().lower()
    cleaned_slug = (slug or "").strip().strip("/")
    if not cleaned_slug:
        raise ValueError(f"Cannot build IndexNow URL for '{entity_type}' without a slug")

    if normalized_type == "package":
        cleaned_country = (country_slug or "").strip().strip("/")
        if cleaned_country:
            return build_public_url(f"/packages/{cleaned_country}/{cleaned_slug}/", base_url=base_url)
        return build_public_url(f"/packages/{cleaned_slug}/", base_url=base_url)

    prefix = _SIMPLE_ENTITY_PREFIXES.get(normalized_type)
    if not prefix:
        raise ValueError(f"Unsupported IndexNow entity type: {entity_type!r}")

    return build_public_url(f"{prefix}/{cleaned_slug}/", base_url=base_url)


def _deduplicate_urls(urls: Iterable[str]) -> List[str]:
    """Deduplicate and strip empty URLs while preserving order."""
    seen = set()
    result: List[str] = []
    for url in urls:
        cleaned = (url or "").strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            result.append(cleaned)
    return result


def build_indexnow_payload(
    urls: Iterable[str],
    *,
    key: Optional[str] = None,
    base_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Construct the JSON payload expected by https://api.indexnow.org/indexnow."""
    resolved_key = (key or get_configured_key() or "").strip()
    clean_urls = _deduplicate_urls(urls)
    return {
        "host": get_indexnow_host(base_url),
        "key": resolved_key,
        "keyLocation": get_key_location(key=resolved_key, base_url=base_url),
        "urlList": clean_urls,
    }


def submit_urls_to_indexnow(urls: List[str]) -> bool:
    """
    Submit one or more canonical URLs to IndexNow synchronously.

    Intended to be invoked from FastAPI `BackgroundTasks` (which runs sync functions
    in a worker thread after the HTTP response is returned) or from scripts/workers.

    Never raises: logs warnings/errors and returns False on failure or when disabled.
    """
    if not is_indexnow_enabled():
        logger.debug("IndexNow disabled or INDEXNOW_KEY not configured; skipping submission")
        return False

    clean_urls = _deduplicate_urls(urls)
    if not clean_urls:
        logger.debug("IndexNow submission skipped: empty URL list")
        return False

    all_succeeded = True
    for start in range(0, len(clean_urls), MAX_URLS_PER_BATCH):
        batch = clean_urls[start : start + MAX_URLS_PER_BATCH]
        payload = build_indexnow_payload(batch)
        try:
            response = httpx.post(
                INDEXNOW_ENDPOINT,
                json=payload,
                headers={"Content-Type": "application/json; charset=utf-8"},
                timeout=INDEXNOW_TIMEOUT_SECONDS,
            )
            if response.status_code in (200, 202):
                logger.info(
                    "IndexNow submitted %d URL(s) (status=%d): %s",
                    len(batch),
                    response.status_code,
                    batch[0] if len(batch) == 1 else f"{batch[0]} (+{len(batch) - 1} more)",
                )
            else:
                all_succeeded = False
                logger.warning(
                    "IndexNow submission returned status %d: %s",
                    response.status_code,
                    response.text[:300],
                )
        except Exception as exc:
            all_succeeded = False
            logger.warning("IndexNow submission failed (non-fatal): %s", exc)

    return all_succeeded


async def submit_urls_to_indexnow_async(urls: List[str]) -> bool:
    """
    Async variant of `submit_urls_to_indexnow` for async endpoints or tasks.

    Never raises: logs warnings/errors and returns False on failure or when disabled.
    """
    if not is_indexnow_enabled():
        logger.debug("IndexNow disabled or INDEXNOW_KEY not configured; skipping submission")
        return False

    clean_urls = _deduplicate_urls(urls)
    if not clean_urls:
        logger.debug("IndexNow submission skipped: empty URL list")
        return False

    all_succeeded = True
    try:
        async with httpx.AsyncClient(timeout=INDEXNOW_TIMEOUT_SECONDS) as client:
            for start in range(0, len(clean_urls), MAX_URLS_PER_BATCH):
                batch = clean_urls[start : start + MAX_URLS_PER_BATCH]
                payload = build_indexnow_payload(batch)
                response = await client.post(
                    INDEXNOW_ENDPOINT,
                    json=payload,
                    headers={"Content-Type": "application/json; charset=utf-8"},
                )
                if response.status_code in (200, 202):
                    logger.info(
                        "IndexNow submitted %d URL(s) (status=%d)",
                        len(batch),
                        response.status_code,
                    )
                else:
                    all_succeeded = False
                    logger.warning(
                        "IndexNow submission returned status %d: %s",
                        response.status_code,
                        response.text[:300],
                    )
    except Exception as exc:
        all_succeeded = False
        logger.warning("IndexNow async submission failed (non-fatal): %s", exc)

    return all_succeeded


def schedule_indexnow_submission(
    background_tasks: Optional[BackgroundTasks],
    urls: List[str],
) -> bool:
    """
    Queue a non-blocking IndexNow submission on FastAPI `BackgroundTasks`.

    Returns True if a background task was scheduled, False if skipped.
    """
    if background_tasks is None or not is_indexnow_enabled():
        return False

    clean_urls = _deduplicate_urls(urls)
    if not clean_urls:
        return False

    background_tasks.add_task(submit_urls_to_indexnow, clean_urls)
    return True


def _resolve_country_slug(entity: Any, db: Optional[Session] = None) -> Optional[str]:
    """Safely resolve `country.slug` for a Package without triggering broken lazy loads."""
    try:
        country = getattr(entity, "country", None)
        if country is not None and getattr(country, "slug", None):
            return country.slug
    except Exception:
        pass

    country_id = getattr(entity, "country_id", None)
    if db is not None and country_id is not None:
        try:
            from app.models.country import Country

            row = db.query(Country.slug).filter(Country.id == country_id).first()
            if row and row[0]:
                return row[0]
        except Exception as exc:
            logger.debug("Could not resolve country slug for country_id=%s: %s", country_id, exc)

    return None


def is_entity_public(entity: Any) -> bool:
    """
    Determine whether an ORM entity is currently publicly visible.

    - Entities with `is_active` must have `is_active == True`.
    - Entities with `is_published` must also have `is_published == True`.
    """
    if entity is None:
        return False
    if hasattr(entity, "is_active") and not bool(getattr(entity, "is_active")):
        return False
    if hasattr(entity, "is_published") and not bool(getattr(entity, "is_published")):
        return False
    return True


def notify_entity_change(
    background_tasks: Optional[BackgroundTasks],
    entity_type: str,
    entity: Any,
    *,
    db: Optional[Session] = None,
    force: bool = False,
) -> Optional[str]:
    """
    Schedule an IndexNow notification for a created/updated/published entity.

    Only notifies when the entity is publicly visible (`is_active` and, if present,
    `is_published` are True), unless `force=True` (e.g. when transitioning from
    published/active to unpublished/inactive so crawlers re-check the URL).

    Never raises; returns the scheduled URL or None if skipped.
    """
    try:
        if entity is None:
            return None
        if not force and not is_entity_public(entity):
            return None

        slug = getattr(entity, "slug", None)
        if not slug:
            return None

        country_slug = _resolve_country_slug(entity, db=db) if entity_type == "package" else None
        url = build_entity_url(entity_type, slug, country_slug=country_slug)

        if schedule_indexnow_submission(background_tasks, [url]):
            return url
        return None
    except Exception as exc:
        logger.warning("IndexNow notification scheduling failed for %s: %s", entity_type, exc)
        return None
