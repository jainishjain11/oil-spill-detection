import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { predictImage } from "../services/api";
import useSessionStore from "../store/sessionStore";
import toast from "react-hot-toast";

export default function UploadZone({ mcRuns, gradcamEnabled, onResults }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const addResult = useSessionStore((s) => s.addResult);

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
      toast.error("Only JPG and PNG images are accepted.");
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
        toast.error(`Failed to process "${file.name}".`);
      }
    }

    setProcessing(false);
    setProcessingIndex(-1);
    onResults(newResults);
    setPendingFiles([]);
  };

  const removePending = (idx) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[idx]?.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${processing ? 'dropzone-disabled' : ''}`}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Radar Background Element */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, var(--mesh-1) 0%, transparent 60%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          animation: 'pulse-dot 4s infinite'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 300, height: 300,
          border: '1px solid var(--border)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: 0.5
        }} />

        <input {...getInputProps()} id="image-upload-input" />
        
        <div style={{
          position: 'relative',
          width: 72, height: 72, borderRadius: '50%',
          background: isDragActive ? 'var(--primary-bg)' : 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isDragActive ? 'var(--primary-bdr)' : 'var(--glass-border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          color: isDragActive ? 'var(--primary)' : 'var(--text-muted)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isDragActive ? 'var(--shadow-glow)' : 'var(--shadow-md)',
          transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
          zIndex: 2
        }}>
          <UploadCloud size={32} />
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          {isDragActive ? (
            <p className="font-outfit" style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
              Drop files to begin scan...
            </p>
          ) : (
            <>
              <p className="font-outfit" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Initialize SAR Analysis
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Drag and drop Sentinel-1 imagery or click to browse
              </p>
            </>
          )}
        </div>
      </div>

      {/* File Previews */}
      {pendingFiles.length > 0 && (
        <div style={{
          background: 'var(--surface-alt)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
            {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected for analysis
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {pendingFiles.map((file, idx) => (
              <div key={file.name + idx} style={{ position: 'relative', width: 64 }}>
                <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden' }}>
                  <img
                    src={file.preview}
                    alt={file.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      opacity: processing && processingIndex !== idx ? 0.5 : 1,
                      border: processingIndex === idx
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border)'
                    }}
                  />
                  
                  {processingIndex === idx && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  )}
                </div>

                {!processing && (
                  <button
                    onClick={() => removePending(idx)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
                
                <p style={{
                  fontSize: 10, color: 'var(--text-muted)', marginTop: 6,
                  textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {file.name}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={processing}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {processing ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 Processing {processingIndex + 1} of {pendingFiles.length}...
               </>
            ) : (
               <>Perform Analysis on {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
