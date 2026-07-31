"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { ProspectDrawer } from "@/components/pipeline/ProspectDrawer";
import { AddProspectDrawer } from "@/components/pipeline/AddProspectDrawer";
import { Button } from "@/components/ui/Button";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus } from "lucide-react";

export default function PipelinePage() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.profiles.current);
  const canManage = profile?.role === "admin" || profile?.role === "ceo";
  const prospects = useQuery(api.prospects.list, isAuthenticated && canManage ? {} : "skip");
  const createProspect = useMutation(api.prospects.create);
  const moveStage = useMutation(api.prospects.moveStage);
  const addNote = useMutation(api.prospects.addNote);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedProspect = useQuery(
    api.prospects.getById,
    selectedId && prospects?.some((prospect) => prospect._id === selectedId)
      ? { id: selectedId as any }
      : "skip"
  );

  const activeProspects = prospects ?? [];
  const activeProspect = selectedProspect ?? null;

  const handleCreate = async (data: any) => {
    try {
      await createProspect(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMove = async (id: string, newStage: string, stageLabel: string) => {
    try {
      await moveStage({ id: id as any, newStage, stageLabel });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async (id: string, text: string) => {
    try {
      await addNote({ id: id as any, text });
    } catch (e) {
      console.error(e);
    }
  };

  const actions = canManage ? (
    <Button variant="accent" onClick={() => setIsAddOpen(true)}>
      <Plus size={16} /> Nouveau prospect
    </Button>
  ) : null;

  return (
    <>
      <Header
        title="Pipeline commercial"
        subtitle={`${activeProspects.length} prospects actifs`}
        actions={actions}
      />

      <div className="content-body">
        <KanbanBoard
          prospects={activeProspects as any}
          onSelectProspect={(id) => setSelectedId(id)}
          onMoveStage={handleMove}
          canEdit={canManage}
        />
      </div>

      <ProspectDrawer
        prospect={activeProspect as any}
        onClose={() => setSelectedId(null)}
        onMoveStage={handleMove}
        onAddNote={handleAddNote}
        canEdit={canManage}
      />

      <AddProspectDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
