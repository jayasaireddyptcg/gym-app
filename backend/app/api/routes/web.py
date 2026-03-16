from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.core.config import settings

router = APIRouter(prefix="/web", tags=["Web"])

# Setup templates
templates = Jinja2Templates(directory="templates")

@router.get("/reset-password")
async def reset_password_page(request: Request, token: str = None):
    """Serve password reset page"""
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    api_url = str(request.base_url).rstrip("/")

    return templates.TemplateResponse(
        "reset_password.html", 
        {
            "request": request,
            "token": token,
            "api_url": api_url
        }
    )
