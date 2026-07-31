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

  const createProject = useMutation(api.projects.create);
  const addTask = useMutation(api.projects.addTask);
  const updateTaskProgress = useMutation(api.projects.updateTaskProgress);
  const deleteTask = useMutation(api.projects.deleteTask);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedProject = useQuery(
    api.projects.getById,
    selectedId ? { id: selectedId as any } : "skip"
  );

  const activeProjects = projects || [];
  const canManage = profile?.role === "ceo" || profile?.role === "admin";

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
        onDeleteTask={handleDeleteTask}
        canManage={canManage}
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
