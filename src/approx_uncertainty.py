import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image


# PREPROCESS (FROM PATH)
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# PREPROCESS (FROM PIL IMAGE - STREAMLIT)
def preprocess_pil_image(pil_img):
    img = pil_img.resize((224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# ✅ UPDATED MC DROPOUT FUNCTION
def predict_with_uncertainty(model, input_data, mc_runs=30, is_path=False):
    """
    Works for BOTH:
    - Streamlit (PIL Image)
    - Script (image path)
    """

    print("🔥 Updated uncertainty function loaded")  # Debug line

    # Select preprocessing
    if is_path:
        img_array = preprocess_image(input_data)
    else:
        img_array = preprocess_pil_image(input_data)

    predictions = []

    # Monte Carlo Dropout
    for _ in range(mc_runs):
        preds = model(img_array, training=True)  # keep dropout ON
        predictions.append(preds.numpy()[0][0])

    predictions = np.array(predictions)

    mean_pred = predictions.mean()
    std_pred = predictions.std()

    # Label
    if mean_pred > 0.5:
        label = "Oil Spill"
    else:
        label = "No Oil Spill"

    return label, float(mean_pred), float(std_pred)

# SCRIPT MODE FUNCTION
def run_uncertainty(model, img_path):

    label, mean, std = predict_with_uncertainty(
        model,
        img_path,
        mc_runs=30,
        is_path=True
    )

    print("\n🧠 Approximate Learning Output:")
    print(label)
    print(f"Confidence: {mean:.4f}")
    print(f"Uncertainty: {std:.4f}")

    # Interpretation
    if std < 0.05:
        interpretation = "Low Uncertainty (High Confidence Prediction)"
    elif std < 0.1:
        interpretation = "Moderate Uncertainty"
    else:
        interpretation = "High Uncertainty (Needs Review)"

    print(interpretation)

    # Save results
    os.makedirs("outputs", exist_ok=True)

    with open("outputs/approx_learning_result.txt", "w", encoding="utf-8") as f:
        f.write("Approximate Learning Output\n")
        f.write(f"Prediction: {label}\n")
        f.write(f"Confidence: {mean:.4f}\n")
        f.write(f"Uncertainty: {std:.4f}\n")
        f.write(f"Interpretation: {interpretation}\n")

    print("\n📁 Results saved to outputs/approx_learning_result.txt")