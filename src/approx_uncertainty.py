import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image


def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def predict_with_uncertainty(model, img_array, n_iter=20):
    """
    Monte Carlo Dropout Prediction
    """
    predictions = []

    for _ in range(n_iter):
        preds = model(img_array, training=True)  # keep dropout active
        predictions.append(preds.numpy())

    predictions = np.array(predictions)

    mean_pred = predictions.mean(axis=0)
    std_pred = predictions.std(axis=0)

    return mean_pred[0][0], std_pred[0][0]


def run_uncertainty(model, img_path):
    img_array = preprocess_image(img_path)

    mean, std = predict_with_uncertainty(model, img_array)

    print("\n🧠 Approximate Learning Output:")

    # Prediction label
    if mean > 0.5:
        label = "Oil Spill Detected!!"
    else:
        label = "No Oil Spill"

    print(label)
    print(f"Confidence: {mean:.4f}")
    print(f"Uncertainty: {std:.4f}")

    # 🔥 Interpretation (NEW)
    if std < 0.05:
        interpretation = "Low Uncertainty (High Confidence Prediction)"
    elif std < 0.1:
        interpretation = "Moderate Uncertainty"
    else:
        interpretation = "High Uncertainty (Needs Review)"

    print(interpretation)

    # 📁 Save results (NEW)
    os.makedirs("outputs", exist_ok=True)

    with open("outputs/approx_learning_result.txt", "w") as f:
        f.write("Approximate Learning Output\n")
        f.write(f"Prediction: {label}\n")
        f.write(f"Confidence: {mean:.4f}\n")
        f.write(f"Uncertainty: {std:.4f}\n")
        f.write(f"Interpretation: {interpretation}\n")

    print("\n📁 Results saved to outputs/approx_learning_result.txt")