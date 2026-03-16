from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, uploads, scan, users, food, web, step

app = FastAPI(title="FitScan API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (prefixes already defined inside each file)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(uploads.router)
app.include_router(scan.router)
app.include_router(food.router)
app.include_router(step.router, tags=["steps"])
app.include_router(web.router)

@app.get("/")
def health():
    return {"status": "ok"}
