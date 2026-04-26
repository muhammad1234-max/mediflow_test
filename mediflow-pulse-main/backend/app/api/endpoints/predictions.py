from datetime import datetime, timezone

from fastapi import APIRouter

from ...schemas import schemas
from ...ml.prediction_service import predict_wait_time, predict_patient_load

router = APIRouter()

@router.get("/wait-time", response_model=schemas.Prediction)
def get_wait_time_prediction():
    val = predict_wait_time()
    return {
        "id": "pred-wait-time",
        "type": "wait_time",
        "value": val,
        "timestamp": datetime.now(timezone.utc),
        "meta": {"modelVersion": "stub-v1"},
    }

@router.get("/load", response_model=schemas.Prediction)
def get_load_prediction():
    val = predict_patient_load()
    return {
        "id": "pred-patient-load",
        "type": "patient_load",
        "value": val,
        "timestamp": datetime.now(timezone.utc),
        "meta": {"modelVersion": "stub-v1"},
    }
