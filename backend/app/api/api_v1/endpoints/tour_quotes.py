from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.user import User
from app.models.client import Client
from app.models.hotel import Hotel
from app.models.attraction import Attraction
from app.models.activity import Activity
from app.models.country import Country
from app.models.tour_quote import (
    TourQuote, TourQuoteScenario, TourQuoteDay, TourQuoteItem, TourQuoteDiscount,
)
from app.auth.dependencies import get_current_finance_or_admin
from app.schemas.tour_quote import (
    QuoteWrite, QuoteOut, QuoteListItem, ConvertRequest, CatalogueItemResponse, STATUSES,
)
from app.schemas.finance import InvoiceCreate, InvoiceLineItemCreate, InvoiceResponse
from app.services import tour_quote_service as engine
from app.services.finance_service import finance_service

router = APIRouter()

BASES = {"per_person", "per_group", "per_room", "per_vehicle", "per_booking"}
LINE_CATEGORY = {
    "accommodation": "accommodation", "transport": "transportation",
    "activity": "activities", "flight": "flights",
}


def _user_label(u: User) -> str:
    name = " ".join(filter(None, [getattr(u, "first_name", None), getattr(u, "last_name", None)]))
    return name or u.email


def _quote_dict(q) -> Dict[str, Any]:
    """Works for both ORM TourQuote and QuoteWrite payloads."""
    g = (lambda k: getattr(q, k))
    def rows(name, cols):
        return [{c: getattr(r, c) for c in cols} for r in getattr(q, name)]
    return {
        "pricing_method": g("pricing_method"), "pricing_value": g("pricing_value"),
        "contingency_percent": g("contingency_percent"), "tax_enabled": g("tax_enabled"),
        "tax_rate": g("tax_rate"), "tax_inclusive": g("tax_inclusive"),
        "scenarios": rows("scenarios", ["id", "label", "pax", "foc_count", "rooms"]),
        "items": rows("items", ["component_type", "cost_basis", "unit_cost", "tax_amount", "qty",
                                "capacity", "is_optional"]),
        "discounts": rows("discounts", ["mode", "value", "scope"]),
    }


def _validate(data: QuoteWrite) -> None:
    if data.pricing_method not in ("markup", "margin"):
        raise HTTPException(422, "pricing_method must be 'markup' or 'margin'")
    if data.pricing_method == "margin" and data.pricing_value >= 100:
        raise HTTPException(422, "Target margin must be below 100%")
    if data.start_date and data.end_date and data.end_date < data.start_date:
        raise HTTPException(422, "end_date must be on/after start_date")
    for it in data.items:
        if it.cost_basis not in BASES:
            raise HTTPException(422, f"cost_basis must be one of {sorted(BASES)}")
    for d in data.discounts:
        if d.mode not in ("percent", "amount"):
            raise HTTPException(422, "discount mode must be 'percent' or 'amount'")
        if d.mode == "percent" and d.value > 100:
            raise HTTPException(422, "Percent discount cannot exceed 100")
    for s in data.scenarios:
        if s.foc_count >= s.pax:
            raise HTTPException(422, f"Scenario '{s.label or s.pax}': FOC must be fewer than pax")


def _out(q: TourQuote) -> QuoteOut:
    out = QuoteOut.model_validate(q)
    try:
        out.results = engine.calculate_quote(_quote_dict(q))
    except ValueError as e:
        raise HTTPException(422, str(e))
    return out


def _get(db: Session, quote_id: int) -> TourQuote:
    q = (db.query(TourQuote)
         .options(joinedload(TourQuote.scenarios), joinedload(TourQuote.days),
                  joinedload(TourQuote.items), joinedload(TourQuote.discounts))
         .filter(TourQuote.id == quote_id).first())
    if not q:
        raise HTTPException(404, "Quote not found")
    return q


def _next_number(db: Session) -> str:
    prefix = f"TQ-{datetime.utcnow().year}-"
    last = (db.query(TourQuote).filter(TourQuote.quote_number.like(f"{prefix}%"))
            .order_by(TourQuote.id.desc()).first())
    n = 1
    if last:
        try:
            n = int(last.quote_number.replace(prefix, "")) + 1
        except ValueError:
            pass
    return f"{prefix}{n:04d}"


