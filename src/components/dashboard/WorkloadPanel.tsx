"use client";

import { motion } from "motion/react";

interface WorkloadItem {
  label: string;
  count: number;
  max: number;
}

const workloadData: WorkloadItem[] = [
  { label: "Commercial", count: 9, max: 9 },
  { label: "Développement", count: 3, max: 9 },
  { label: "Design", count: 2, max: 9 },
  { label: "Direction", count: 3, max: 9 },
];

export function WorkloadPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {workloadData.map((w, idx) => {
        const pct = Math.round((w.count / w.max) * 100);
        return (
          <div key={w.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                marginBottom: "5px",
              }}
            >
              <span>{w.label}</span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "var(--slate)",
                  fontSize: "12px",
                }}
              >
                {w.count}
              </span>
            </div>
            <div
              style={{
                height: "7px",
                background: "var(--mist)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                style={{
                  height: "100%",
                  background: "var(--ink)",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
