"use client";

import { UploadCloud } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

type FileStatus = "idle" | "dragging" | "uploading" | "error";

interface FileError {
  message: string;
  code: string;
}

interface FileUploadProps {
  onFileReady?: (file: File) => void;
  onUploadError?: (error: FileError) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
  label?: string;
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_SIZES = ["Bytes", "KB", "MB", "GB"] as const;

function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = FILE_SIZES[i] || FILE_SIZES[FILE_SIZES.length - 1];
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${unit}`;
}

/* ── Upload Illustration (animated SVG) ─────────────────────────────── */
function UploadIllustration() {
  return (
    <div style={{ position: "relative", width: "64px", height: "64px" }}>
      <svg
        aria-label="Upload illustration"
        style={{ width: "100%", height: "100%" }}
        fill="none"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Upload File Illustration</title>
        <circle
          cx="50" cy="50" r="45"
          stroke="var(--mist-line)"
          strokeDasharray="4 4" strokeWidth="2"
        >
          <animateTransform
            attributeName="transform" dur="60s" from="0 50 50"
            repeatCount="indefinite" to="360 50 50" type="rotate"
          />
        </circle>
        <path
          d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
          fill="var(--orange-tint)" stroke="var(--orange)" strokeWidth="2"
        >
          <animate
            attributeName="d" dur="2s" repeatCount="indefinite"
            values="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z;M30 38H70C75 38 75 43 75 43V68C75 73 70 73 70 73H30C25 73 25 68 25 68V43C25 38 30 38 30 38Z;M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
          />
        </path>
        <path
          d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
          fill="none" stroke="var(--orange)" strokeWidth="2"
        />
        <g style={{ transform: "translateY(2px)" }}>
          <line
            x1="50" x2="50" y1="45" y2="60"
            stroke="var(--orange)" strokeLinecap="round" strokeWidth="2"
          >
            <animate attributeName="y2" dur="2s" repeatCount="indefinite" values="60;55;60" />
          </line>
          <polyline
            points="42,52 50,45 58,52"
            fill="none" stroke="var(--orange)"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          >
            <animate
              attributeName="points" dur="2s" repeatCount="indefinite"
              values="42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52"
            />
          </polyline>
        </g>
      </svg>
    </div>
  );
}

/* ── Uploading Animation ────────────────────────────────────────────── */
function UploadingAnimation({ progress }: { progress: number }) {
  return (
    <div style={{ position: "relative", width: "64px", height: "64px" }}>
      <svg
        style={{ width: "100%", height: "100%" }}
        fill="none" viewBox="0 0 240 240"
      >
        <title>Upload Progress</title>
        <defs>
          <mask id="progress-mask">
            <rect fill="black" height="240" width="240" />
            <circle
              cx="120" cy="120" fill="white" r="120"
              strokeDasharray={`${(progress / 100) * 754}, 754`}
              transform="rotate(-90 120 120)"
            />
          </mask>
        </defs>
        <style>{`
          @keyframes lg-rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes lg-rotate-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          .lg-spin circle { transform-origin: 120px 120px; }
          .lg-spin circle:nth-child(odd) { animation: lg-rotate-cw 8s linear infinite; }
          .lg-spin circle:nth-child(even) { animation: lg-rotate-ccw 8s linear infinite; }
        `}</style>
        <g className="lg-spin" mask="url(#progress-mask)" strokeDasharray="18% 40%" strokeWidth="10">
          <circle cx="120" cy="120" r="110" stroke="var(--orange)" opacity="0.95" />
          <circle cx="120" cy="120" r="95" stroke="var(--teal)" opacity="0.95" />
          <circle cx="120" cy="120" r="80" stroke="var(--orange)" opacity="0.7" />
          <circle cx="120" cy="120" r="65" stroke="var(--teal)" opacity="0.7" />
          <circle cx="120" cy="120" r="50" stroke="var(--orange)" opacity="0.5" />
          <circle cx="120" cy="120" r="35" stroke="var(--teal)" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export function FileUpload({
  onFileReady,
  onUploadError,
  acceptedFileTypes = [],
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  className = "",
  label = "Glissez-déposez ou",
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<FileError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (progressRef.current) clearInterval(progressRef.current);
    },
    []
  );

  const handleError = useCallback(
    (err: FileError) => {
      setError(err);
      setStatus("error");
      onUploadError?.(err);
      setTimeout(() => {
        setError(null);
        setStatus("idle");
      }, 3000);
    },
    [onUploadError]
  );

  const processFile = useCallback(
    (selectedFile: File) => {
      setError(null);

      if (selectedFile.size > maxFileSize) {
        handleError({
          message: `Le fichier dépasse ${formatBytes(maxFileSize)}`,
          code: "FILE_TOO_LARGE",
        });
        return;
      }

      if (acceptedFileTypes.length) {
        const ft = selectedFile.type.toLowerCase();
        if (!acceptedFileTypes.some((t) => ft.match(t.toLowerCase()))) {
          handleError({
            message: `Type accepté : ${acceptedFileTypes.join(", ")}`,
            code: "INVALID_TYPE",
          });
          return;
        }
      }

      setFile(selectedFile);
      setStatus("uploading");
      setProgress(0);

      let p = 0;
      progressRef.current = setInterval(() => {
        p += 5;
        if (p >= 100) {
          if (progressRef.current) clearInterval(progressRef.current);
          setProgress(100);
          setStatus("idle");
          setFile(null);
          onFileReady?.(selectedFile);
        } else {
          setProgress(p);
        }
      }, 40);
    },
    [maxFileSize, acceptedFileTypes, handleError, onFileReady]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (status !== "uploading") setStatus("dragging");
    },
    [status]
  );
  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (status === "dragging") setStatus("idle");
    },
    [status]
  );
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (status === "uploading") return;
      setStatus("idle");
      const f = e.dataTransfer.files?.[0];
      if (f) processFile(f);
    },
    [status, processFile]
  );

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    borderRadius: "var(--radius)",
    border: `1px solid ${status === "dragging" ? "var(--orange)" : "var(--mist-line)"}`,
    background: "var(--paper)",
    overflow: "hidden",
    transition: "border-color 0.2s ease",
  };

  return (
    <div className={`file-upload ${className}`} style={containerStyle}>
      {/* Dragging gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: status === "dragging" ? 1 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--orange-tint)", opacity: 0.3 }} />
      </div>

      <div style={{ position: "relative", height: "220px" }}>
        <AnimatePresence mode="wait">
          {(status === "idle" || status === "dragging") && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: status === "dragging" ? 0.8 : 1,
                y: 0,
                scale: status === "dragging" ? 0.98 : 1,
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <UploadIllustration />
              </div>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--ink)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--slate)", marginTop: "4px" }}>
                  {acceptedFileTypes.length
                    ? acceptedFileTypes.map((t) => t.split("/")[1]).join(", ").toUpperCase()
                    : "PDF, DOC, XLS, IMG"}{" "}
                  • Max {formatBytes(maxFileSize)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "80%",
                  maxWidth: "240px",
                  justifyContent: "center",
                }}
              >
                <span>Parcourir</span>
                <UploadCloud size={16} />
              </button>

              <p style={{ fontSize: "11px", color: "var(--slate)", marginTop: "10px" }}>
                ou glissez un fichier ici
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes.join(",")}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                  e.target.value = "";
                }}
                style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
              />
            </motion.div>
          )}

          {status === "uploading" && file && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <UploadingAnimation progress={progress} />
              </div>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>
                  {file.name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ color: "var(--slate)" }}>
                    {formatBytes(file.size)}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--orange)" }}>
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  if (progressRef.current) clearInterval(progressRef.current);
                  setFile(null);
                  setStatus("idle");
                  setProgress(0);
                }}
                style={{ width: "80%", maxWidth: "240px", justifyContent: "center" }}
              >
                Annuler
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              bottom: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--danger-tint)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 14px",
              fontSize: "12.5px",
              color: "var(--danger)",
              fontWeight: 500,
            }}
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
