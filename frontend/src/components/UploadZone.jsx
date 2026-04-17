import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { predictImage } from "../services/api";
import useSessionStore from "../store/sessionStore";
import toast from "react-hot-toast";

/**
 * UploadZone — Drag & drop multi-image uploader.
 * Processes files sequentially, showing per-file loading state.
 */
export default function UploadZone({ mcRuns, gradcamEnabled, onResults }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const addResult = useSessionStore((s) => s.addResult);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error("Only JPG and PNG images are accepted.", { id: "bad-type" });
      }

      const previews = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      setPendingFiles(previews);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    multiple: true,
    disabled: processing,
  });

  const handleAnalyze = async () => {
    if (pendingFiles.length === 0) return;
    setProcessing(true);

    const newResults = [];

    for (let i = 0; i < pendingFiles.length; i++) {
      setProcessingIndex(i);
      const file = pendingFiles[i];
      try {
        const result = await predictImage(file, mcRuns, gradcamEnabled);
        result._preview = file.preview; // attach preview for display
        newResults.push(result);
        addResult(result);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          `Failed to process "${file.name}". Check backend connection.`;
        toast.error(msg, { duration: 6000 });
      }
    }

    setProcessing(false);
    setProcessingIndex(-1);
    onResults(newResults);

    // Revoke object URLs
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setPendingFiles([]);
  };

  const removePending = (idx) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[idx]?.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive ? "dropzone-active" : "border-border hover:border-accent/50 hover:bg-surface-2/30"}
          ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} id="image-upload-input" />

        {/* Animated icon */}
        <div className={`text-5xl mb-3 transition-transform duration-300 ${isDragActive ? "scale-110" : ""}`}>
          🛰️
        </div>

        {isDragActive ? (
          <p className="text-accent font-semibold text-lg">Drop your SAR images here…</p>
        ) : (
          <>
            <p className="text-slate-300 font-semibold text-base">
              Drag & drop SAR images
            </p>
            <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            <p className="text-slate-600 text-xs mt-2">Supports: JPG, PNG</p>
          </>
        )}
      </div>

      {/* File previews */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} ready
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {pendingFiles.map((file, idx) => (
              <div key={file.name + idx} className="relative group">
                <img
                  src={file.preview}
                  alt={file.name}
                  className={`w-full h-20 object-cover rounded-lg border
                    ${processingIndex === idx
                      ? "border-accent ring-2 ring-accent/50"
                      : "border-border"}`}
                />
                {/* Processing spinner overlay */}
                {processingIndex === idx && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {/* Remove button */}
                {!processing && (
                  <button
                    onClick={() => removePending(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                )}
                <p className="text-[9px] text-slate-500 truncate mt-0.5 px-0.5">{file.name}</p>
              </div>
            ))}
          </div>

          {/* Analyze button */}
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={processing}
            className={`btn-primary flex items-center justify-center gap-2 mt-1
              ${processing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing {processingIndex + 1} / {pendingFiles.length}…
              </>
            ) : (
              <>
                🔍 Analyze {pendingFiles.length} Image{pendingFiles.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
