from typing import Any, List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.user import User
from app.models.supplier import Supplier
from app.models.supplier_rate_card import SupplierRateCard, SupplierRateCardItem
from app.auth.dependencies import get_current_finance_or_admin
from app.schemas.supplier_rate_card import (
    RateCardCreate, RateCardUpdate, RateCardResponse,
    RateCardItemCreate, RateCardItemUpdate, RateCardItemResponse, COST_BASES,
)

router = APIRouter()


def _check_basis(basis: Optional[str]) -> None:
    if basis is not None and basis not in COST_BASES:
        raise HTTPException(status_code=422, detail=f"cost_basis must be one of {sorted(COST_BASES)}")


def _to_response(card: SupplierRateCard) -> RateCardResponse:
    resp = RateCardResponse.model_validate(card)
    resp.supplier_name = card.supplier.name if card.supplier else None
    return resp


def _get_card(db: Session, card_id: int) -> SupplierRateCard:
    card = (
        db.query(SupplierRateCard)
        .options(joinedload(SupplierRateCard.items), joinedload(SupplierRateCard.supplier))
        .filter(SupplierRateCard.id == card_id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=404, detail="Rate card not found")
    return card


@router.get("", response_model=List[RateCardResponse])
def list_rate_cards(
    supplier_id: Optional[int] = None,
    service_type: Optional[str] = None,
    destination: Optional[str] = None,
    valid_on: Optional[date] = Query(None, description="Only cards valid on this date (e.g. travel date)"),
    active_only: bool = True,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    q = (
        db.query(SupplierRateCard)
        .options(joinedload(SupplierRateCard.items), joinedload(SupplierRateCard.supplier))
    )
    if supplier_id:
        q = q.filter(SupplierRateCard.supplier_id == supplier_id)
    if service_type:
        q = q.filter(SupplierRateCard.service_type == service_type)
    if destination:
        q = q.filter(SupplierRateCard.destination.ilike(f"%{destination}%"))
    if active_only:
        q = q.filter(SupplierRateCard.is_active.is_(True))
    if valid_on:
        q = q.filter(
            or_(SupplierRateCard.valid_from.is_(None), SupplierRateCard.valid_from <= valid_on),
            or_(SupplierRateCard.valid_to.is_(None), SupplierRateCard.valid_to >= valid_on),
        )
    if search:
        q = q.filter(or_(
            SupplierRateCard.name.ilike(f"%{search}%"),
            SupplierRateCard.quote_reference.ilike(f"%{search}%"),
        ))
    cards = q.order_by(SupplierRateCard.id.desc()).offset(skip).limit(limit).all()
    return [_to_response(c) for c in cards]


@router.post("", response_model=RateCardResponse)
def create_rate_card(
    data: RateCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    if not db.query(Supplier).filter(Supplier.id == data.supplier_id).first():
        raise HTTPException(status_code=404, detail="Supplier not found")
    if data.valid_from and data.valid_to and data.valid_to < data.valid_from:
        raise HTTPException(status_code=422, detail="valid_to must be on/after valid_from")
    for it in data.items:
        _check_basis(it.cost_basis)
    card = SupplierRateCard(**data.model_dump(exclude={"items"}))
    card.items = [SupplierRateCardItem(**it.model_dump()) for it in data.items]
    db.add(card)
    db.commit()
    return _to_response(_get_card(db, card.id))


@router.get("/{card_id}", response_model=RateCardResponse)
def get_rate_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    return _to_response(_get_card(db, card_id))


@router.patch("/{card_id}", response_model=RateCardResponse)
def update_rate_card(
    card_id: int,
    data: RateCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    card = _get_card(db, card_id)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(card, k, v)
    if card.valid_from and card.valid_to and card.valid_to < card.valid_from:
        raise HTTPException(status_code=422, detail="valid_to must be on/after valid_from")
    db.commit()
    return _to_response(_get_card(db, card_id))


@router.delete("/{card_id}")
def delete_rate_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    db.delete(_get_card(db, card_id))
    db.commit()
    return {"ok": True}


@router.post("/{card_id}/duplicate", response_model=RateCardResponse)
def duplicate_rate_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Copy a card (e.g. to roll rates over to a new season)."""
    src = _get_card(db, card_id)
    new = SupplierRateCard(
        supplier_id=src.supplier_id, name=f"{src.name} (copy)", service_type=src.service_type,
        destination=src.destination, currency=src.currency, notes=src.notes, is_active=True,
    )
    new.items = [
        SupplierRateCardItem(
            name=i.name, description=i.description, cost_basis=i.cost_basis, unit=i.unit,
            rate=i.rate, tax_amount=i.tax_amount, room_occupancy=i.room_occupancy,
            meal_plan=i.meal_plan, capacity=i.capacity, min_pax=i.min_pax,
            max_pax=i.max_pax, sort_order=i.sort_order, is_active=i.is_active,
        ) for i in src.items
    ]
    db.add(new)
    db.commit()
    return _to_response(_get_card(db, new.id))


@router.post("/{card_id}/items", response_model=RateCardItemResponse)
def add_item(
    card_id: int,
    data: RateCardItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    _get_card(db, card_id)
    _check_basis(data.cost_basis)
    item = SupplierRateCardItem(rate_card_id=card_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{card_id}/items/{item_id}", response_model=RateCardItemResponse)
def update_item(
    card_id: int,
    item_id: int,
    data: RateCardItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    item = db.query(SupplierRateCardItem).filter_by(id=item_id, rate_card_id=card_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Rate item not found")
    _check_basis(data.cost_basis)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{card_id}/items/{item_id}")
def delete_item(
    card_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    item = db.query(SupplierRateCardItem).filter_by(id=item_id, rate_card_id=card_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Rate item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
