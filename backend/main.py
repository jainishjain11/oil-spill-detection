"""
FastAPI application entry point.
Model is loaded once during the lifespan startup event.
"""

import sys
import os

# Ensure backend/ subpackages are importable when uvicorn is launched
# from the project root (python -m uvicorn backend.main:app) OR from
# inside backend/ (uvicorn main:app).
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.inference import load_model_once
from routes.predict import router as predict_router


# ─── Lifespan: load model once at startup ─────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model when the server starts."""
    print("[STARTUP] Loading ML model...")
    load_model_once()
    print("[STARTUP] Model ready. Server is live.")
    yield
    print("[SHUTDOWN] Server shutting down.")


# ─── App factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Oil Spill Detection API",
    description=(
        "FastAPI backend wrapping MobileNetV2 + Monte Carlo Dropout + Grad-CAM "
        "for SAR satellite image oil spill detection."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(predict_router)


# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "Oil Spill Detection API is running.",
        "docs": "/docs",
        "health": "/health",
    }
