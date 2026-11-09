from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Float, ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class SupplierRateCard(Base):
    """A supplier's price list for a period/season, holding many rate lines."""
    __tablename__ = "supplier_rate_cards"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)  # e.g. "2026 High Season"
    quote_reference = Column(String(100), nullable=True)  # supplier's quote number
    # accommodation, transport, activity, park_fee, guide, flight, meal, other
    service_type = Column(String(50), nullable=False, default="accommodation", index=True)
    destination = Column(String(255), nullable=True)
    currency = Column(String(10), nullable=False, default="USD")

    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    supplier = relationship("Supplier", back_populates="rate_cards")
    items = relationship(
        "SupplierRateCardItem", back_populates="rate_card",
        cascade="all, delete-orphan", order_by="SupplierRateCardItem.sort_order",
    )


class SupplierRateCardItem(Base):
    """One priced line on a rate card (room type, vehicle, activity, fee...)."""
    __tablename__ = "supplier_rate_card_items"

    id = Column(Integer, primary_key=True, index=True)
    rate_card_id = Column(Integer, ForeignKey("supplier_rate_cards.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)  # "Deluxe Double", "Coaster 29-seater"
    description = Column(Text, nullable=True)
    # per_person, per_group, per_room, per_vehicle, per_booking
    cost_basis = Column(String(30), nullable=False, default="per_person")
    unit = Column(String(50), nullable=True)  # night, day, trip, entry, transfer
    rate = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)  # per unit, optional

    # Optional accommodation attributes
    room_occupancy = Column(String(30), nullable=True)  # single, double, twin, triple, family
    meal_plan = Column(String(10), nullable=True)  # RO, BB, HB, FB, AI
    capacity = Column(Integer, nullable=True)  # vehicle seats / room capacity
    min_pax = Column(Integer, nullable=True)
    max_pax = Column(Integer, nullable=True)

    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)

    rate_card = relationship("SupplierRateCard", back_populates="items")
