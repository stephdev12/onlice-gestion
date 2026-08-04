"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  variant?: "default" | "encours" | "termine" | "retard";
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 5,
  onChange,
  onChangeEnd,
  label,
  showValue = true,
  variant = "default",
  className = "",
  style,
  disabled = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const colorMap: Record<string, string> = {
    default: "var(--ink)",
    encours: "var(--orange)",
    termine: "var(--teal)",
    retard: "var(--danger)",
  };
  const fillColor = colorMap[variant] || "var(--ink)";

  const computeValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + pct * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step, value]
  );

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled) return;
      setDragging(true);
      onChange(computeValue(clientX));
    },
    [disabled, computeValue, onChange]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      onChange(computeValue(clientX));
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const finalVal = computeValue(clientX);
      onChange(finalVal);
      onChangeEnd?.(finalVal);
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, computeValue, onChange, onChangeEnd]);

  return (
    <div className={`custom-slider ${className}`} style={{ ...style }}>
      {(label || showValue) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          {label && (
            <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--slate)" }}>
              {label}
            </span>
          )}
          {showValue && (
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "12px",
                fontWeight: 600,
                color: fillColor,
                minWidth: "36px",
                textAlign: "right",
              }}
            >
              {value}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            const next = Math.min(max, value + step);
            onChange(next);
            onChangeEnd?.(next);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            const next = Math.max(min, value - step);
            onChange(next);
            onChangeEnd?.(next);
          }
        }}
        style={{
          position: "relative",
          height: "44px",
          display: "flex",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          touchAction: "none",
          userSelect: "none",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Background track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "6px",
            borderRadius: "3px",
            background: "var(--mist)",
          }}
        />

        {/* Filled track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: `${percentage}%`,
            height: "6px",
            borderRadius: "3px",
            background: fillColor,
            transition: dragging ? "none" : "width 0.15s ease",
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            left: `${percentage}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: dragging ? "24px" : "20px",
            height: dragging ? "24px" : "20px",
            borderRadius: "50%",
            background: "var(--paper)",
            border: `2px solid ${fillColor}`,
            boxShadow: dragging
              ? `0 0 0 6px ${fillColor}22, var(--shadow-md)`
              : "var(--shadow-sm)",
            transition: dragging
              ? "width 0.1s ease, height 0.1s ease"
              : "left 0.15s ease, width 0.1s ease, height 0.1s ease",
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}
