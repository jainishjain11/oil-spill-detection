import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { predictImage } from "../services/api";
import useSessionStore from "../store/sessionStore";
import toast from "react-hot-toast";

/**
 * UploadZone — Ocean-themed drag & drop multi-image uploader.
 * Shows SVG ocean scene with animated waves and file previews.
 */
export default function UploadZone({ mcRuns, gradcamEnabled, onResults }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const addResult = useSessionStore((s) => s.addResult);

  // Revoke object URLs on unmount
  const pendingRef = useRef(pendingFiles);
  pendingRef.current = pendingFiles;
  useEffect(() => {
    return () => {
      pendingRef.current.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error("Only JPG and PNG images are accepted.", { id: "bad-type" });
    }
    const previews = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setPendingFiles(previews);
  }, []);

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
        result._preview = file.preview;
        result.previewUrl = file.preview;
        newResults.push(result);
        addResult(result);
      } catch (err) {
        const msg = err?.response?.data?.detail ||
          `Failed to process "${file.name}". Check backend connection.`;
        toast.error(msg, { duration: 6000 });
      }
    }

    setProcessing(false);
    setProcessingIndex(-1);
    onResults(newResults);

    // Revoke only after results are delivered (ResultPanel needs preview URLs)
    // Don't revoke here — let ResultPanel/HeatmapViewer use them.
    setPendingFiles([]);
  };

  const removePending = (idx) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[idx]?.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          'dropzone',
          isDragActive ? 'dropzone-active' : '',
          processing ? 'dropzone-disabled' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} id="image-upload-input" />

        {/* Ocean SVG scene */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <svg width="220" height="52" viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg"
            style={{ borderRadius: 8, overflow: 'hidden' }}>
            {/* Ocean background */}
            <rect width="220" height="52" fill="var(--ocean-surface)" rx="8" />

            {/* Wave layer 1 (deepest) */}
            <path
              d="M-20 38 Q15 28 50 36 Q85 44 120 34 Q155 24 190 32 Q210 36 240 30 L240 52 L-20 52 Z"
              fill="#00304a"
              opacity="0.7"
              style={{ animation: 'waveShift 4s linear infinite' }}
            />
            {/* Wave layer 2 */}
            <path
              d="M-20 40 Q20 32 55 40 Q90 48 125 38 Q160 28 195 36 Q210 40 240 34 L240 52 L-20 52 Z"
              fill="#005578"
              opacity="0.6"
              style={{ animation: 'waveShift 4s linear infinite 0.8s' }}
            />
            {/* Wave layer 3 (surface) */}
            <path
              d="M-20 44 Q25 37 60 44 Q95 51 130 42 Q165 33 200 41 L240 38 L240 52 L-20 52 Z"
              fill="#0088aa"
              opacity="0.5"
              style={{ animation: 'waveShift 4s linear infinite 1.6s' }}
            />

            {/* Upload icon centered above waves */}
            <g transform="translate(95, 8)">
              <circle cx="15" cy="15" r="13" fill="rgba(0, 212, 255, 0.12)" stroke="var(--cyan-bright)" strokeWidth="1"/>
              <path d="M15 20 L15 10 M11 14 L15 10 L19 14" stroke="var(--cyan-bright)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M10 22 L20 22" stroke="var(--cyan-bright)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </g>
          </svg>
        </div>

        {isDragActive ? (
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan-bright)', fontFamily: 'Inter, sans-serif' }}>
            Release to analyse these images…
          </p>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#a0d4e8', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
              Drop SAR images to analyse
            </p>
            <p style={{ fontSize: 11, color: 'var(--cyan-ghost)', fontFamily: 'Inter, sans-serif' }}>
              Drag & drop or click to browse — JPG, PNG · Sentinel-1 SAR imagery
            </p>
          </>
        )}
      </div>

      {/* File preview strip */}
      {pendingFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--cyan-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>
            {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} queued
          </p>

          {/* File thumbnails strip */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pendingFiles.map((file, idx) => (
              <div key={file.name + idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={file.preview}
                    alt={file.name}
                    style={{
                      width: 40, height: 40,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: processingIndex === idx
                        ? '2px solid var(--cyan-bright)'
                        : '1px solid var(--ocean-border)',
                      display: 'block',
                      boxShadow: processingIndex === idx ? '0 0 8px rgba(0,212,255,0.4)' : 'none',
                    }}
                  />
                  {/* Spinner overlay */}
                  {processingIndex === idx && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(2, 13, 24, 0.7)',
                      borderRadius: 6,
                    }}>
                      <div style={{
                        width: 14, height: 14,
                        border: '2px solid var(--cyan-bright)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                    </div>
                  )}
                  {/* Remove button */}
                  {!processing && (
                    <button
                      onClick={() => removePending(idx)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 16, height: 16,
                        borderRadius: '50%',
                        background: 'var(--spill-red)',
                        border: 'none',
                        color: '#fff',
                        fontSize: 9,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  )}
                </div>
                <span style={{
                  fontSize: 8, color: 'var(--cyan-trace)', fontFamily: 'Inter, sans-serif',
                  maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </span>
              </div>
            ))}
          </div>

          {/* Analyze button */}
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={processing}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', marginTop: 4,
            }}
          >
            {processing ? (
              <>
                <div style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(2,13,24,0.4)',
                  borderTopColor: 'var(--ocean-void)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Analysing {processingIndex + 1} / {pendingFiles.length}…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Analyse {pendingFiles.length} Image{pendingFiles.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
