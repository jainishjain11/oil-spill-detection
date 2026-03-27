import sys
import os

# Fix import path
sys.path.append(os.path.abspath("src"))

from data_loader import get_data_generators
from model import build_model
from transfer_train import train_model
from transfer_evaluate import evaluate_model
from visualization import plot_metrics, plot_confusion_matrix
from approx_uncertainty import run_uncertainty
from tensorflow.keras.models import load_model
from gradcam import run_gradcam

# Paths
DATA_PATH = "data/raw/"
MODEL_PATH = "models/oil_spill_mobilenetv2.h5"
TEST_IMAGE = "test.jpg"

print("🚀 Starting Pipeline...")

# Step 1: Load data
train_gen, val_gen = get_data_generators(DATA_PATH)

# Step 2: Load or Train model
if os.path.exists(MODEL_PATH):
    print("📦 Loading existing model...")
    model = load_model(MODEL_PATH)
else:
    print("⚡ Training new model...")
    model = build_model()
    train_model(model, train_gen, val_gen)

# Step 3: Transfer Learning Evaluation (IMPORTANT FIX)
report, accuracy, y_true, y_pred = evaluate_model(model, val_gen)

# Step 4: Visualization (Graphs)
plot_metrics(report, accuracy, y_true, y_pred)

# Step 5: Confusion Matrix
plot_confusion_matrix(y_true, y_pred)

# Step 6: Approximate Learning (MC Dropout)
run_uncertainty(model, TEST_IMAGE)

# Step 7: Grad-CAM Visualization
run_gradcam(model, TEST_IMAGE)

print("✅ Pipeline Completed!")