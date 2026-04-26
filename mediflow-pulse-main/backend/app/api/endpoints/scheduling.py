from fastapi import APIRouter
from ...schemas import schemas
from ...agents.scheduling_agent import run_optimization

router = APIRouter()

@router.post("/optimize", response_model=schemas.OptimizationResponse)
def post_optimize(req: schemas.OptimizationRequest):
    return run_optimization(req.windowHoursAhead)

@router.post("/reassign")
def post_reassign(params: dict):
    # logic for reassigning specific appointments
    return {"success": True, "message": "Reassignment queued"}
