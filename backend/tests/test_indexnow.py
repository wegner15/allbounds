"""Unit tests for the IndexNow instant-indexing service."""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi import BackgroundTasks

from app.core.config import settings
from app.services import indexnow


# ---------------------------------------------------------------------------
# URL construction tests
# ---------------------------------------------------------------------------


def test_build_public_url_normalizes_trailing_slash():
    assert (
        indexnow.build_public_url("/destinations/uganda", base_url="https://allboundvacations.com/")
        == "https://allboundvacations.com/destinations/uganda/"
    )
    assert (
        indexnow.build_public_url("blog/gorilla-trekking/", base_url="https://allboundvacations.com")
        == "https://allboundvacations.com/blog/gorilla-trekking/"
    )
    assert (
        indexnow.build_public_url("/", base_url="https://allboundvacations.com")
        == "https://allboundvacations.com/"
    )


@pytest.mark.parametrize(
    "entity_type,slug,country_slug,expected",
    [
        (
            "package",
            "bwindi-gorilla-safari",
            "uganda",
            "https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/",
        ),
        (
            "package",
            "bwindi-gorilla-safari",
            None,
            "https://allboundvacations.com/packages/bwindi-gorilla-safari/",
        ),
        (
            "group_trip",
            "kilimanjaro-group-trek",
            None,
            "https://allboundvacations.com/group-trips/kilimanjaro-group-trek/",
        ),
        (
            "country",
            "kenya",
            None,
            "https://allboundvacations.com/destinations/kenya/",
        ),
        (
            "hotel",
            "serena-kampala",
            None,
            "https://allboundvacations.com/hotels/serena-kampala/",
        ),
        (
            "attraction",
            "murchison-falls",
            None,
            "https://allboundvacations.com/attractions/murchison-falls/",
        ),
        (
            "activity",
            "gorilla-trekking",
            None,
            "https://allboundvacations.com/activities/gorilla-trekking/",
        ),
        (
            "blog",
            "best-time-to-visit-uganda",
            None,
            "https://allboundvacations.com/blog/best-time-to-visit-uganda/",
        ),
        (
            "blog_post",
            "rwanda-safari-guide",
            None,
            "https://allboundvacations.com/blog/rwanda-safari-guide/",
        ),
        (
            "region",
            "east-africa",
            None,
            "https://allboundvacations.com/regions/east-africa/",
        ),
        (
            "holiday_type",
            "luxury-safaris",
            None,
            "https://allboundvacations.com/holiday-types/luxury-safaris/",
        ),
    ],
)
def test_build_entity_url_all_types(entity_type, slug, country_slug, expected):
    assert (
        indexnow.build_entity_url(
            entity_type,
            slug,
            country_slug=country_slug,
            base_url="https://allboundvacations.com",
        )
        == expected
    )


def test_build_entity_url_rejects_empty_slug_or_unknown_type():
    with pytest.raises(ValueError):
        indexnow.build_entity_url("country", "")
    with pytest.raises(ValueError):
        indexnow.build_entity_url("unknown_entity", "some-slug")


# ---------------------------------------------------------------------------
# Payload & configuration tests
# ---------------------------------------------------------------------------


def test_build_indexnow_payload_format_and_deduplication():
    payload = indexnow.build_indexnow_payload(
        [
            "https://allboundvacations.com/destinations/uganda/",
            "https://allboundvacations.com/destinations/uganda/",
            "",
            "https://allboundvacations.com/blog/gorilla-guide/",
        ],
        key="abc123def456",
        base_url="https://allboundvacations.com",
    )
    assert payload == {
        "host": "allboundvacations.com",
        "key": "abc123def456",
        "keyLocation": "https://allboundvacations.com/abc123def456.txt",
        "urlList": [
            "https://allboundvacations.com/destinations/uganda/",
            "https://allboundvacations.com/blog/gorilla-guide/",
        ],
    }


def test_noop_when_disabled_or_unconfigured(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", False)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", "some-valid-key")

    with patch("app.services.indexnow.httpx.post") as mock_post:
        assert indexnow.is_indexnow_enabled() is False
        assert indexnow.submit_urls_to_indexnow(["https://allboundvacations.com/blog/test/"]) is False
        mock_post.assert_not_called()

    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", True)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", None)

    with patch("app.services.indexnow.httpx.post") as mock_post:
        assert indexnow.is_indexnow_enabled() is False
        assert indexnow.submit_urls_to_indexnow(["https://allboundvacations.com/blog/test/"]) is False
        mock_post.assert_not_called()