def _apply_children(q: TourQuote, data: QuoteWrite) -> None:
    q.scenarios = [TourQuoteScenario(**s.model_dump(exclude={"id"})) for s in data.scenarios]
    q.days = [TourQuoteDay(**d.model_dump()) for d in data.days]
    q.items = [TourQuoteItem(**{**it.model_dump(), "sort_order": i}) for i, it in enumerate(data.items)]
    q.discounts = [TourQuoteDiscount(**d.model_dump()) for d in data.discounts]


def _header(data: QuoteWrite) -> Dict[str, Any]:
    return data.model_dump(exclude={"scenarios", "days", "items", "discounts"})


@router.get("/catalogue-search", response_model=List[CatalogueItemResponse])
def search_catalogue(
    q: Optional[str] = None,
    category: Optional[str] = "all",
    destination: Optional[str] = None,
    limit: int = 25,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Search existing Hotels, Attractions, and Activities to populate quotes."""
    results: List[CatalogueItemResponse] = []
    term = f"%{q.strip()}%" if q and q.strip() else None
    dest_term = f"%{destination.strip()}%" if destination and destination.strip() else None

    # 1. Hotels
    if category in ("all", "hotel", "accommodation"):
        qh = db.query(Hotel).options(joinedload(Hotel.country)).filter(Hotel.is_active.is_(True))
        if term:
            qh = qh.filter(or_(Hotel.name.ilike(term), Hotel.city.ilike(term)))
        if dest_term:
            qh = qh.outerjoin(Hotel.country).filter(
                or_(Hotel.city.ilike(dest_term), Country.name.ilike(dest_term))
            )
        hotels = qh.order_by(Hotel.stars.desc().nullslast(), Hotel.name.asc()).limit(limit).all()
        for h in hotels:
            c_name = h.country.name if h.country else None
            dest = ", ".join(filter(None, [h.city, c_name]))
            img = h.image_id or getattr(h, "cover_image", None)
            desc = h.summary or h.description
            results.append(
                CatalogueItemResponse(
                    entity_type="hotel",
                    entity_id=h.id,
                    name=h.name,
                    summary=h.summary,
                    description=desc,
                    destination=dest,
                    country_name=c_name,
                    image_url=img,
                    suggested_component_type="accommodation",
                    suggested_cost_basis="per_room",
                    default_price=0.0,
                    stars=h.stars,
                    price_category=h.price_category,
                )
            )

    # 2. Attractions & Parks
    if category in ("all", "attraction", "park_fee"):
        qa = db.query(Attraction).options(joinedload(Attraction.country)).filter(Attraction.is_active.is_(True))
        if term:
            qa = qa.filter(or_(Attraction.name.ilike(term), Attraction.city.ilike(term)))
        if dest_term:
            qa = qa.outerjoin(Attraction.country).filter(
                or_(Attraction.city.ilike(dest_term), Country.name.ilike(dest_term))
            )
        attractions = qa.order_by(Attraction.order_index.asc(), Attraction.name.asc()).limit(limit).all()
        for a in attractions:
            c_name = a.country.name if a.country else None
            dest = ", ".join(filter(None, [a.city, c_name]))
            img = a.cover_image or a.image_id
            desc = a.summary or a.description
            results.append(
                CatalogueItemResponse(
                    entity_type="attraction",
                    entity_id=a.id,
                    name=a.name,
                    summary=a.summary,
                    description=desc,
                    destination=dest,
                    country_name=c_name,
                    image_url=img,
                    suggested_component_type="park_fee",
                    suggested_cost_basis="per_person",
                    default_price=float(a.price or 0.0),
                )
            )

    # 3. Activities & Excursions
    if category in ("all", "activity"):
        qact = db.query(Activity).options(joinedload(Activity.cover_image)).filter(Activity.is_active.is_(True))
        if term:
            qact = qact.filter(or_(Activity.name.ilike(term), Activity.summary.ilike(term)))
        activities = qact.order_by(Activity.order_index.asc(), Activity.name.asc()).limit(limit).all()
        for ac in activities:
            img = None
            if ac.cover_image:
                img = ac.cover_image.storage_key or ac.cover_image.file_path
            desc = ac.summary or ac.description
            results.append(
                CatalogueItemResponse(
                    entity_type="activity",
                    entity_id=ac.id,
                    name=ac.name,
                    summary=ac.summary,
                    description=desc,
                    destination=None,
                    country_name=None,
                    image_url=img,
                    suggested_component_type="activity",
                    suggested_cost_basis="per_person",
                    default_price=0.0,
                )
            )

    return results[: limit * 2 if category == "all" else limit]


@router.get("", response_model=List[QuoteListItem])
def list_quotes(
    status: Optional[str] = None, search: Optional[str] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db), user: User = Depends(get_current_finance_or_admin),
) -> Any:
    qs = db.query(TourQuote).options(
        joinedload(TourQuote.scenarios), joinedload(TourQuote.items), joinedload(TourQuote.discounts))
    if status and status != "all":
        qs = qs.filter(TourQuote.status == status)
    if search:
        like = f"%{search}%"
        qs = qs.filter(or_(TourQuote.name.ilike(like), TourQuote.quote_number.ilike(like),
                           TourQuote.client_name.ilike(like), TourQuote.destination.ilike(like)))
    rows = qs.order_by(TourQuote.id.desc()).offset(skip).limit(limit).all()
    out = []
    for q in rows:
        item = QuoteListItem.model_validate(q)
        try:
            item.scenario_summaries = [
                {"pax": r["pax"], "price_per_person": r["price_per_person"], "final_total": r["final_total"]}
                for r in engine.calculate_quote(_quote_dict(q))]
        except ValueError:
            pass
        out.append(item)
    return out


@router.post("/preview")
def preview(data: QuoteWrite, user: User = Depends(get_current_finance_or_admin)) -> Any:
    """Calculate without saving, for live totals in the editor."""
    _validate(data)
    try:
        return engine.calculate_quote(_quote_dict(data))
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.post("", response_model=QuoteOut)
def create_quote(
    data: QuoteWrite, db: Session = Depends(get_db),
    user: User = Depends(get_current_finance_or_admin),
) -> Any:
    _validate(data)
    q = TourQuote(**_header(data), quote_number=_next_number(db), status="draft",
                  prepared_by=_user_label(user))
    _apply_children(q, data)
    db.add(q)
    db.commit()
    return _out(_get(db, q.id))


@router.get("/{quote_id}", response_model=QuoteOut)
def get_quote(quote_id: int, db: Session = Depends(get_db),
              user: User = Depends(get_current_finance_or_admin)) -> Any:
    return _out(_get(db, quote_id))


@router.put("/{quote_id}", response_model=QuoteOut)
def update_quote(
    quote_id: int, data: QuoteWrite, db: Session = Depends(get_db),
    user: User = Depends(get_current_finance_or_admin),
) -> Any:
    q = _get(db, quote_id)
    if q.status in ("approved", "converted"):
        raise HTTPException(409, f"A {q.status} quote is locked. Reopen it to draft before editing.")
    _validate(data)
    for k, v in _header(data).items():
        setattr(q, k, v)
    _apply_children(q, data)
    if q.status in ("submitted", "rejected"):
        q.status = "draft"
    db.commit()
    return _out(_get(db, quote_id))


@router.delete("/{quote_id}")
def delete_quote(quote_id: int, db: Session = Depends(get_db),
                 user: User = Depends(get_current_finance_or_admin)) -> Any:
    q = _get(db, quote_id)
    if q.status == "converted":
        raise HTTPException(409, "Converted quotes cannot be deleted")
    db.delete(q)
    db.commit()
    return {"ok": True}


@router.post("/{quote_id}/status/{new_status}", response_model=QuoteOut)
def set_status(quote_id: int, new_status: str, db: Session = Depends(get_db),
               user: User = Depends(get_current_finance_or_admin)) -> Any:
    """Workflow: draft -> submitted -> approved/rejected; approved/rejected -> draft (reopen)."""
    allowed = {
        "draft": {"submitted"},
        "submitted": {"approved", "rejected", "draft"},
        "approved": {"draft"},
        "rejected": {"draft"},
        "converted": set(),
    }
    q = _get(db, quote_id)
    if new_status not in STATUSES or new_status not in allowed.get(q.status, set()):
        raise HTTPException(409, f"Cannot move quote from '{q.status}' to '{new_status}'")
    if new_status == "submitted" and not (q.scenarios and q.items):
        raise HTTPException(422, "Add at least one group size and one cost line before submitting")
    if new_status == "approved":
        q.approved_by, q.approved_at = _user_label(user), datetime.now(timezone.utc)
    if new_status == "draft":
        q.approved_by, q.approved_at = None, None
    q.status = new_status
    db.commit()
    return _out(_get(db, quote_id))


@router.post("/{quote_id}/convert-to-invoice", response_model=InvoiceResponse)
def convert_to_invoice(
    quote_id: int, body: ConvertRequest, db: Session = Depends(get_db),
    user: User = Depends(get_current_finance_or_admin),
) -> Any:
    q = _get(db, quote_id)
    if q.status == "converted":
        raise HTTPException(409, "This quote has already been converted")
    if q.status != "approved":
        raise HTTPException(409, "Only approved quotes can be converted to an invoice")
    scenario = next((s for s in q.scenarios if s.id == body.scenario_id), None)
    if not scenario:
        raise HTTPException(404, "Group size (scenario) not found on this quote")

    result = next(r for r in engine.calculate_quote(_quote_dict(q)) if r["scenario_id"] == scenario.id)
    if result["price_before_tax"] <= 0:
        raise HTTPException(422, "Quote price is zero; nothing to invoice")

    # client details
    client = db.query(Client).filter(Client.id == q.client_id).first() if q.client_id else None
    if client:
        full_name = " ".join(filter(None, [client.first_name, client.last_name])) or client.company_name
        client_details = {
            "full_name": full_name, "email": client.email, "telephone": client.phone,
            "country": client.country_of_origin, "address": client.address or "",
            "company_name": client.company_name or "", "contact_person": client.contact_person or "",
            "tin_vat": client.tin_number or "", "purchase_order_number": "",
        }
        client_type = client.client_type
    else:
        client_details = {"full_name": q.client_name or "", "email": "", "telephone": "",
                          "country": "", "address": "", "company_name": "", "contact_person": "",
                          "tin_vat": "", "purchase_order_number": ""}
        client_type = "individual"

    # Invoice lines: pre-tax price split across components by cost share. Supplier cost
    # stays on the internal cost_price field only.
    first_day = q.start_date
    lines = []
    for idx, (comp, cost, price) in enumerate(engine.allocate_invoice_lines(
            _quote_dict(q), result, result["pax"], result["rooms"])):
        lines.append(InvoiceLineItemCreate(
            category=LINE_CATEGORY.get(comp, "other"),
            title=f"{comp.replace('_', ' ').title()} - {q.name}",
            description=f"{result['pax']} travellers ({result['paying_pax']} paying)",
            travel_date=first_day, quantity=1, unit_price=price, cost_price=cost,
            total_amount=price, sort_order=idx,
            metadata_json={"tour_quote_id": q.id, "component_type": comp},
        ))

    today = date.today()
    inv_in = InvoiceCreate(
        quote_number=q.quote_number, invoice_status="draft", invoice_date=today,
        due_date=body.due_date or today, currency=q.currency,
        consultant_name=_user_label(user), payment_terms=body.payment_terms,
        client_id=q.client_id, client_type=client_type, client_details=client_details,
        trip_summary={
            "lead_traveller": client_details["full_name"], "destinations": q.destination or "",
            "travel_type": q.category or "Tour", "travel_start_date": q.start_date.isoformat() if q.start_date else None,
            "travel_end_date": q.end_date.isoformat() if q.end_date else None,
            "adults": result["pax"], "children": 0,
        },
        subtotal=result["price_before_tax"], vat_amount=result["tax_amount"],
        notes=q.notes, line_items=lines,
    )
    invoice = finance_service.create_invoice(db, inv_in)

    q.status = "converted"
    q.invoice_id = invoice.id
    q.converted_scenario_id = scenario.id
    db.commit()
    return invoice
