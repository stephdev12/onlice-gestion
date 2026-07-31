"use client";

import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

export function AlertPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px",
        background: "var(--danger-tint)",
        borderRadius: "10px",
      }}
    >
      <AlertTriangle size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
      <div>
        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ink)" }}>
          Programme fidélité — Épicerie Ngo
        </div>
        <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "2px" }}>
          Échéance dépassée du 20 juillet · 68% terminé
        </div>
      </div>
    </motion.div>
  );
}