# ---------------------------------------------------------------------------
# Submission & graceful failure tests
# ---------------------------------------------------------------------------


def test_submit_urls_to_indexnow_success(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", True)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", "testkey1234567890")
    monkeypatch.setattr(settings, "PUBLIC_SITE_URL", "https://allboundvacations.com")

    mock_response = MagicMock(status_code=200, text="OK")
    with patch("app.services.indexnow.httpx.post", return_value=mock_response) as mock_post:
        ok = indexnow.submit_urls_to_indexnow(
            ["https://allboundvacations.com/packages/uganda/bwindi-safari/"]
        )

    assert ok is True
    mock_post.assert_called_once_with(
        indexnow.INDEXNOW_ENDPOINT,
        json={
            "host": "allboundvacations.com",
            "key": "testkey1234567890",
            "keyLocation": "https://allboundvacations.com/testkey1234567890.txt",
            "urlList": ["https://allboundvacations.com/packages/uganda/bwindi-safari/"],
        },
        headers={"Content-Type": "application/json; charset=utf-8"},
        timeout=indexnow.INDEXNOW_TIMEOUT_SECONDS,
    )


def test_submit_urls_to_indexnow_handles_network_error_gracefully(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", True)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", "testkey1234567890")

    with patch(
        "app.services.indexnow.httpx.post",
        side_effect=httpx.ConnectError("Connection refused"),
    ):
        # Must never raise an exception
        ok = indexnow.submit_urls_to_indexnow(["https://allboundvacations.com/blog/test/"])
    assert ok is False


def test_submit_urls_to_indexnow_handles_non_2xx_status(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", True)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", "testkey1234567890")

    mock_response = MagicMock(status_code=422, text="Unprocessable Entity")
    with patch("app.services.indexnow.httpx.post", return_value=mock_response):
        ok = indexnow.submit_urls_to_indexnow(["https://allboundvacations.com/blog/test/"])
    assert ok is False


# ---------------------------------------------------------------------------
# Entity visibility & BackgroundTasks scheduling tests
# ---------------------------------------------------------------------------


def test_notify_entity_change_skips_drafts_and_inactive(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", True)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", "testkey1234567890")
    monkeypatch.setattr(settings, "PUBLIC_SITE_URL", "https://allboundvacations.com")

    bg = BackgroundTasks()
    draft_post = SimpleNamespace(slug="draft-post", is_active=True, is_published=False)
    inactive_hotel = SimpleNamespace(slug="closed-lodge", is_active=False)

    assert indexnow.notify_entity_change(bg, "blog", draft_post) is None
    assert indexnow.notify_entity_change(bg, "hotel", inactive_hotel) is None
    assert len(bg.tasks) == 0


def test_notify_entity_change_schedules_published_package_and_forced_unpublish(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_ENABLED", True)
    monkeypatch.setattr(settings, "INDEXNOW_KEY", "testkey1234567890")
    monkeypatch.setattr(settings, "PUBLIC_SITE_URL", "https://allboundvacations.com")

    bg = BackgroundTasks()
    pkg = SimpleNamespace(
        slug="murchison-3-day",
        is_active=True,
        is_published=True,
        country=SimpleNamespace(slug="uganda"),
    )

    url = indexnow.notify_entity_change(bg, "package", pkg)
    assert url == "https://allboundvacations.com/packages/uganda/murchison-3-day/"
    assert len(bg.tasks) == 1

    # Forced notification on unpublish (status transition)
    unpublished_post = SimpleNamespace(slug="old-post", is_active=True, is_published=False)
    forced_url = indexnow.notify_entity_change(bg, "blog", unpublished_post, force=True)
    assert forced_url == "https://allboundvacations.com/blog/old-post/"
    assert len(bg.tasks) == 2


def test_verify_indexnow_key(monkeypatch):
    monkeypatch.setattr(settings, "INDEXNOW_KEY", None)
    assert indexnow.verify_indexnow_key("anything") is None

    monkeypatch.setattr(settings, "INDEXNOW_KEY", "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4")
    assert indexnow.verify_indexnow_key("wrong-key") is None
    assert (
        indexnow.verify_indexnow_key("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4")
        == "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
    )
