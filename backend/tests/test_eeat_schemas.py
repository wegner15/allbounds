"""
Unit tests for P1-4: Author E-E-A-T fields on User/Blog schemas and
updated_at freshness exposure across public detail schemas.
"""
from datetime import datetime, timezone
from pathlib import Path
import glob
import importlib.util
import re
import sys
from types import ModuleType, SimpleNamespace

from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import declarative_base

# Allow running schema/model unit tests in minimal environments without
# live Postgres drivers (psycopg2) or prometheus_client installed.
if importlib.util.find_spec("prometheus_client") is None or importlib.util.find_spec("psycopg2") is None:
    if "app.db.database" not in sys.modules:
        _db_stub = ModuleType("app.db.database")
        _db_stub.Base = declarative_base()
        sys.modules["app.db.database"] = _db_stub

if importlib.util.find_spec("email_validator") is None:
    _ev_stub = ModuleType("email_validator")
    _ev_stub.__version__ = "2.0.0"

    class _EmailNotValidError(ValueError):
        pass

    def _validate_email(email, **_kwargs):
        if "@" not in str(email):
            raise _EmailNotValidError("Invalid email")
        return SimpleNamespace(normalized=str(email), email=str(email))

    _ev_stub.EmailNotValidError = _EmailNotValidError
    _ev_stub.validate_email = _validate_email
    sys.modules["email_validator"] = _ev_stub
    import pydantic.networks as _pydantic_networks
    _pydantic_networks.email_validator = _ev_stub
    _pydantic_networks.import_email_validator = lambda: None
    _pydantic_networks.validate_email = lambda value: ("", str(value))

from app.models.user import User
from app.schemas.user import UserCreate, UserPublic, UserResponse, UserUpdate
from app.schemas.blog import AuthorInfo, BlogPostResponse
from app.schemas.package import PackageListResponse, PackageResponse
from app.schemas.package_detail import BlogPostSummary, PackageDetailResponse
from app.schemas.group_trip import GroupTripResponse
from app.schemas.country import CountryResponse
from app.schemas.hotel import HotelResponse
from app.schemas.attraction import AttractionResponse
from app.schemas.activity import ActivityResponse
from app.schemas.region import RegionResponse
from app.schemas.holiday_type import HolidayTypeResponse
from app.schemas.country_visit_info import CountryVisitInfo, MonthlyVisitRating, VisitRating


NOW = datetime(2026, 11, 25, 12, 0, 0, tzinfo=timezone.utc)
UPDATED = datetime(2026, 11, 25, 18, 30, 0, tzinfo=timezone.utc)


def test_user_model_has_nullable_eeat_columns():
    cols = User.__table__.columns

    expected_specs = {
        "bio": (Text, None),
        "job_title": (String, 255),
        "avatar_url": (String, 500),
        "credentials": (String, 500),
        "same_as": (JSON, None),
    }

    for col_name, (expected_type, expected_len) in expected_specs.items():
        assert col_name in cols, f"Missing column {col_name} on User"
        col = cols[col_name]
        assert col.nullable is True, f"Column {col_name} must be nullable"
        assert isinstance(col.type, expected_type), (
            f"Column {col_name} expected {expected_type}, got {type(col.type)}"
        )
        if expected_len is not None:
            assert col.type.length == expected_len
        assert col.default is None
        assert col.server_default is None


