import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — MC Dropout with 100 runs can be slow
});

/**
 * POST /predict — single image
 * @param {File} file
 * @param {number} mcRuns  5-100
 * @param {boolean} enableGradcam
 * @returns {Promise<PredictionResponse>}
 */
export async function predictImage(file, mcRuns = 30, enableGradcam = true) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mc_runs", String(mcRuns));
  formData.append("enable_gradcam", String(enableGradcam));

  const { data } = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * POST /predict/batch — multiple images
 * @param {File[]} files
 * @param {number} mcRuns
 * @param {boolean} enableGradcam
 * @returns {Promise<BatchPredictionResponse>}
 */
export async function predictBatch(files, mcRuns = 30, enableGradcam = true) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.append("mc_runs", String(mcRuns));
  formData.append("enable_gradcam", String(enableGradcam));

  const { data } = await api.post("/predict/batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * GET /health
 */
export async function fetchHealth() {
  const { data } = await api.get("/health");
  return data;
}

/**
 * GET /model/info
 */
export async function fetchModelInfo() {
  const { data } = await api.get("/model/info");
  return data;
}

export default api;
