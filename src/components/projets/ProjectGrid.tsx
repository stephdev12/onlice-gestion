"use client";

import { motion, AnimatePresence } from "motion/react";
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

const STATUS_COLUMNS = [
  { id: "encours", label: "En cours", color: "var(--orange)" },
  { id: "retard", label: "En retard", color: "var(--danger)" },
  { id: "termine", label: "Terminé", color: "var(--teal)" },
] as const;

const TYPE_ICONS: Record<string, string> = {
  dev: "🖥️",
  marketing_digital: "📢",
  design: "🎨",
  campagne_marketing: "📣",
  rapide: "⚡",
};

export function ProjectGrid({ projects, onSelectProject }: ProjectGridProps) {
  return (
    <div className="project-kanban">
      {STATUS_COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => p.status === col.id);

        return (
          <div key={col.id} className="project-kanban-col">
            {/* Column header */}
            <div className="project-kanban-col-header">
              <span className="dot" style={{ background: col.color }} />
              <span className="label">{col.label}</span>
              <span className="count">{colProjects.length}</span>
            </div>

            {/* Project cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="project-kanban-cards"
            >
              <AnimatePresence mode="popLayout">
                {colProjects.map((p) => (
                  <motion.div
                    key={p._id}
                    variants={fadeInUp}
                    layoutId={p._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <div
                      onClick={() => onSelectProject(p._id)}
                      style={{
                        border: "1px solid var(--mist-line)",
                        borderRadius: "10px",
                        padding: "12px",
                        background: "var(--paper)",
                        cursor: "pointer",
                        borderLeft: `3px solid ${col.color}`,
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Title + type icon */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span className="project-card-type-icon">
                          {TYPE_ICONS[p.projectType || "dev"] || "📁"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.titre}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--slate)",
                              marginTop: "1px",
                            }}
                          >
                            {p.client || "—"}
                          </div>
                        </div>
                      </div>

                      {/* Type badge */}
                      <div style={{ margin: "8px 0" }}>
                        <Badge variant="neutral">
                          {PROJECT_TYPE_LABELS[p.projectType || "dev"] || "Projet"}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: "10px" }}>
                        <ProgressBar progress={p.progress} variant={p.status} />
                      </div>

                      {/* Bottom row: team + date + % */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Team avatars overlapping */}
                        <div className="project-card-team">
                          {p.equipe.slice(0, 3).map((initials) => (
                            <div
                              key={initials}
                              className="avatar"
                              style={{
                                width: "24px",
                                height: "24px",
                                fontSize: "9px",
                              }}
                              title={TEAM_ROLES[initials] || ""}
                            >
                              {initials}
                            </div>
                          ))}
                          {p.equipe.length > 3 && (
                            <div
                              className="avatar"
                              style={{
                                width: "24px",
                                height: "24px",
                                fontSize: "9px",
                                background: "var(--mist)",
                                color: "var(--slate)",
                              }}
                            >
                              +{p.equipe.length - 3}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {/* Task count */}
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--slate)",
                            }}
                          >
                            {p.taches?.length || 0} tâches
                          </span>

                          {/* Deadline badge */}
                          <span
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: "11px",
                              color: p.status === "retard" ? "var(--danger)" : "var(--slate)",
                              fontWeight: p.status === "retard" ? 600 : 400,
                            }}
                          >
                            {formatDate(p.echeance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {colProjects.length === 0 && (
                <div
                  style={{
                    border: "1px dashed var(--mist-line)",
                    borderRadius: "10px",
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--slate)",
                    fontSize: "12.5px",
                  }}
                >
                  Aucun projet
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
