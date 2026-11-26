"""
Unit tests for Flight Details on Invoices:
- SQLAlchemy Invoice.flight_details nullable JSON column
- FlightSegment & FlightDetails Pydantic validation
- InvoiceCreate, InvoiceUpdate, InvoiceResponse schema handling & nullable default
- HTML email Flight Itinerary rendering & escaping
- Alembic single-head chain verification
"""
from datetime import date, datetime, timezone
from pathlib import Path
import glob
import importlib.util
import re
import sys
from types import ModuleType, SimpleNamespace

import pytest
from pydantic import ValidationError
from sqlalchemy import JSON
from sqlalchemy.orm import declarative_base

# Allow running unit tests in minimal environments without live Postgres drivers,
# email_validator, requests, or PIL installed.
if importlib.util.find_spec("prometheus_client") is None or importlib.util.find_spec("psycopg2") is None:
    if "app.db.database" not in sys.modules:
        _db_stub = ModuleType("app.db.database")
        _db_stub.Base = declarative_base()
        _db_stub.SessionLocal = lambda: None
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

if importlib.util.find_spec("requests") is None and "app.services.email" not in sys.modules:
    _email_stub = ModuleType("app.services.email")
    _email_stub.email_service = SimpleNamespace(
        generate_html_email=lambda **kwargs: kwargs.get("content_html", ""),
        send_email=lambda *args, **kwargs: True,
    )
    sys.modules["app.services.email"] = _email_stub

if importlib.util.find_spec("PIL") is None and "app.services.stamp" not in sys.modules:
    _stamp_stub = ModuleType("app.services.stamp")
    _stamp_stub.stamp_img_html = lambda *args, **kwargs: ""
    _stamp_stub.stamp_inline_image = lambda *args, **kwargs: {}
    sys.modules["app.services.stamp"] = _stamp_stub

from app.models.finance import Invoice
from app.schemas.finance import (
    FlightDetails,
    FlightSegment,
    InvoiceCreate,
    InvoiceResponse,
    InvoiceUpdate,
)
from app.services.finance_service import render_flight_itinerary_html


SAMPLE_FLIGHT_DETAILS = {
    "pnr": "ABC123",
    "notes": "23kg checked baggage included",
    "segments": [
        {
            "airline": "KQ",
            "flight_number": "411",
            "date": "28NOV",
            "origin": "EBB",
            "destination": "NBO",
            "departure_time": "0935",
            "arrival_time": "1050",
            "day": "SA",
        },
        {
            "airline": "KQ",
            "flight_number": "100",
            "date": "28NOV",
            "origin": "NBO",
            "destination": "LHR",
            "departure_time": "2350",
            "arrival_time": "0615",
            "day": "SU",
        },
    ],
}


def test_invoice_model_has_nullable_flight_details_json_column():
    cols = Invoice.__table__.columns
    assert "flight_details" in cols
    col = cols["flight_details"]
    assert col.nullable is True
    assert isinstance(col.type, JSON)
    assert col.default is None
    assert col.server_default is None


def test_flight_details_schema_validation():
    details = FlightDetails.model_validate(SAMPLE_FLIGHT_DETAILS)
    assert details.pnr == "ABC123"
    assert details.notes == "23kg checked baggage included"
    assert len(details.segments) == 2
    assert details.segments[0].airline == "KQ"
    assert details.segments[0].flight_number == "411"
    assert details.segments[0].origin == "EBB"
    assert details.segments[0].destination == "NBO"
    assert details.segments[0].day == "SA"

    # Optional pnr, notes, day
    minimal = FlightDetails(
        segments=[
            FlightSegment(
                airline="ET",
                flight_number="335",
                date="01DEC",
                origin="EBB",
                destination="ADD",
                departure_time="1500",
                arrival_time="1715",
            )
        ]
    )
    assert minimal.pnr is None
    assert minimal.notes is None
    assert minimal.segments[0].day is None

    # Empty segments default
    empty = FlightDetails()
    assert empty.segments == []

    # Missing required fields on FlightSegment raises ValidationError
    with pytest.raises(ValidationError):
        FlightSegment(
            airline="",
            flight_number="411",
            origin="EBB",
            destination="NBO",
        )

    with pytest.raises(ValidationError):
        FlightSegment(
            airline="KQ",
            flight_number="411",
            origin="EBB",
        )


