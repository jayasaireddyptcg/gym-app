from pydantic import BaseModel
from typing import List

class ScanRequest(BaseModel):
    image_key: str

class Equipment(BaseModel):
    name: str
    confidence: float
    muscles: List[str]
    description: str

class ScanResponse(BaseModel):
    equipment: Equipment
