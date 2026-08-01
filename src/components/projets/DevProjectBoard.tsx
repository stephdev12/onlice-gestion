"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  assigneId?: string;
  type?: string;
  sprint?: string;
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
  const [filters, setFilters] = useState({ assigneId: "", importance: "", type: "", sprint: "" });

  const filteredTasks = useMemo(() => {
    return (project.taches || []).filter((t) => {
      if (filters.assigneId && t.assigneId !== filters.assigneId) return false;
      if (filters.importance && (t.importance || t.priorite) !== filters.importance) return false;
      if (filters.type && (t.type || "") !== filters.type) return false;
      if (filters.sprint && (t.sprint || "") !== filters.sprint) return false;
      return true;
    });
  }, [project.taches, filters]);

  const grouped = useMemo(() => groupTasks(filteredTasks), [filteredTasks]);
  const addComment = useMutation(api.projects.addComment);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <select value={filters.assigneId} onChange={(e) => setFilters(f => ({ ...f, assigneId: e.target.value }))}>
              <option value="">Tous</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.nom}</option>)}
            </select>
            <select value={filters.importance} onChange={(e) => setFilters(f => ({ ...f, importance: e.target.value }))}>
              <option value="">Importance</option>
              <option value="critique">Critique</option>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
            <input placeholder="Sprint" value={filters.sprint} onChange={(e) => setFilters(f => ({ ...f, sprint: e.target.value }))} style={{ width: 100 }} />
          </div>
          {canManage && (
          <Button variant="outline" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Fermer" : "Ajouter une feature"}
          </Button>
          )}
        </div>
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
        {( ["attendu", "encours", "termine"] as WorkflowStatus[] ).map((status) => (
          <div key={status} className="kanban-pro-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              const id = e.dataTransfer.getData("text/taskId");
              if (!id) return;
              setEditingTaskId(id);
              await onUpdateWorkflow(id, { statut: status as WorkflowStatus });
              setEditingTaskId(null);
            }}
          >
            <div className="kanban-pro-header">
              <strong>{statusLabel(status)}</strong>
              <span>{grouped[status].length}</span>
            </div>

            <div className="kanban-pro-list">
              {grouped[status].length === 0 && (
                <div className="kanban-empty">Aucune feature</div>
              )}

              {grouped[status].map((task) => (
                <div key={task._id} className="kanban-pro-card" draggable onDragStart={(e) => { e.dataTransfer.setData("text/taskId", task._id); }} onClick={() => setSelectedTask(task)}>
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
                    <button type="button" className="status-chip" onClick={async () => {
                      const text = prompt("Ajouter un commentaire / activité :");
                      if (!text) return;
                      try {
                        await addComment({ taskId: task._id as any, text });
                        alert("Commentaire ajouté");
                      } catch (e) {
                        console.error(e);
                        alert("Erreur lors de l'ajout du commentaire");
                      }
                    }}>Commenter</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature detail / timeline modal */}
      {selectedTask && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }} onClick={() => setSelectedTask(null)}>
          <div className="modal" style={{ width: 760, maxHeight: "80vh", overflow: "auto", background: "var(--paper)", padding: 18, borderRadius: 8 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{selectedTask.titre}</h3>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>{selectedTask.assigne || "N/A"}</div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h4>Commentaires</h4>
                {/* load comments */}
                {useQuery(api.projects.commentsForTask, selectedTask ? ({ taskId: selectedTask._id as any } as any) : ("skip" as any))?.map((c: any) => (
                  <div key={c._id} style={{ padding: 10, borderBottom: "1px solid var(--mist-line)" }}>
                    <div style={{ fontWeight: 600 }}>{c.authorName} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--slate)" }}>{new Date(c.createdAt).toLocaleString()}</span></div>
                    <div style={{ marginTop: 6 }}>{c.text}</div>
                  </div>
                ))}

                <div style={{ marginTop: 10 }}>
                  <CommentForm taskId={selectedTask._id} onAdded={() => { /* refresh handled by query auto-update */ }} />
                </div>
              </div>

              <div style={{ width: 320 }}>
                <h4>Activité</h4>
                {useQuery(api.projects.activityForTask, selectedTask ? ({ taskId: selectedTask._id as any } as any) : ("skip" as any))?.map((a: any) => (
                  <div key={a._id} style={{ padding: 8, borderBottom: "1px dashed var(--mist-line)", fontSize: 13 }}>
                    <div style={{ color: "var(--slate)", fontSize: 12 }}>{new Date(a.createdAt).toLocaleString()} — {a.type}</div>
                    {a.payload && <div style={{ marginTop: 6 }}>{a.payload}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentForm({ taskId, onAdded }: { taskId: string; onAdded?: () => void }) {
  const [text, setText] = useState("");
  const addComment = useMutation(api.projects.addComment);
  const submittingState = useState(false);

  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; try { await addComment({ taskId: taskId as any, text: text.trim() }); setText(""); onAdded?.(); } catch (err) { console.error(err); alert("Erreur ajout commentaire"); } }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ajouter un commentaire..." style={{ width: "100%", minHeight: 72 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button type="submit" className="status-chip">Envoyer</button>
      </div>
    </form>
  );
}