def test_invoice_schemas_flight_details_default_and_roundtrip():
    today = date(2026, 11, 26)

    # Nullable default on InvoiceCreate
    inv_create_default = InvoiceCreate(invoice_date=today, due_date=today)
    assert inv_create_default.flight_details is None

    # Populated on InvoiceCreate
    inv_create_with_flights = InvoiceCreate(
        invoice_date=today,
        due_date=today,
        flight_details=SAMPLE_FLIGHT_DETAILS,
    )
    assert inv_create_with_flights.flight_details is not None
    assert inv_create_with_flights.flight_details.pnr == "ABC123"
    assert len(inv_create_with_flights.flight_details.segments) == 2

    # InvoiceUpdate exclude_unset behavior
    upd_omitted = InvoiceUpdate(notes="Updated note")
    assert "flight_details" not in upd_omitted.model_dump(exclude_unset=True)

    upd_cleared = InvoiceUpdate(flight_details=None)
    assert upd_cleared.model_dump(exclude_unset=True) == {"flight_details": None}

    upd_set = InvoiceUpdate(flight_details=SAMPLE_FLIGHT_DETAILS)
    dumped = upd_set.model_dump(exclude_unset=True)
    assert dumped["flight_details"]["pnr"] == "ABC123"
    assert len(dumped["flight_details"]["segments"]) == 2

    # InvoiceResponse from ORM-like object (with and without flight_details)
    now = datetime(2026, 11, 26, 10, 0, 0, tzinfo=timezone.utc)
    base_orm = dict(
        id=1,
        invoice_number="INV-2026-00001",
        booking_id=None,
        quote_number=None,
        invoice_status="draft",
        invoice_date=today,
        booking_date=None,
        due_date=today,
        currency="USD",
        exchange_rate_to_usd=1.0,
        consultant_id=None,
        consultant_name=None,
        payment_terms=None,
        client_id=None,
        client_type="individual",
        client_details={"full_name": "Jane Doe"},
        trip_summary={},
        subtotal=1200.0,
        discount_amount=0.0,
        promotional_discount=0.0,
        taxable_amount=1200.0,
        vat_amount=0.0,
        other_taxes_amount=0.0,
        service_fee=0.0,
        booking_fee=0.0,
        payment_processing_fee=0.0,
        total_amount=1200.0,
        amount_paid=0.0,
        credit_applied=0.0,
        balance_due=1200.0,
        payment_methods_snapshot=None,
        notes=None,
        terms_and_conditions=None,
        verification_token="ABV-12345678",
        created_at=now,
        updated_at=now,
        line_items=[],
        receipts=[],
    )

    resp_none = InvoiceResponse.model_validate(SimpleNamespace(**base_orm, flight_details=None))
    assert resp_none.flight_details is None

    resp_with = InvoiceResponse.model_validate(
        SimpleNamespace(**base_orm, flight_details=SAMPLE_FLIGHT_DETAILS)
    )
    assert resp_with.flight_details is not None
    assert resp_with.flight_details.pnr == "ABC123"
    assert resp_with.flight_details.segments[1].destination == "LHR"


def test_render_flight_itinerary_html():
    # None or empty segments -> empty string
    assert render_flight_itinerary_html(None) == ""
    assert render_flight_itinerary_html({"pnr": "ABC123", "segments": []}) == ""
    assert render_flight_itinerary_html(FlightDetails(pnr="ABC123", segments=[])) == ""

    # Populated segments -> Flight Itinerary table with headers, PNR, notes, rows
    rendered = render_flight_itinerary_html(SAMPLE_FLIGHT_DETAILS)
    assert "Flight Itinerary" in rendered
    for header in ("#", "Flight", "Date", "Route", "Departure", "Arrival", "Day"):
        assert f">{header}</th>" in rendered
    assert "ABC123" in rendered
    assert "23kg checked baggage included" in rendered
    assert "KQ 411" in rendered
    assert "28NOV" in rendered
    assert "EBB &rarr; NBO" in rendered
    assert "0935" in rendered
    assert "1050" in rendered
    assert "SA" in rendered
    assert "KQ 100" in rendered
    assert "NBO &rarr; LHR" in rendered

    # Accepts Pydantic model directly and escapes HTML characters
    xss_details = FlightDetails(
        pnr="<script>alert(1)</script>",
        notes="Check-in <2h> prior & carry passport",
        segments=[
            FlightSegment(
                airline="KQ",
                flight_number="411",
                date="28NOV",
                origin="EBB",
                destination="NBO",
                departure_time="0935",
                arrival_time="1050",
                day="SA",
            )
        ],
    )
    safe_html = render_flight_itinerary_html(xss_details)
    assert "<script>" not in safe_html
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in safe_html
    assert "Check-in &lt;2h&gt; prior &amp; carry passport" in safe_html


def test_alembic_single_head_includes_flight_details_migration():
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
    assert heads == ["d4e5f6a7b8c9"], f"Expected single head d4e5f6a7b8c9, got {heads}"
