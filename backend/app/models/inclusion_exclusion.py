from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Association tables for many-to-many relationships
package_inclusions = Table(
    "package_inclusions",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("packages.id"), primary_key=True),
    Column("inclusion_id", Integer, ForeignKey("inclusions.id"), primary_key=True)
)

package_exclusions = Table(
    "package_exclusions",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("packages.id"), primary_key=True),
    Column("exclusion_id", Integer, ForeignKey("exclusions.id"), primary_key=True)
)

group_trip_inclusions = Table(
    "group_trip_inclusions",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id"), primary_key=True),
    Column("inclusion_id", Integer, ForeignKey("inclusions.id"), primary_key=True)
)

group_trip_exclusions = Table(
    "group_trip_exclusions",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id"), primary_key=True),
    Column("exclusion_id", Integer, ForeignKey("exclusions.id"), primary_key=True)
)

class Inclusion(Base):
    __tablename__ = "inclusions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Icon identifier (e.g., "fa-check", "meal", "transport")
    category = Column(String(50), nullable=True)  # Category (e.g., "Meals", "Transportation", "Activities")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    packages = relationship("Package", secondary=package_inclusions, back_populates="inclusion_items")
    group_trips = relationship("GroupTrip", secondary=group_trip_inclusions, back_populates="inclusion_items")

class Exclusion(Base):
    __tablename__ = "exclusions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Icon identifier (e.g., "fa-times", "no-meal", "no-transport")
    category = Column(String(50), nullable=True)  # Category (e.g., "Meals", "Transportation", "Activities")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    packages = relationship("Package", secondary=package_exclusions, back_populates="exclusion_items")
    group_trips = relationship("GroupTrip", secondary=group_trip_exclusions, back_populates="exclusion_items")
