"""
Prediction router — /predict endpoints.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from typing import List
import time

from services.inference import run_inference, is_model_loaded
from models.schemas import PredictionResponse, BatchPredictionResponse

router = APIRouter(prefix="", tags=["Prediction"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"}


def _validate_file(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {file.content_type}. Accepted: jpg, png.",
        )


# ─── Single image ─────────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    mc_runs: int = Form(default=30, ge=5, le=100),
    enable_gradcam: bool = Form(default=True),
):
    """Run inference on a single uploaded image."""
    if not is_model_loaded():
        raise HTTPException(status_code=503, detail="Model is not loaded yet. Try again in a moment.")

    _validate_file(file)

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    try:
        result = run_inference(
            image_bytes=image_bytes,
            filename=file.filename,
            mc_runs=mc_runs,
            enable_gradcam=enable_gradcam,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    return result


# ─── Batch images ─────────────────────────────────────────────────────────────

@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    files: List[UploadFile] = File(...),
    mc_runs: int = Form(default=30, ge=5, le=100),
    enable_gradcam: bool = Form(default=True),
):
    """Run inference on a batch of uploaded images."""
    if not is_model_loaded():
        raise HTTPException(status_code=503, detail="Model is not loaded yet.")

    if not files:
        raise HTTPException(status_code=422, detail="No files uploaded.")

    t_batch_start = time.perf_counter()
    results = []

    for file in files:
        _validate_file(file)
        image_bytes = await file.read()
        if not image_bytes:
            continue
        try:
            result = run_inference(
                image_bytes=image_bytes,
                filename=file.filename,
                mc_runs=mc_runs,
                enable_gradcam=enable_gradcam,
            )
            results.append(result)
        except Exception as e:
            print(f"[WARN] Batch: failed on {file.filename}: {e}")

    t_batch_end = time.perf_counter()
    total_time = round((t_batch_end - t_batch_start) * 1000.0, 1)

    return {
        "results": results,
        "total_processed": len(results),
        "total_time_ms": total_time,
    }


# ─── Health & info ─────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "model_loaded": is_model_loaded()}


@router.get("/model/info")
def model_info():
    return {
        "architecture": "MobileNetV2",
        "mc_dropout": True,
        "gradcam": True,
        "input_shape": [224, 224, 3],
        "classes": ["No Oil Spill", "Oil Spill"],
    }
