import streamlit as st
import numpy as np
import cv2
import os
from tensorflow.keras.models import load_model
from PIL import Image
import sys

# Fix path
sys.path.append(os.path.abspath("src"))

from approx_uncertainty import predict_with_uncertainty
from gradcam import make_gradcam_heatmap

# Load model
MODEL_PATH = "models/oil_spill_mobilenetv2.h5"
model = load_model(MODEL_PATH)

st.set_page_config(page_title="Oil Spill Detection", layout="centered")

st.title("🌊 Oil Spill Detection System")
st.write("Upload a SAR image to detect oil spill using AI")

# Upload image
uploaded_file = st.file_uploader("Upload Image", type=["jpg", "png", "jpeg"])

if uploaded_file is not None:
    # Show image
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)

    # Convert image
    img = np.array(image)
    img_resized = cv2.resize(img, (224, 224))
    img_resized = img_resized / 255.0
    img_input = np.expand_dims(img_resized, axis=0)

    # 🔥 Prediction with uncertainty
    mean_pred, uncertainty = predict_with_uncertainty(model, img_input)

    label = "🛢️ Oil Spill Detected" if mean_pred > 0.5 else "🌊 No Oil Spill"
    confidence = float(mean_pred)

    st.subheader("🔍 Prediction Result")
    st.write(label)
    st.write(f"Confidence: {confidence:.4f}")
    st.write(f"Uncertainty: {uncertainty:.4f}")

    # Interpretation
    if uncertainty < 0.02:
        st.success("🟢 Low Uncertainty (High Confidence)")
    elif uncertainty < 0.05:
        st.warning("🟡 Moderate Uncertainty")
    else:
        st.error("🔴 High Uncertainty (Unreliable Prediction)")

    # 🔥 Grad-CAM
    st.subheader("🔥 Model Attention (Grad-CAM)")

    heatmap = make_gradcam_heatmap(img_input, model, "Conv_1")  # last conv layer name

    heatmap = cv2.resize(heatmap, (image.size[0], image.size[1]))
    heatmap = np.uint8(255 * heatmap)

    superimposed_img = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    superimposed_img = cv2.addWeighted(np.array(image), 0.6, superimposed_img, 0.4, 0)

    st.image(superimposed_img, caption="Grad-CAM Heatmap", use_column_width=True)