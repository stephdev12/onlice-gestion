"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export function RepPerformance() {
  const reps = useQuery(api.prospects.repPerformance) ?? [];

  if (reps.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "4px 0" }}>
        Aucun prospect enregistré pour l&apos;instant.
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      {reps.map((r, idx) => (
        <motion.div
          key={r.rep}
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
            <div style={{ fontWeight: 500, fontSize: "13.5px" }}>{r.rep}</div>
            <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "1px" }}>
              {r.total} prospect{r.total > 1 ? "s" : ""} géré{r.total > 1 ? "s" : ""}
            </div>
          </div>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            {r.taux}%
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
