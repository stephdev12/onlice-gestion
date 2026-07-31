"use client";

import { motion } from "motion/react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: "encours" | "termine" | "retard";
  height?: number;
}

export function ProgressBar({ progress, variant = "encours", height = 6 }: ProgressBarProps) {
  const colors = {
    encours: "var(--orange)",
    termine: "var(--teal)",
    retard: "var(--danger)",
  };

  return (
    <div
      style={{
        height: `${height}px`,
        background: "var(--mist)",
        borderRadius: "4px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          height: "100%",
          background: colors[variant],
          borderRadius: "4px",
        }}
      />
    </div>
  );
}
