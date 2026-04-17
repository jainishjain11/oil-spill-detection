from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PredictionResponse(BaseModel):
    filename: str
    prediction: str  # "Oil Spill" | "No Oil Spill"
    confidence: float = Field(..., description="Confidence percentage 0-100")
    uncertainty: float = Field(..., description="MC Dropout std deviation")
    gradcam_image: Optional[str] = Field(
        None, description="Base64-encoded PNG of the Grad-CAM overlay"
    )
    processing_time_ms: float
    timestamp: str


class BatchPredictionResponse(BaseModel):
    results: list[PredictionResponse]
    total_processed: int
    total_time_ms: float


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ModelInfoResponse(BaseModel):
    architecture: str
    mc_dropout: bool
    gradcam: bool
    input_shape: list[int]
    classes: list[str]
