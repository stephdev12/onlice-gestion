"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface RevenueChartProps {
  period: "mois" | "trimestre";
}

export function RevenueChart({ period }: RevenueChartProps) {
  const summary = useQuery(api.finance.summary, { period });
  const months = summary?.months ?? [];
  const maxVal = Math.max(1, ...months.map((m) => Math.max(m.revenu, m.depense)));

  if (summary && months.every((m) => m.revenu === 0 && m.depense === 0)) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "24px 0" }}>
        Aucune entrée ou sortie enregistrée pour l&apos;instant.
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0", width: "100%", overflowX: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "140px", minWidth: "260px" }}>
        {months.map((m, idx) => {
          const revHeight = Math.round((m.revenu / maxVal) * 120);
          const depHeight = Math.round((m.depense / maxVal) * 120);

          return (
            <div
              key={m.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "3px",
                  height: "120px",
                }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${revHeight}px` }}
                  transition={{ duration: 0.6, delay: idx * 0.08, type: "spring", damping: 15 }}
                  style={{
                    width: "11px",
                    borderRadius: "3px 3px 0 0",
                    background: "var(--teal)",
                  }}
                  title={`Revenu: ${m.revenu.toLocaleString()} XAF`}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${depHeight}px` }}
                  transition={{ duration: 0.6, delay: idx * 0.08 + 0.04, type: "spring", damping: 15 }}
                  style={{
                    width: "11px",
                    borderRadius: "3px 3px 0 0",
                    background: "var(--mist-line)",
                  }}
                  title={`Dépense: ${m.depense.toLocaleString()} XAF`}
                />
              </div>
              <div style={{ fontSize: "10.5px", color: "var(--slate)", marginTop: "8px" }}>
                {m.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: "18px",
          fontSize: "11.5px",
          color: "var(--slate)",
          marginTop: "14px",
          paddingTop: "14px",
          borderTop: "1px solid var(--mist-line)",
        }}
      >
        <span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              display: "inline-block",
              marginRight: "5px",
              background: "var(--teal)",
            }}
          />
          Revenus
        </span>
        <span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              display: "inline-block",
              marginRight: "5px",
              background: "var(--mist-line)",
            }}
          />
          Dépenses
        </span>
      </div>
    </div>
  );
}
