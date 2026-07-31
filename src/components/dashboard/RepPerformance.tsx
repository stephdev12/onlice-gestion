"use client";

import { motion } from "motion/react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const reps = [
  { nom: "Aline Foka (AF)", sub: "4 prospects gérés", taux: "50%" },
  { nom: "Marc Kwedi (MK)", sub: "5 prospects gérés", taux: "20%" },
];

export function RepPerformance() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      {reps.map((r, idx) => (
        <motion.div
          key={r.nom}
          variants={fadeInUp}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: idx < reps.length - 1 ? "1px solid var(--mist-line)" : "none",
          }}
        >
          <div>
            <div style={{ fontWeight: 500, fontSize: "13.5px" }}>{r.nom}</div>
            <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "1px" }}>
              {r.sub}
            </div>
          </div>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            {r.taux}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
