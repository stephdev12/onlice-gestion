"use client";

import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  trend?: string;
  trendDirection?: "up" | "down";
  sub?: string;
}

export function KpiCard({
  label,
  value,
  unit = "",
  trend,
  trendDirection,
  sub,
}: KpiCardProps) {
  return (
    <Card hoverEffect>
      <div style={{ fontSize: "12px", color: "var(--slate)", fontWeight: 500, marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "25px", fontWeight: 600, letterSpacing: "-0.01em" }}>
        <AnimatedCounter value={value} />
        {unit && <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--slate)", marginLeft: "4px" }}>{unit}</span>}
      </div>
      {trend && (
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            marginTop: "8px",
            color: trendDirection === "up" ? "var(--teal)" : "var(--danger)",
          }}
        >
          {trend}
        </div>
      )}
      {sub && (
        <div style={{ fontSize: "12.5px", color: "var(--slate)", marginTop: "8px" }}>
          {sub}
        </div>
      )}
    </Card>
  );
}
