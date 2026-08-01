"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PROJECT_TYPE_LABELS } from "@/lib/constants";

type WorkflowStatus = "attendu" | "encours" | "termine";

type ProjectTask = {
  _id: string;
  titre: string;
  priorite: string;
  importance?: string;
  assigne?: string;
  statut?: WorkflowStatus;
  detailsFait?: string;
  detailsBlocage?: string;
  detailsReste?: string;
  notes?: string;
};

type ProjectDetail = {
  _id: string;
  titre: string;
  client?: string;
  description?: string;
  projectType?: string;
  taches: ProjectTask[];
};

interface DevProjectBoardProps {
  project: ProjectDetail;
  canManage: boolean;
  onUpdateWorkflow: (taskId: string, data: {
    statut: WorkflowStatus;
    detailsFait?: string;
    detailsBlocage?: string;
    detailsReste?: string;
    notes?: string;
    importance?: "critique" | "haute" | "moyenne" | "basse";
  }) => Promise<void>;
  onAddTask: (projectId: string, task: {
    titre: string;
    priorite: string;
    importance?: "critique" | "haute" | "moyenne" | "basse";
    echeance: string;
    assigneId: string;
    statut?: WorkflowStatus;
    detailsFait?: string;
    detailsBlocage?: string;
    detailsReste?: string;
    notes?: string;
  }) => Promise<void>;
  employees: Array<{ _id: string; nom: string; poste?: string; departement: string }>;
}

function groupTasks(tasks: ProjectTask[]) {
  const cols: Record<WorkflowStatus, ProjectTask[]> = {
    attendu: [],
    encours: [],
    termine: [],
  };
  for (const task of tasks) {
    const status = task.statut || (task.priorite === "haute" ? "attendu" : "encours");
    cols[status].push(task);
  }
  return cols;
}

function statusLabel(status: WorkflowStatus) {
  if (status === "attendu") return "Features attendues";
  if (status === "encours") return "Features en cours";
  return "Features terminées";
}

export function DevProjectBoard({ project, canManage, onUpdateWorkflow, onAddTask, employees }: DevProjectBoardProps) {
  const grouped = useMemo(() => groupTasks(project.taches || []), [project.taches]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    priorite: "moyenne",
    importance: "moyenne",
    assigneId: "",
    echeance: new Date().toISOString().split("T")[0],
    statut: "attendu" as WorkflowStatus,
    detailsFait: "",
    detailsBlocage: "",
    detailsReste: "",
    notes: "",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <Badge variant="neutral">{PROJECT_TYPE_LABELS[project.projectType || "dev"] || "Projet"}</Badge>
          {project.client && <Badge variant="encours">Client: {project.client}</Badge>}
        </div>
        {canManage && (
          <Button variant="outline" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Fermer" : "Ajouter une feature"}
          </Button>
        )}
      </div>

      {showCreate && canManage && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!form.titre.trim() || !form.assigneId) return;
            await onAddTask(project._id, {
              titre: form.titre.trim(),
              priorite: form.priorite,
              importance: form.importance as "critique" | "haute" | "moyenne" | "basse",
              echeance: form.echeance,
              assigneId: form.assigneId,
              statut: form.statut,
              detailsFait: form.detailsFait.trim() || undefined,
              detailsBlocage: form.detailsBlocage.trim() || undefined,
              detailsReste: form.detailsReste.trim() || undefined,
              notes: form.notes.trim() || undefined,
            });
            setForm({
              titre: "",
              priorite: "moyenne",
              importance: "moyenne",
              assigneId: "",
              echeance: new Date().toISOString().split("T")[0],
              statut: "attendu",
              detailsFait: "",
              detailsBlocage: "",
              detailsReste: "",
              notes: "",
            });
            setShowCreate(false);
          }}
          style={{ border: "1px solid var(--mist-line)", borderRadius: "10px", padding: "12px", background: "var(--mist)" }}
        >
          <div className="field">
            <label>Nom de la feature</label>
            <input value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Importance</label>
              <select value={form.importance} onChange={(e) => setForm((f) => ({ ...f, importance: e.target.value }))}>
                <option value="critique">Critique</option>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            <div className="field">
              <label>Priorité</label>
              <select value={form.priorite} onChange={(e) => setForm((f) => ({ ...f, priorite: e.target.value }))}>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            <div className="field">
              <label>Statut</label>
              <select value={form.statut} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as WorkflowStatus }))}>
                <option value="attendu">Attendu</option>
                <option value="encours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
            <div className="field">
              <label>Échéance</label>
              <input type="date" value={form.echeance} onChange={(e) => setForm((f) => ({ ...f, echeance: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>Assigné à</label>
            <select value={form.assigneId} onChange={(e) => setForm((f) => ({ ...f, assigneId: e.target.value }))} required>
              <option value="">Sélectionner...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.nom} ({emp.poste || emp.departement})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Fait</label>
              <textarea value={form.detailsFait} onChange={(e) => setForm((f) => ({ ...f, detailsFait: e.target.value }))} />
            </div>
            <div className="field">
              <label>Ne marche pas</label>
              <textarea value={form.detailsBlocage} onChange={(e) => setForm((f) => ({ ...f, detailsBlocage: e.target.value }))} />
            </div>
            <div className="field">
              <label>Reste à faire</label>
              <textarea value={form.detailsReste} onChange={(e) => setForm((f) => ({ ...f, detailsReste: e.target.value }))} />
            </div>
          </div>
          <Button type="submit" variant="primary" style={{ marginTop: "4px" }}>
            Enregistrer la feature
          </Button>
        </form>
      )}

      <div className="project-kanban-3">
        {(["attendu", "encours", "termine"] as WorkflowStatus[]).map((status) => (
          <div key={status} className="kanban-pro-column">
            <div className="kanban-pro-header">
              <strong>{statusLabel(status)}</strong>
              <span>{grouped[status].length}</span>
            </div>

            <div className="kanban-pro-list">
              {grouped[status].length === 0 && (
                <div className="kanban-empty">Aucune feature</div>
              )}

              {grouped[status].map((task) => (
                <div key={task._id} className="kanban-pro-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{task.titre}</div>
                    <Badge variant={task.priorite as "haute" | "moyenne" | "basse"}>{task.importance || task.priorite}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "4px" }}>
                    Assigné: {task.assigne || "N/A"}
                  </div>

                  {task.detailsFait && (
                    <div className="mini-block">
                      <div className="mini-label">Fait</div>
                      <p>{task.detailsFait}</p>
                    </div>
                  )}
                  {task.detailsBlocage && (
                    <div className="mini-block">
                      <div className="mini-label">Ne marche pas</div>
                      <p>{task.detailsBlocage}</p>
                    </div>
                  )}
                  {task.detailsReste && (
                    <div className="mini-block">
                      <div className="mini-label">Reste</div>
                      <p>{task.detailsReste}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                    {(["attendu", "encours", "termine"] as WorkflowStatus[]).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        className={`status-chip ${nextStatus === (task.statut || "attendu") ? "active" : ""}`}
                        onClick={async () => {
                          setEditingTaskId(task._id);
                          await onUpdateWorkflow(task._id, {
                            statut: nextStatus,
                            detailsFait: task.detailsFait,
                            detailsBlocage: task.detailsBlocage,
                            detailsReste: task.detailsReste,
                            notes: task.notes,
                            importance: (task.importance as "critique" | "haute" | "moyenne" | "basse" | undefined) || undefined,
                          });
                          setEditingTaskId(null);
                        }}
                        disabled={editingTaskId === task._id}
                      >
                        {nextStatus}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
