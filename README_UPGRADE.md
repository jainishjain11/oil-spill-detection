# 🚀 Oil Spill Detection — Full-Stack Upgrade

This replaces the Streamlit monolith (`app.py`) with a decoupled:
- **FastAPI** backend wrapping all ML inference logic  
- **React + Vite** frontend dashboard

The original `app.py`, `main.py`, `src/`, and trained model are **untouched**.

---

## 🏗️ New Project Structure

```
oil-spill-detection/
├── backend/               ← NEW FastAPI backend
│   ├── main.py            ← FastAPI entry point
│   ├── routes/predict.py  ← API endpoints
│   ├── services/inference.py ← ML inference wrapper
│   ├── models/schemas.py  ← Pydantic schemas
│   └── requirements.txt
├── frontend/              ← NEW React + Vite frontend
│   ├── src/
│   │   ├── components/    ← UI components
│   │   ├── pages/         ← Dashboard page
│   │   ├── hooks/         ← usePrediction React Query hook
│   │   ├── services/      ← Axios API service
│   │   └── store/         ← Zustand session store
│   └── package.json
├── src/                   ← UNTOUCHED (ML modules)
├── models/                ← UNTOUCHED (trained weights)
├── app.py                 ← KEPT (legacy Streamlit)
└── main.py                ← UNTOUCHED (training pipeline)
```

---

## ⚙️ Prerequisites

- Python ≥ 3.8 with the existing project `venv` activated
- Node.js ≥ 18 + npm

---

## 🐍 Backend Setup

```bash
# From the root oil-spill-detection/ directory
# Activate the existing venv first:
venv\Scripts\activate

# Install backend deps (FastAPI, uvicorn, etc.)
pip install fastapi uvicorn[standard] python-multipart

# Start the API server:
cd backend
uvicorn main:app --reload --port 8000
```

> The model loads automatically at startup (~10–20 seconds). Check the terminal for `[STARTUP] Model ready.`

---

## ⚛️ Frontend Setup

```bash
# From the root oil-spill-detection/ directory
cd frontend

# (Already done — packages installed)
npm run dev
```

---

## 🌐 Service URLs

| Service | URL |
|---|---|
| **React Dashboard** | http://localhost:5173 |
| **API documentation** (Swagger UI) | http://localhost:8000/docs |
| **API health check** | http://localhost:8000/health |
| **Model info** | http://localhost:8000/model/info |

---

## 📡 API Reference

### `POST /predict`
Single image inference.

**Form data:**
| Field | Type | Default | Notes |
|---|---|---|---|
| `file` | File | — | JPG or PNG |
| `mc_runs` | int | 30 | Range 5–100 |
| `enable_gradcam` | bool | true | |

**Response:**
```json
{
  "filename": "sar_image.jpg",
  "prediction": "Oil Spill",
  "confidence": 94.2,
  "uncertainty": 0.0312,
  "gradcam_image": "<base64 PNG>",
  "processing_time_ms": 1240.5,
  "timestamp": "2026-04-18T00:00:00+00:00"
}
```

### `POST /predict/batch`
Multiple images in one request — same params, returns `{ results: [...], total_processed, total_time_ms }`.

### `GET /health`
```json
{ "status": "ok", "model_loaded": true }
```

### `GET /model/info`
```json
{ "architecture": "MobileNetV2", "mc_dropout": true, "gradcam": true, "input_shape": [224, 224, 3], "classes": ["No Oil Spill", "Oil Spill"] }
```

---

## 🖥️ Frontend Features

| Feature | Details |
|---|---|
| Drag & drop upload | Multi-file, JPG/PNG, sequential processing |
| MC Runs slider | 5–100, debounced 500ms |
| Grad-CAM toggle | Toggle heatmap generation on/off |
| Result cards | Confidence ring, uncertainty badge, processing time |
| Grad-CAM viewer | Desktop: side-by-side; Mobile: toggled |
| Session history | Sortable table, color-coded, CSV export |
| Health indicator | Header pill shows live backend status |

---

## 🔧 Tech Stack

| Layer | Tech |
|---|---|
| ML backend | TensorFlow / Keras, MobileNetV2, Monte Carlo Dropout, Grad-CAM |
| API | FastAPI, Uvicorn, Python-Multipart, Pydantic v2 |
| Frontend | React 18, Vite, Tailwind CSS v3 |
| State | Zustand (session history) |
| Data fetching | @tanstack/react-query v5 |
| HTTP | Axios |
| Upload | react-dropzone |
| Toasts | react-hot-toast |

---

> Built by Jainish Jain & Yashodhan Singh Rathore
