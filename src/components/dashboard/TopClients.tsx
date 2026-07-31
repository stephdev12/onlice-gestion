"use client";

import { motion } from "motion/react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const topClients = [
  { nom: "Essomba Distribution", montant: "1 850 000 XAF" },
  { nom: "Boutique Ada", montant: "1 200 000 XAF" },
  { nom: "Salon Grace Beauté", montant: "680 000 XAF" },
];

export function TopClients() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      {topClients.map((c, idx) => (
        <motion.div
          key={c.nom}
          variants={fadeInUp}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: idx < topClients.length - 1 ? "1px solid var(--mist-line)" : "none",
          }}
        >
          <span style={{ fontWeight: 500, fontSize: "13.5px" }}>{c.nom}</span>
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            {c.montant}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
