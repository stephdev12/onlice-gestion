"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskItem } from "./TaskItem";
import { formatDate, todayISO } from "@/lib/utils";
import { TEAM_ROLES } from "@/lib/constants";
import { motion, AnimatePresence } from "motion/react";

interface Task {
  _id: string;
  titre: string;
  priorite: string;
  echeance: string;
  assigne?: string;
  progression: number;
}

interface EmployeeOption {
  _id: string;
  nom: string;
  initials: string;
}

interface ProjectDetail {
  _id: string;
  titre: string;
  client?: string;
  description?: string;
  echeanceDefaut: string;
  equipe: string[];
  taches: Task[];
}

interface ProjectDrawerProps {
  project: ProjectDetail | null;
  onClose: () => void;
  onAddTask: (projectId: string, task: { titre: string; priorite: string; echeance: string; assigneId: string }) => void;
  onUpdateTaskProgress: (taskId: string, progress: number) => void;
  onDeleteTask: (taskId: string) => void;
  canManage: boolean;
  canUpdateProgress: boolean;
  employees: EmployeeOption[];
}

export function ProjectDrawer({
  project,
  onClose,
  onAddTask,
  onUpdateTaskProgress,
  onDeleteTask,
  canManage,
  canUpdateProgress,
  employees,
}: ProjectDrawerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitre, setTaskTitre] = useState("");
  const [taskPriorite, setTaskPriorite] = useState("moyenne");
  const [taskEcheance, setTaskEcheance] = useState(todayISO());
  const [taskAssigneId, setTaskAssigneId] = useState("");
  const [err, setErr] = useState(false);

  if (!project) return null;

  const tasks = project.taches || [];
  const progress = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + t.progression, 0) / tasks.length)
    : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitre.trim()) {
      setErr(true);
      return;
    }
    onAddTask(project._id, {
      titre: taskTitre.trim(),
      priorite: taskPriorite,
      echeance: taskEcheance || todayISO(),
      assigneId: taskAssigneId,
    });
    setTaskTitre("");
    setErr(false);
    setShowAddForm(false);
  };

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
            <Badge variant={progress >= 100 ? "termine" : "encours"}>
              {progress >= 100 ? "Terminé" : "En cours"}
            </Badge>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "12px",
                color: "var(--slate)",
              }}
            >
              Échéance {formatDate(project.echeanceDefaut)}
            </span>
          </div>

          <ProgressBar progress={progress} variant={progress >= 100 ? "termine" : "encours"} height={8} />

          {project.description && (
            <p style={{ fontSize: "13.5px", color: "var(--slate)", margin: "12px 0" }}>
              {project.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {project.equipe.map((initials) => (
              <div
                key={initials}
                className="avatar"
                style={{ width: "24px", height: "24px", fontSize: "10px" }}
                title={TEAM_ROLES[initials] || ""}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--mist-line)", paddingTop: "16px" }}>
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
              Tâches ({tasks.length})
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
              Aucune tâche pour l'instant.
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
                  canUpdateProgress={canUpdateProgress}
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
              }}
            >
              + Ajouter une tâche
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
                <label>Titre de la tâche *</label>
                <input
                  type="text"
                  placeholder="Ex : Intégrer la page d'accueil"
                  value={taskTitre}
                  onChange={(e) => {
                    setTaskTitre(e.target.value);
                    if (e.target.value.trim()) setErr(false);
                  }}
                />
                {err && <div className="field-err">Le titre est requis.</div>}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Priorité</label>
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
                  <label>Échéance</label>
                  <input
                    type="date"
                    value={taskEcheance}
                    onChange={(e) => setTaskEcheance(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Assigné *</label>
                <select
                  value={taskAssigneId}
                  onChange={(e) => setTaskAssigneId(e.target.value)}
                  required
                >
                  <option value="" disabled>Sélectionner un employé</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.nom} ({employee.initials})
                    </option>
                  ))}
                </select>
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
                  Ajouter
                </Button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
