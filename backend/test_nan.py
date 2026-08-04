import math
import sys
sys.path.append('.')
from pydantic import BaseModel, validator, field_validator

class Item(BaseModel):
    price: float
    discount: float = 0.0

    @field_validator('price', 'discount', mode='before')
    @classmethod
    def clean_nan(cls, v):
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return 0.0
        return v

i = Item(price=float('nan'))
print(i.model_dump())
