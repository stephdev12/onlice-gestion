"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface TopClientsProps {
  period: "mois" | "trimestre";
}

export function TopClients({ period }: TopClientsProps) {
  const summary = useQuery(api.finance.summary, { period });
  const topSources = summary?.topSources ?? [];

  if (summary && topSources.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "4px 0" }}>
        Aucune entrée d&apos;argent avec une source renseignée pour l&apos;instant.
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
      {topSources.map((c, idx) => (
        <motion.div
          key={c.source}
          variants={fadeInUp}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: idx < topSources.length - 1 ? "1px solid var(--mist-line)" : "none",
          }}
        >
          <span style={{ fontWeight: 500, fontSize: "13.5px" }}>{c.source}</span>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            {c.montant.toLocaleString()} XAF
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
