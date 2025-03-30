# schemas.py
from pydantic import BaseModel

class FireFeatures(BaseModel):
    X: float
    Y: float
    month: str
    day: str
    temp: float
    RH: float
    wind: float
    rain: float