def test_user_schemas_accept_and_serialize_eeat_fields():
    same_as_urls = [
        "https://www.linkedin.com/in/amina-safari",
        "https://x.com/aminasafari",
    ]
    create_payload = UserCreate(
        email="amina@allbounds.com",
        password="supersecurepassword",
        first_name="Amina",
        last_name="Ochieng",
        bio="East Africa safari specialist with 12 years guiding in Kenya and Tanzania.",
        job_title="Senior Safari Editor",
        avatar_url="https://imagedelivery.net/example/amina/public",
        credentials="KPSGA Silver Certified Guide",
        same_as=same_as_urls,
    )
    assert create_payload.job_title == "Senior Safari Editor"
    assert create_payload.same_as == same_as_urls

    update_payload = UserUpdate(
        bio="Updated bio",
        credentials="KPSGA Gold Guide",
        same_as=["https://allbounds.com/authors/amina"],
    )
    dumped_update = update_payload.model_dump(exclude_unset=True)
    assert dumped_update == {
        "bio": "Updated bio",
        "credentials": "KPSGA Gold Guide",
        "same_as": ["https://allbounds.com/authors/amina"],
    }

    user_orm = SimpleNamespace(
        id=7,
        email="amina@allbounds.com",
        hashed_password="secret",
        first_name="Amina",
        last_name="Ochieng",
        bio=create_payload.bio,
        job_title=create_payload.job_title,
        avatar_url=create_payload.avatar_url,
        credentials=create_payload.credentials,
        same_as=same_as_urls,
        is_active=True,
        is_superuser=False,
        created_at=NOW,
        updated_at=UPDATED,
        last_login=None,
        roles=[],
    )

    user_resp = UserResponse.model_validate(user_orm)
    assert user_resp.bio == create_payload.bio
    assert user_resp.credentials == "KPSGA Silver Certified Guide"
    assert user_resp.same_as == same_as_urls

    public_profile = UserPublic.model_validate(user_orm).model_dump()
    assert public_profile["name"] == "Amina Ochieng"
    assert public_profile["job_title"] == "Senior Safari Editor"
    assert public_profile["same_as"] == same_as_urls
    assert "email" not in public_profile
    assert "hashed_password" not in public_profile


def test_blog_post_response_serializes_author_populated_and_none():
    populated_author = SimpleNamespace(
        id=3,
        first_name="David",
        last_name="Kamau",
        bio="Wildlife photographer and conservation writer.",
        job_title="Lead Travel Writer",
        avatar_url="https://imagedelivery.net/example/david/public",
        credentials="BSc Wildlife Management",
        same_as=["https://instagram.com/davidkamau"],
    )
    post_with_author = BlogPostResponse.model_validate(
        {
            "id": 101,
            "title": "Great Migration Guide",
            "slug": "great-migration-guide",
            "content": "Full migration guide content.",
            "summary": "When to visit Maasai Mara.",
            "author_id": 3,
            "author": populated_author,
            "is_published": True,
            "is_active": True,
            "is_featured": False,
            "created_at": NOW,
            "updated_at": UPDATED,
            "published_at": NOW,
            "tags": [],
            "packages": [],
        }
    )
    dumped = post_with_author.model_dump()
    assert dumped["author"]["name"] == "David Kamau"
    assert dumped["author"]["bio"] == "Wildlife photographer and conservation writer."
    assert dumped["author"]["job_title"] == "Lead Travel Writer"
    assert dumped["author"]["avatar_url"] == "https://imagedelivery.net/example/david/public"
    assert dumped["author"]["credentials"] == "BSc Wildlife Management"
    assert dumped["author"]["same_as"] == ["https://instagram.com/davidkamau"]

    # Author with all optional E-E-A-T fields None
    minimal_author = AuthorInfo.model_validate(
        SimpleNamespace(
            id=4,
            first_name=None,
            last_name=None,
            bio=None,
            job_title=None,
            avatar_url=None,
            credentials=None,
            same_as=None,
        )
    )
    assert minimal_author.name is None
    assert minimal_author.bio is None
    assert minimal_author.job_title is None
    assert minimal_author.avatar_url is None
    assert minimal_author.credentials is None
    assert minimal_author.same_as is None

    # BlogPostResponse when author is omitted / None
    post_without_author = BlogPostResponse.model_validate(
        {
            "id": 102,
            "title": "Safari Packing List",
            "slug": "safari-packing-list",
            "content": "What to pack.",
            "author_id": 4,
            "is_published": True,
            "is_active": True,
            "is_featured": False,
            "created_at": NOW,
            "updated_at": UPDATED,
        }
    )
    assert post_without_author.author is None


