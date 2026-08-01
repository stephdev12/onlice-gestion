"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectGrid } from "@/components/projets/ProjectGrid";
import { ProjectDrawer } from "@/components/projets/ProjectDrawer";
import { AddProjectDrawer } from "@/components/projets/AddProjectDrawer";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus } from "lucide-react";

export default function ProjetsPage() {
  const projects = useQuery(api.projects.list);
  const profile = useQuery(api.profiles.current);
  const canManage = profile?.role === "ceo" || profile?.role === "admin";

  const createProject = useMutation(api.projects.create);
  const addTask = useMutation(api.projects.addTask);
  const updateTaskProgress = useMutation(api.projects.updateTaskProgress);
  const updateTaskWorkflow = useMutation(api.projects.updateTaskWorkflow);
  const deleteTask = useMutation(api.projects.deleteTask);
  const employees = useQuery(api.employees.list, canManage ? {} : "skip");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedProject = useQuery(
    api.projects.getById,
    selectedId ? { id: selectedId as any } : "skip"
  );

  const activeProjects = projects || [];

  const handleCreateProject = async (data: any) => {
    try {
      await createProject(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (projectId: string, task: any) => {
    try {
      await addTask({ projectId: projectId as any, ...task });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTaskProgress = async (taskId: string, progression: number) => {
    try {
      await updateTaskProgress({ id: taskId as any, progression });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ id: taskId as any });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProject = useMutation(api.projects.deleteProject);
  const handleDeleteProject = async (projectId: string) => {
    try {
      if (!confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
      await deleteProject({ id: projectId as any });
      if (selectedId === projectId) setSelectedId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTaskWorkflow = async (
    taskId: string,
    data: {
      statut: "attendu" | "encours" | "termine";
      detailsFait?: string;
      detailsBlocage?: string;
      detailsReste?: string;
      notes?: string;
      importance?: "critique" | "haute" | "moyenne" | "basse";
    }
  ) => {
    try {
      await updateTaskWorkflow({
        id: taskId as any,
        statut: data.statut,
        detailsFait: data.detailsFait,
        detailsBlocage: data.detailsBlocage,
        detailsReste: data.detailsReste,
        notes: data.notes,
        importance: data.importance,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const actions = canManage ? (
    <Button variant="accent" onClick={() => setIsAddOpen(true)}>
      <Plus size={16} /> Nouveau projet
    </Button>
  ) : null;

  return (
    <>
      <Header
        title="Projets & Missions"
        subtitle={
          canManage
            ? `${activeProjects.length} projet(s) géré(s)`
            : `${activeProjects.length} projet(s) contenant vos missions`
        }
        actions={actions}
      />

      <div className="content-body">
        {projects === undefined ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
            Chargement des projets...
          </div>
        ) : activeProjects.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
            {canManage
              ? "Aucun projet. Cliquez sur 'Nouveau projet' pour commencer."
              : "Aucune mission ne vous est attribuée pour l'instant."}
          </div>
        ) : (
          <ProjectGrid
            projects={activeProjects as any}
            onSelectProject={(id) => setSelectedId(id)}
          />
        )}
      </div>

      <ProjectDrawer
        project={selectedProject as any}
        onClose={() => setSelectedId(null)}
        onAddTask={handleAddTask}
        onUpdateTaskProgress={handleUpdateTaskProgress}
        onUpdateTaskWorkflow={handleUpdateTaskWorkflow}
        onDeleteTask={handleDeleteTask}
        onDeleteProject={handleDeleteProject}
        canManage={canManage}
        employees={(employees || []) as any}
      />

      {canManage && (
        <AddProjectDrawer
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </>
  );
}
