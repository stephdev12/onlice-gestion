"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskItem } from "./TaskItem";
import { DevProjectBoard } from "./DevProjectBoard";
import { formatDate, todayISO } from "@/lib/utils";
import { PROJECT_TYPE_LABELS, TEAM_ROLES } from "@/lib/constants";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";

interface Task {
  _id: string;
  titre: string;
  priorite: string;
  importance?: string;
  echeance: string;
  assigne?: string;
  assigneId?: string;
  statut?: "attendu" | "encours" | "termine";
  detailsFait?: string;
  detailsBlocage?: string;
  detailsReste?: string;
  notes?: string;
  progression: number;
}

interface ProjectDetail {
  _id: string;
  titre: string;
  client?: string;
  description?: string;
  projectType?: string;
  echeanceDefaut: string;
  equipe: string[];
  taches: Task[];
}

interface ProjectDrawerProps {
  project: ProjectDetail | null;
  onClose: () => void;
  onAddTask: (projectId: string, task: {
    titre: string;
    priorite: string;
    importance?: "critique" | "haute" | "moyenne" | "basse";
    echeance: string;
    assigneId: string;
    statut?: "attendu" | "encours" | "termine";
    detailsFait?: string;
    detailsBlocage?: string;
    detailsReste?: string;
    notes?: string;
  }) => Promise<void>;
  onUpdateTaskProgress: (taskId: string, progress: number) => void;
  onUpdateTaskWorkflow: (taskId: string, data: {
    statut: "attendu" | "encours" | "termine";
    detailsFait?: string;
    detailsBlocage?: string;
    detailsReste?: string;
    notes?: string;
    importance?: "critique" | "haute" | "moyenne" | "basse";
  }) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  canManage?: boolean;
  employees?: Array<{ _id: string; nom: string; poste?: string; departement: string }>;
}

export function ProjectDrawer({
  project,
  onClose,
  onAddTask,
  onUpdateTaskProgress,
  onUpdateTaskWorkflow,
  onDeleteTask,
  canManage = true,
  employees = [],
  onDeleteProject,
}: ProjectDrawerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitre, setTaskTitre] = useState("");
  const [taskPriorite, setTaskPriorite] = useState("moyenne");
  const [taskEcheance, setTaskEcheance] = useState(todayISO());
  const [taskAssigneId, setTaskAssigneId] = useState<string>("");
  const [err, setErr] = useState(false);

  // employees.list requires admin/ceo access — skip it for employees to avoid an Unauthorized crash
  const employeesList = useQuery(api.employees.list, canManage ? {} : "skip");

  if (!project) return null;

  const tasks = project.taches || [];
  const progress = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + t.progression, 0) / tasks.length)
    : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitre.trim() || !taskAssigneId) {
      setErr(true);
      return;
    }
    onAddTask(project._id, {
      titre: taskTitre.trim(),
      priorite: taskPriorite,
      echeance: taskEcheance || todayISO(),
      assigneId: taskAssigneId as any,
    });
    setTaskTitre("");
    setTaskAssigneId("");
    setErr(false);
    setShowAddForm(false);
  };

  const projectType = project.projectType || "dev";
  const teamForBoard = (employeesList || employees) as Array<{ _id: string; nom: string; poste?: string; departement: string }>;

  return (
    <Drawer
      isOpen={!!project}
      onClose={onClose}
      title={project.titre}
      subtitle={project.client || "Client non spécifié"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Badge variant={progress >= 100 ? "termine" : "encours"}>
                {progress >= 100 ? "Terminé" : "En cours"}
              </Badge>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "var(--slate)" }}>
                Échéance {formatDate(project.echeanceDefaut)}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {canManage && onDeleteProject && (
                <button
                  onClick={() => onDeleteProject(project._id)}
                  style={{ background: "transparent", border: "1px solid var(--danger)", color: "var(--danger)", padding: "6px 10px", borderRadius: 8 }}
                >
                  Supprimer le projet
                </button>
              )}
            </div>
          </div>

          <ProgressBar progress={progress} variant={progress >= 100 ? "termine" : "encours"} height={8} />

          {project.description && (
            <p style={{ fontSize: "13.5px", color: "var(--slate)", margin: "12px 0" }}>
              {project.description}
            </p>
          )}

          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <Badge variant="neutral">{PROJECT_TYPE_LABELS[projectType] || "Projet"}</Badge>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {project.equipe.map((initials) => (
              <div
                key={initials}
                className="avatar"
                style={{ width: "28px", height: "28px", fontSize: "11px" }}
                title={TEAM_ROLES[initials] || initials}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--mist-line)", paddingTop: "16px" }}>
          {projectType === "dev" ? (
            <DevProjectBoard
              project={project}
              canManage={canManage}
              onUpdateWorkflow={onUpdateTaskWorkflow}
              onAddTask={onAddTask}
              employees={teamForBoard}
            />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--slate)",
                  }}
                >
                  Feuille d'execution ({tasks.length})
                </p>
              </div>

              {tasks.length === 0 ? (
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--slate)",
                    padding: "16px 0",
                    textAlign: "center",
                  }}
                >
                  Aucune tache enregistree.
                </div>
              ) : (
                <AnimatePresence>
                  {tasks.map((t) => (
                    <TaskItem
                      key={t._id}
                      task={t}
                      onUpdateProgress={onUpdateTaskProgress}
                      onDelete={onDeleteTask}
                      canDelete={canManage}
                    />
                  ))}
                </AnimatePresence>
              )}

              {canManage && (!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    width: "100%",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                    background: "var(--mist)",
                    border: "1px dashed var(--mist-line)",
                    borderRadius: "10px",
                    padding: "10px",
                    textAlign: "center",
                    cursor: "pointer",
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Plus size={14} /> Attribuer une nouvelle mission
                </button>
              ) : (
                <form
                  onSubmit={handleCreateTask}
                  style={{
                    border: "1px solid var(--mist-line)",
                    borderRadius: "10px",
                    padding: "14px",
                    marginTop: "12px",
                    background: "var(--mist)",
                  }}
                >
                  <div className="field">
                    <label>Nom de la mission *</label>
                    <input
                      type="text"
                      placeholder="Ex : Lancer la campagne locale"
                      value={taskTitre}
                      onChange={(e) => {
                        setTaskTitre(e.target.value);
                        if (e.target.value.trim() && taskAssigneId) setErr(false);
                      }}
                    />
                  </div>

                  <div className="field">
                    <label>Attribuer a un employe *</label>
                    <select
                      value={taskAssigneId}
                      onChange={(e) => {
                        setTaskAssigneId(e.target.value);
                        if (taskTitre.trim() && e.target.value) setErr(false);
                      }}
                    >
                      <option value="">Selectionner un employe...</option>
                      {(teamForBoard || []).map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.nom} ({emp.poste || emp.departement})
                        </option>
                      ))}
                    </select>
                    {err && <div className="field-err">Le nom et l'employe sont requis.</div>}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Priorite</label>
                      <select
                        value={taskPriorite}
                        onChange={(e) => setTaskPriorite(e.target.value)}
                      >
                        <option value="basse">Basse</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="haute">Haute</option>
                      </select>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Echeance</label>
                      <input
                        type="date"
                        value={taskEcheance}
                        onChange={(e) => setTaskEcheance(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      style={{ flex: 1 }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" variant="primary" style={{ flex: 1 }}>
                      Attribuer
                    </Button>
                  </div>
                </form>
              ))}
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}
