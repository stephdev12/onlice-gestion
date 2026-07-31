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
  const employees = useQuery(
    api.employees.list,
    profile?.role === "admin" || profile?.role === "ceo" ? {} : "skip"
  );
  const notifications = useQuery(api.projects.notifications);
  const createProject = useMutation(api.projects.create);
  const addTask = useMutation(api.projects.addTask);
  const updateTaskProgress = useMutation(api.projects.updateTaskProgress);
  const deleteTask = useMutation(api.projects.deleteTask);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedProject = useQuery(
    api.projects.getById,
    selectedId && projects?.some((project) => project._id === selectedId)
      ? { id: selectedId as any }
      : "skip"
  );

  const activeProjects = projects ?? [];
  const canManage = profile?.role === "admin" || profile?.role === "ceo";
  const activeProject = selectedProject ?? null;

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
        title="Projets"
        subtitle={`${activeProjects.length} projets en cours`}
        actions={actions}
      />

      <div className="content-body">
        {profile?.role === "employe" && notifications && notifications.length > 0 && (
          <div style={{ marginBottom: "20px", padding: "12px 14px", border: "1px solid var(--mist-line)", borderRadius: "8px", background: "var(--mist)" }}>
            <strong style={{ fontSize: "13px" }}>Nouvelles missions</strong>
            {notifications.filter((notification) => !notification.readAt).map((notification) => (
              <div key={notification._id} style={{ fontSize: "12.5px", color: "var(--slate)", marginTop: "5px" }}>
                {notification.message}
              </div>
            ))}
          </div>
        )}
        <ProjectGrid
          projects={activeProjects as any}
          onSelectProject={(id) => setSelectedId(id)}
        />
      </div>

      <ProjectDrawer
        project={activeProject as any}
        onClose={() => setSelectedId(null)}
        onAddTask={handleAddTask}
        onUpdateTaskProgress={handleUpdateTaskProgress}
        onDeleteTask={handleDeleteTask}
        canManage={canManage}
        canUpdateProgress={!!profile}
        employees={(employees ?? []) as any}
      />

      <AddProjectDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateProject}
      />
    </>
  );
}
