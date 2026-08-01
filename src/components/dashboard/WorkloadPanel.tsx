"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function WorkloadPanel() {
  const workloadData = useQuery(api.employees.workloadByDepartment) ?? [];

  if (workloadData.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "12px 0" }}>
        Aucune mission active pour l&apos;instant.
      </div>
    );
  }

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
