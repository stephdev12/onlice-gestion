"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { ProspectDrawer } from "@/components/pipeline/ProspectDrawer";
import { AddProspectDrawer } from "@/components/pipeline/AddProspectDrawer";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus } from "lucide-react";

export default function PipelinePage() {
  const prospects = useQuery(api.prospects.list);
  const profile = useQuery(api.profiles.current);

  const createProspect = useMutation(api.prospects.create);
  const moveStage = useMutation(api.prospects.moveStage);
  const addNote = useMutation(api.prospects.addNote);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedProspect = useQuery(
    api.prospects.getById,
    selectedId ? { id: selectedId as any } : "skip"
  );

  const activeProspects = prospects || [];
  const canManage = profile?.role === "ceo" || profile?.role === "admin";

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
        subtitle={`${activeProspects.length} prospects enregistrés`}
        actions={actions}
      />

      <div className="content-body">
        {prospects === undefined ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
            Chargement des prospects...
          </div>
        ) : (
          <KanbanBoard
            prospects={activeProspects as any}
            onSelectProspect={(id) => setSelectedId(id)}
            onMoveStage={handleMove}
          />
        )}
      </div>

      <ProspectDrawer
        prospect={selectedProspect as any}
        onClose={() => setSelectedId(null)}
        onMoveStage={handleMove}
        onAddNote={handleAddNote}
      />

      {canManage && (
        <AddProspectDrawer
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </>
  );
}
