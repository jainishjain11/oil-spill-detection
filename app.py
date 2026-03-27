import streamlit as st
import numpy as np
import pandas as pd
from PIL import Image
import os
import sys
from datetime import datetime

# Fix import path
sys.path.append(os.path.abspath("src"))

from tensorflow.keras.models import load_model
from approx_uncertainty import predict_with_uncertainty
from gradcam import generate_gradcam

# -------------------------
# CONFIG
# -------------------------
st.set_page_config(
    page_title="Oil Spill AI",
    layout="wide",
    page_icon="🛢️"
)

MODEL_PATH = "models/oil_spill_mobilenetv2.h5"

# -------------------------
# LOAD MODEL (CACHE)
# -------------------------
@st.cache_resource
def load_my_model():
    return load_model(MODEL_PATH)

model = load_my_model()

# -------------------------
# CUSTOM UI (DARK THEME)
# -------------------------
st.markdown("""
<style>
.stApp {
    background: linear-gradient(135deg, #0b0f19, #111827);
    color: white;
}
.block-container {
    padding-top: 2rem;
}
.card {
    background: #111827;
    padding: 15px;
    border-radius: 15px;
    border: 1px solid #1f2937;
    margin-bottom: 10px;
}
.metric {
    font-size: 14px;
    color: #9ca3af;
}
.big {
    font-size: 18px;
    font-weight: bold;
}
</style>
""", unsafe_allow_html=True)

# -------------------------
# HEADER
# -------------------------
st.title("🛰️ Advanced Oil Spill Detection using Satellite Images")
st.caption("Transfer Learning + Approximate Learning (MC Dropout) + Explainability")

# SIDEBAR
st.sidebar.header("⚙️ Controls")

mc_runs = st.sidebar.slider("MC Dropout Runs", 5, 100, 30)
show_gradcam = st.sidebar.checkbox("Enable Grad-CAM", value=True)

uploaded_files = st.sidebar.file_uploader(
    "Upload Images",
    type=["jpg", "png", "jpeg"],
    accept_multiple_files=True
)

# HISTORY STORAGE
if "history" not in st.session_state:
    st.session_state.history = []

# MAIN UI
if uploaded_files:

    st.subheader("📊 Analysis Results")

    cols = st.columns(3)

    for idx, file in enumerate(uploaded_files):

        image = Image.open(file).resize((224, 224))

        label, conf, uncert = predict_with_uncertainty(
            model,
            image,
            mc_runs=mc_runs
        )

        # Save history
        st.session_state.history.append({
            "time": datetime.now().strftime("%H:%M:%S"),
            "file": file.name,
            "prediction": label,
            "confidence": round(conf, 3),
            "uncertainty": round(uncert, 4)
        })

        with cols[idx % 3]:

            st.image(image, use_container_width=True)

            # RESULT CARD
            st.markdown(f"""
            <div class="card">
                <div class="big">Prediction: {label}</div>
                <div class="metric">Confidence: {conf:.3f}</div>
                <div class="metric">Uncertainty: {uncert:.4f}</div>
            </div>
            """, unsafe_allow_html=True)

            # Grad-CAM
            if show_gradcam:
                heatmap = generate_gradcam(model, image)
                st.image(heatmap, caption="Grad-CAM", use_container_width=True)

else:
    st.info("👈 Upload images from sidebar to start analysis")

# HISTORY TABLE
if st.session_state.history:

    st.subheader("📜 Prediction History")

    df = pd.DataFrame(st.session_state.history)
    st.dataframe(df, use_container_width=True)

    # Download CSV
    csv = df.to_csv(index=False).encode("utf-8")

    st.download_button(
        "📥 Download Results",
        data=csv,
        file_name="results.csv",
        mime="text/csv"
    )

# FOOTER
st.markdown("---")
st.caption("Built by Jainish Jain and Yashodhan Singh Rathore")