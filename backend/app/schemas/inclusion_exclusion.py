from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base Inclusion Schema
class InclusionBase(BaseModel):
    name: str = Field(..., description="Name of the inclusion", example="Airport Transfer")
    description: Optional[str] = Field(None, description="Detailed description of the inclusion")
    icon: Optional[str] = Field(None, description="Icon identifier for the inclusion", example="fa-car")
    category: Optional[str] = Field(None, description="Category of the inclusion", example="Transportation")

# Schema for creating a new Inclusion
class InclusionCreate(InclusionBase):
    pass

# Schema for updating an Inclusion
class InclusionUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the inclusion")
    description: Optional[str] = Field(None, description="Detailed description of the inclusion")
    icon: Optional[str] = Field(None, description="Icon identifier for the inclusion")
    category: Optional[str] = Field(None, description="Category of the inclusion")
    is_active: Optional[bool] = Field(None, description="Whether the inclusion is active")

# Schema for Inclusion response
class InclusionResponse(InclusionBase):
    id: int
    is_active: bool = Field(..., description="Whether the inclusion is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Base Exclusion Schema
class ExclusionBase(BaseModel):
    name: str = Field(..., description="Name of the exclusion", example="International Flights")
    description: Optional[str] = Field(None, description="Detailed description of the exclusion")
    icon: Optional[str] = Field(None, description="Icon identifier for the exclusion", example="fa-plane")
    category: Optional[str] = Field(None, description="Category of the exclusion", example="Transportation")

# Schema for creating a new Exclusion
class ExclusionCreate(ExclusionBase):
    pass

# Schema for updating an Exclusion
class ExclusionUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the exclusion")
    description: Optional[str] = Field(None, description="Detailed description of the exclusion")
    icon: Optional[str] = Field(None, description="Icon identifier for the exclusion")
    category: Optional[str] = Field(None, description="Category of the exclusion")
    is_active: Optional[bool] = Field(None, description="Whether the exclusion is active")

# Schema for Exclusion response
class ExclusionResponse(ExclusionBase):
    id: int
    is_active: bool = Field(..., description="Whether the exclusion is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schema for a list of Inclusions
class InclusionList(BaseModel):
    inclusions: List[InclusionResponse]
    
# Schema for a list of Exclusions
class ExclusionList(BaseModel):
    exclusions: List[ExclusionResponse]