def test_public_detail_schemas_serialize_updated_at():
    region = RegionResponse(
        id=1,
        name="East Africa",
        slug="east-africa",
        is_active=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert region.updated_at == UPDATED

    country = CountryResponse(
        id=10,
        name="Kenya",
        slug="kenya",
        region_id=1,
        is_active=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert country.updated_at == UPDATED

    package = PackageResponse(
        id=20,
        name="Kenya Safari",
        slug="kenya-safari",
        country_id=10,
        is_active=True,
        is_featured=False,
        is_published=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert package.updated_at == UPDATED

    package_list = PackageListResponse(
        id=20,
        name="Kenya Safari",
        slug="kenya-safari",
        country_id=10,
        is_active=True,
        is_featured=False,
        is_deal=False,
        created_at=NOW,
        updated_at=UPDATED,
        country=country,
    )
    assert package_list.updated_at == UPDATED

    package_detail = PackageDetailResponse(
        id=20,
        name="Kenya Safari",
        slug="kenya-safari",
        is_active=True,
        is_featured=False,
        created_at=NOW,
        updated_at=UPDATED,
        country={"id": 10, "name": "Kenya", "slug": "kenya"},
        blog_posts=[
            BlogPostSummary(
                id=1,
                title="Guide",
                slug="guide",
                created_at=NOW,
                updated_at=UPDATED,
            )
        ],
    )
    assert package_detail.updated_at == UPDATED
    assert package_detail.blog_posts[0].updated_at == UPDATED

    # Also verify Optional[datetime] = None fallback works when updated_at is omitted
    package_detail_none = PackageDetailResponse(
        id=21,
        name="Tanzania Safari",
        slug="tanzania-safari",
        is_active=True,
        is_featured=False,
        created_at=NOW,
        country={"id": 11, "name": "Tanzania", "slug": "tanzania"},
    )
    assert package_detail_none.updated_at is None

    group_trip = GroupTripResponse(
        id=30,
        name="Serengeti Group Safari",
        slug="serengeti-group-safari",
        country_id=10,
        is_active=True,
        is_featured=False,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert group_trip.updated_at == UPDATED

    hotel = HotelResponse(
        id=40,
        name="Mara Serena Lodge",
        slug="mara-serena-lodge",
        country_id=10,
        is_active=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert hotel.updated_at == UPDATED

    attraction = AttractionResponse(
        id=50,
        name="Maasai Mara",
        slug="maasai-mara",
        country_id=10,
        is_active=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert attraction.updated_at == UPDATED

    activity = ActivityResponse(
        id=60,
        name="Hot Air Balloon",
        slug="hot-air-balloon",
        is_active=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert activity.updated_at == UPDATED

    holiday_type = HolidayTypeResponse(
        id=70,
        name="Wildlife Safari",
        slug="wildlife-safari",
        is_active=True,
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert holiday_type.updated_at == UPDATED

    visit_info = CountryVisitInfo(
        id=80,
        country_id=10,
        monthly_ratings=[
            MonthlyVisitRating(month="July", rating=VisitRating.excellent)
        ],
        created_at=NOW,
        updated_at=UPDATED,
    )
    assert visit_info.updated_at == UPDATED


def test_alembic_single_head_includes_user_eeat_migration():
    versions_dir = Path(__file__).resolve().parents[1] / "alembic" / "versions"
    revs = {}
    downs = set()
    for path in glob.glob(str(versions_dir / "*.py")):
        text = Path(path).read_text(encoding="utf-8")
        rev_m = re.search(r"revision\s*(?::\s*[^=]+)?=\s*['\"]([^'\"]+)['\"]", text)
        down_m = re.search(r"down_revision\s*(?::\s*[^=]+)?=\s*(.+)", text)
        if rev_m:
            revs[rev_m.group(1)] = Path(path).name
        if down_m and down_m.group(1).strip() != "None":
            for parent in re.findall(r"['\"]([^'\"]+)['\"]", down_m.group(1)):
                downs.add(parent)

    heads = [rev for rev in revs if rev not in downs]
    assert heads == ["c9d0e1f2a3b4"], f"Expected single head c9d0e1f2a3b4, got {heads}"
