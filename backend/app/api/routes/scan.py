from fastapi import APIRouter
from app.services.scan_service import scan_equipment

router = APIRouter()

@router.post("/equipment")
def scan(req: dict):
    return scan_equipment(req["image_key"])
