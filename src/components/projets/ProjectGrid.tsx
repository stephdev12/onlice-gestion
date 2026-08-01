"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";
import { PROJECT_TYPE_LABELS, TEAM_ROLES } from "@/lib/constants";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface Task {
  _id: string;
  titre: string;
  priorite: string;
  echeance: string;
  assigne?: string;
  progression: number;
}

interface Project {
  _id: string;
  titre: string;
  client?: string;
  description?: string;
  projectType?: string;
  echeanceDefaut: string;
  equipe: string[];
  taches: Task[];
  progress: number;
  echeance: string;
  status: "termine" | "retard" | "encours";
}

interface ProjectGridProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

export function ProjectGrid({ projects, onSelectProject }: ProjectGridProps) {
  const statusLabels = {
    termine: "Terminé",
    retard: "En retard",
    encours: "En cours",
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="project-grid"
    >
      {projects.map((p) => (
        <motion.div key={p._id} variants={fadeInUp}>
          <Card onClick={() => onSelectProject(p._id)} hoverEffect>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{p.titre}</div>
              <Badge variant={p.status}>{statusLabels[p.status]}</Badge>
            </div>

            <div
              style={{
                fontSize: "12.5px",
                color: "var(--slate)",
                marginTop: "1px",
                marginBottom: "12px",
              }}
            >
              {p.client || "—"}
            </div>

            <div style={{ marginBottom: "10px" }}>
              <Badge variant="neutral">{PROJECT_TYPE_LABELS[p.projectType || "dev"] || "Projet"}</Badge>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <ProgressBar progress={p.progress} variant={p.status} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                {p.equipe.map((initials) => (
                  <div
                    key={initials}
                    className="avatar"
                    style={{ width: "22px", height: "22px", fontSize: "9.5px" }}
                    title={TEAM_ROLES[initials] || ""}
                  >
                    {initials}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "12px",
                    color: "var(--slate)",
                  }}
                >
                  {p.progress}%
                </span>
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "11.5px",
                    color: "var(--slate)",
                  }}
                >
                  {formatDate(p.echeance)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
