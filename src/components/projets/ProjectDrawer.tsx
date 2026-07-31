"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskItem } from "./TaskItem";
import { formatDate, todayISO } from "@/lib/utils";
import { TEAM_ROLES } from "@/lib/constants";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";

interface Task {
  _id: string;
  titre: string;
  priorite: string;
  echeance: string;
  assigne?: string;
  assigneId?: string;
  progression: number;
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
  canManage?: boolean;
}

export function ProjectDrawer({
  project,
  onClose,
  onAddTask,
  onUpdateTaskProgress,
  onDeleteTask,
  canManage = true,
}: ProjectDrawerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitre, setTaskTitre] = useState("");
  const [taskPriorite, setTaskPriorite] = useState("moyenne");
  const [taskEcheance, setTaskEcheance] = useState(todayISO());
  const [taskAssigneId, setTaskAssigneId] = useState<string>("");
  const [err, setErr] = useState(false);

  const employees = useQuery(api.employees.list);

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
                title={TEAM_ROLES[initials] || initials}
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
              Tâches & Missions ({tasks.length})
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
              Aucune tâche attribuable.
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
                  placeholder="Ex : Intégrer la page d'accueil"
                  value={taskTitre}
                  onChange={(e) => {
                    setTaskTitre(e.target.value);
                    if (e.target.value.trim() && taskAssigneId) setErr(false);
                  }}
                />
              </div>

              <div className="field">
                <label>Attribuer à un employé *</label>
                <select
                  value={taskAssigneId}
                  onChange={(e) => {
                    setTaskAssigneId(e.target.value);
                    if (taskTitre.trim() && e.target.value) setErr(false);
                  }}
                >
                  <option value="">Sélectionner un employé...</option>
                  {(employees || []).map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.nom} ({emp.poste || emp.departement})
                    </option>
                  ))}
                </select>
                {err && <div className="field-err">Le nom et l'employé sont requis.</div>}
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
        </div>
      </div>
    </Drawer>
  );
}
