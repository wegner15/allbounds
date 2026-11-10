from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Float, ForeignKey, JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class TourQuote(Base):
    __tablename__ = "tour_quotes"

    id = Column(Integer, primary_key=True, index=True)
    quote_number = Column(String(100), unique=True, index=True, nullable=False)  # TQ-2026-0001
    name = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)

    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    client_name = Column(String(255), nullable=True)
    lead_reference = Column(String(100), nullable=True)

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    currency = Column(String(10), nullable=False, default="USD")

    # draft, submitted, approved, rejected, converted
    status = Column(String(30), nullable=False, default="draft", index=True)

    # markup (cost * (1+v/100)) or margin (cost / (1-v/100))
    pricing_method = Column(String(20), nullable=False, default="markup")
    pricing_value = Column(Float, nullable=False, default=20.0)
    contingency_percent = Column(Float, nullable=False, default=0.0)

    tax_enabled = Column(Boolean, nullable=False, default=False)
    tax_name = Column(String(50), nullable=True, default="VAT")
    tax_rate = Column(Float, nullable=False, default=0.0)
    tax_inclusive = Column(Boolean, nullable=False, default=False)

    notes = Column(Text, nullable=True)
    prepared_by = Column(String(255), nullable=True)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    converted_scenario_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    scenarios = relationship("TourQuoteScenario", back_populates="quote", cascade="all, delete-orphan",
                             order_by="TourQuoteScenario.pax")
    days = relationship("TourQuoteDay", back_populates="quote", cascade="all, delete-orphan",
                        order_by="TourQuoteDay.day_number")
    items = relationship("TourQuoteItem", back_populates="quote", cascade="all, delete-orphan",
                         order_by="TourQuoteItem.sort_order")
    discounts = relationship("TourQuoteDiscount", back_populates="quote", cascade="all, delete-orphan")
    client = relationship("Client", foreign_keys=[client_id])


class TourQuoteScenario(Base):
    """One group size to quote (e.g. 2, 4, 10 pax). Rooms and FOC are manual."""
    __tablename__ = "tour_quote_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("tour_quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(100), nullable=True)
    pax = Column(Integer, nullable=False, default=2)
    foc_count = Column(Integer, nullable=False, default=0)
    rooms = Column(Integer, nullable=False, default=1)

    quote = relationship("TourQuote", back_populates="scenarios")


class TourQuoteDay(Base):
    __tablename__ = "tour_quote_days"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("tour_quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    images = Column(JSON, nullable=True, default=list)

    quote = relationship("TourQuote", back_populates="days")


class TourQuoteItem(Base):
    __tablename__ = "tour_quote_items"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("tour_quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=True)  # null = trip-wide cost

    # accommodation, transport, activity, meal, park_fee, guide, flight, visa, insurance, operational, other
    component_type = Column(String(50), nullable=False, default="other")
    description = Column(String(255), nullable=False)
    # per_person, per_group, per_room, per_vehicle, per_booking
    cost_basis = Column(String(30), nullable=False, default="per_person")
    unit_cost = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)  # supplier tax per unit
    qty = Column(Float, nullable=False, default=1.0)  # nights / days / transfers
    capacity = Column(Integer, nullable=True)  # seats per vehicle (per_vehicle)
    image_url = Column(String(500), nullable=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    rate_card_item_id = Column(Integer, ForeignKey("supplier_rate_card_items.id", ondelete="SET NULL"), nullable=True)
    is_optional = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)

    quote = relationship("TourQuote", back_populates="items")


class TourQuoteDiscount(Base):
    __tablename__ = "tour_quote_discounts"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("tour_quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(255), nullable=False)
    # percent (of selling price) or amount
    mode = Column(String(20), nullable=False, default="percent")
    value = Column(Float, nullable=False, default=0.0)
    # total (whole group) or per_person (value x paying pax; amount mode only)
    scope = Column(String(20), nullable=False, default="total")

    quote = relationship("TourQuote", back_populates="discounts")
