"""
Inference service — wraps src/ ML modules.
Loads model once at startup via lifespan context manager.
"""

import os
import sys
import time
import base64
import io
from datetime import datetime, timezone

import numpy as np
from PIL import Image
import cv2

# ─── Add src/ to Python path ──────────────────────────────────────────────────
SRC_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "src"))
sys.path.insert(0, SRC_PATH)

from approx_uncertainty import predict_with_uncertainty  # noqa: E402
from gradcam import generate_gradcam  # noqa: E402

# ─── Model singleton ──────────────────────────────────────────────────────────
_model = None
MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "models", "oil_spill_mobilenetv2.h5")
)


def load_model_once():
    """Load the Keras model into the module-level singleton."""
    global _model
    if _model is not None:
        return _model

    from tensorflow.keras.models import load_model  # lazy import for speed

    print(f"[INFO] Loading model from: {MODEL_PATH}")
    _model = load_model(MODEL_PATH)
    print("[INFO] Model loaded successfully.")
    return _model


def get_model():
    return _model


def is_model_loaded() -> bool:
    return _model is not None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _bytes_to_pil(image_bytes: bytes) -> Image.Image:
    """Convert raw bytes (from UploadFile.read()) to a PIL RGB image."""
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return pil_img


def _numpy_bgr_to_base64_png(img_bgr: np.ndarray) -> str:
    """
    Convert a BGR OpenCV uint8 array → PNG bytes → base64 string.
    generate_gradcam() from src/gradcam.py returns BGR, so we flip to RGB first.
    """
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


# ─── Main inference function ───────────────────────────────────────────────────

def run_inference(
    image_bytes: bytes,
    filename: str,
    mc_runs: int = 30,
    enable_gradcam: bool = True,
) -> dict:
    """
    Full inference pipeline for one uploaded image.

    Returns a dict matching PredictionResponse schema.
    """
    model = get_model()
    if model is None:
        raise RuntimeError("Model is not loaded. Cannot run inference.")

    t_start = time.perf_counter()

    # 1. Decode image
    pil_img = _bytes_to_pil(image_bytes)

    # 2. MC Dropout prediction
    #    predict_with_uncertainty returns: (label, mean_pred, std_pred)
    #    - label: "Oil Spill" | "No Oil Spill"
    #    - mean_pred: raw sigmoid output [0, 1]   (>0.5 = Oil Spill)
    #    - std_pred:  standard deviation across mc_runs
    label, mean_pred, std_pred = predict_with_uncertainty(
        model, pil_img, mc_runs=mc_runs, is_path=False
    )

    # 3. Confidence is how sure the model is about the DISPLAYED label
    if mean_pred > 0.5:
        confidence = float(mean_pred) * 100.0        # Oil Spill certainty
    else:
        confidence = (1.0 - float(mean_pred)) * 100.0  # No Spill certainty

    uncertainty = float(std_pred)

    # 4. Grad-CAM (optional)
    gradcam_b64 = None
    if enable_gradcam:
        try:
            heatmap_bgr = generate_gradcam(model, pil_img)   # returns BGR np array
            gradcam_b64 = _numpy_bgr_to_base64_png(heatmap_bgr)
        except Exception as e:
            print(f"[WARN] Grad-CAM failed for {filename}: {e}")
            gradcam_b64 = None

    t_end = time.perf_counter()
    processing_time_ms = (t_end - t_start) * 1000.0

    return {
        "filename": filename,
        "prediction": label,
        "confidence": round(confidence, 2),
        "uncertainty": round(uncertainty, 4),
        "gradcam_image": gradcam_b64,
        "processing_time_ms": round(processing_time_ms, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
