"use client";

import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AlertPanel() {
  const lateProjects = useQuery(api.projects.lateProjects) ?? [];

  if (lateProjects.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "4px 0" }}>
        Aucun projet en retard.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {lateProjects.map((p) => (
        <motion.div
          key={p.id}
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
              {p.titre}
              {p.client ? ` — ${p.client}` : ""}
            </div>
            <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "2px" }}>
              Échéance dépassée du {p.echeance} · {p.progression}% terminé
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
