# router.py
from fastapi import APIRouter
from typing import Dict
from schemas import FireFeatures
from transforms import transform_and_predict

router = APIRouter()

@router.post("/predict_area")
def predict_area(features: FireFeatures) -> Dict[str, float]:
    #convert pydantic model to dict
    features_dict = features.dict()

    #transform and predict
    predicted_area = transform_and_predict(features_dict)

    return {"predicted_burned_area": predicted_area}
