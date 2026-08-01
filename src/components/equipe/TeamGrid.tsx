"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DISPO_LABELS } from "@/lib/constants";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface Employee {
  _id: string;
  nom: string;
  initials: string;
  poste?: string;
  departement: string;
  embauche?: string;
  dispo: string;
  competences: string[];
  solde?: number | null;
  hasPendingReport?: boolean;
}

interface TeamGridProps {
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
}

export function TeamGrid({ employees, onSelectEmployee }: TeamGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="team-grid"
    >
      {employees.map((e) => (
        <motion.div key={e._id} variants={fadeInUp}>
          <Card onClick={() => onSelectEmployee(e._id)} hoverEffect>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
              }}
            >
              <div
                className="avatar"
                style={{ width: "40px", height: "40px", fontSize: "14px" }}
              >
                {e.initials}
              </div>
              <div>
                <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{e.nom}</div>
                <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "1px" }}>
                  {e.poste || "—"} · {e.departement}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "12px",
              }}
            >
              <Badge variant="neutral">{DISPO_LABELS[e.dispo] || e.dispo}</Badge>
              {e.solde !== null && e.solde !== undefined && (
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--slate)",
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {e.solde} j. congés
                </span>
              )}
            </div>

            {e.hasPendingReport && (
              <div style={{ marginTop: "10px" }}>
                <Badge variant="pending">Rapport à valider</Badge>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
