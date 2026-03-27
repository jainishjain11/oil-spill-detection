# 🌊 Advanced Oil Spill Detection using Transfer Learning & Approximate Learning

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange.svg)](https://tensorflow.org)

## 📌 Overview
Oil spills are a major environmental hazard affecting marine ecosystems and economic activities. Detecting them from satellite imagery is challenging due to speckle noise, varying weather conditions, and "look-alike" patterns (e.g., biogenic films) in Synthetic Aperture Radar (SAR) images.

This project presents an **AI-powered oil spill detection system** that integrates deep learning efficiency with uncertainty estimation and interpretability.

---

## 🚀 Key Features

### 🔹 Transfer Learning
* **Architecture:** Utilizes a pre-trained **MobileNetV2** backbone for efficient feature extraction.
* **Fine-tuning:** Custom top layers optimized specifically for SAR image classification.

### 🔹 Approximate Learning (Uncertainty Estimation)
* **Monte Carlo Dropout:** Unlike standard "point-estimate" models, this system performs multiple forward passes with dropout enabled at inference time.
* **Metrics:** Provides both a **Prediction Confidence** score and an **Uncertainty Score**, helping operators identify cases where the AI is "unsure."

### 🔹 Explainable AI (XAI)
* **Grad-CAM:** Generates visual heatmaps to highlight the specific regions in the SAR image that triggered an "Oil Spill" classification, ensuring the model isn't focusing on noise.

---

## 🛰️ Dataset
* **Source:** Sentinel-1 SAR imagery.
* **Structure:**
    ```text
    data/raw/
    ├── 0/  (No Oil Spill)
    └── 1/  (Oil Spill)
    ```
> [!IMPORTANT]  
> The dataset is not included in this repository due to size constraints and licensing.

---

## 🏗️ Project Structure
```bash
src/
├── data_loader.py         # Image preprocessing and augmentation
├── model.py                # MobileNetV2 + Dropout architecture
├── transfer_train.py       # Training and fine-tuning scripts
├── transfer_evaluate.py    # Performance metric calculations
├── visualization.py        # Graphing and plotting utilities
├── approx_uncertainty.py   # Monte Carlo Dropout logic
├── gradcam.py              # XAI heatmap generation
main.py                     # Entry point for the pipeline

## 📊 Results & Outputs

The system achieves high-reliability metrics optimized for environmental monitoring, specifically focusing on reducing missed detections.

| Metric | Value |
| :--- | :--- |
| **Accuracy** | ~93% |
| **Precision** | 91% |
| **Recall (Oil Spill)** | 95% (Critical for disaster response) |
| **F1-Score** | 93% |
```

### 📈 Generated Visualizations
The pipeline automatically exports the following to the `outputs/` directory:
* **Training History:** Loss and Accuracy curves to monitor convergence.
* **Confusion Matrix:** Detailed breakdown of True Positives vs. False Positives (Look-alikes).
* **Grad-CAM Heatmaps:** Spatial verification showing *where* the model is looking.
* **Uncertainty Histograms:** Distribution of predictive variance across the test set.

---

## ⚙️ Installation & Usage

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/oil-spill-detection.git](https://github.com/your-username/oil-spill-detection.git)
cd oil-spill-detection
```

### 2. Setup Environment
```bash
python -m venv venv
# Activate on Windows:
venv\Scripts\activate   
# Activate on macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run the Pipeline
Execute the main script to train, evaluate, and visualize the model.
```bash
python main.py
```

---
### 🧠 Sample Prediction Output

When running a prediction on a new SAR image, the system provides both the classification and the uncertainty analysis:

```text
[INFO] Processing Image: SAR_S1_9234.png
----------------------------------------
Classification: Oil Spill Detected
Confidence:     0.985
Uncertainty:    0.015 (Low)
----------------------------------------
[VISUAL] Grad-CAM heatmap saved to ./outputs/gc_9234.png
```
## 🔬 Technologies Used

* **Python:** Core programming language.
* **TensorFlow / Keras:** Model architecture (**MobileNetV2**) and training.
* **OpenCV:** Image preprocessing and SAR speckle filtering.
* **NumPy & Pandas:** Data manipulation and matrix operations.
* **Matplotlib & Seaborn:** Performance visualization and confusion matrices.

---
## 🌐 Deployement
  **Streamlit Web App Deployment:** Created an interactive dashboard for image uploads which shows Confidence level and matrix
---
## 🚀 Future Work

* 🛰️ **Real-time Satellite Integration:** Fetching live data via the **Copernicus API**.
* 🧠 **Advanced Architectures:** Comparative testing with **ResNet-50** and **EfficientNet-B0**.
* 🧩 **Image Segmentation:** Implementing **U-Net** for precise, pixel-level spill mapping.
* 📡 **Automated Monitoring System:** Setting up an automated alert system for specific maritime coordinates.

---

## 🎯 Key Highlights

* **Reliability:** Combines high accuracy with uncertainty awareness to flag "borderline" cases.
* **Specialized:** Specifically tuned to handle the complexities of SAR "look-alikes."
* **Transparent:** Provides **Explainable AI (XAI)** outputs via **Grad-CAM** to build user trust.
* **Efficient:** Designed for real-world scalability using lightweight backbones.

---

> **Note:** This project is part of a research initiative to improve environmental disaster response times using modern AI techniques.
