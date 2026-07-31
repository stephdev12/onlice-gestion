"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TeamGrid } from "@/components/equipe/TeamGrid";
import { PendingRequests } from "@/components/equipe/PendingRequests";
import { EmployeeDrawer } from "@/components/equipe/EmployeeDrawer";
import { AddEmployeeDrawer } from "@/components/equipe/AddEmployeeDrawer";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus } from "lucide-react";

export default function EquipePage() {
  const employees = useQuery(api.employees.list);
  const pendingRequests = useQuery(api.employees.pendingDemandes);
  const profile = useQuery(api.profiles.current);

  const createEmployee = useMutation(api.employees.create);
  const updateDemandeStatus = useMutation(api.employees.updateDemandeStatus);
  const createDemande = useMutation(api.employees.createDemande);
  const submitRapport = useMutation(api.employees.submitRapport);
  const validateRapport = useMutation(api.employees.validateRapport);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const selectedEmployee = useQuery(
    api.employees.getById,
    selectedId ? { id: selectedId as any } : "skip"
  );

  const isCeo = profile?.role === "ceo";
  const canManage = isCeo || profile?.role === "admin";
  const activeEmployees = employees || [];
  const activeRequests = pendingRequests || [];

  const handleCreateEmployee = async (data: any) => {
    try {
      await createEmployee(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDemandeStatus = async (id: string, statut: "approuve" | "refuse") => {
    try {
      await updateDemandeStatus({ id: id as any, statut });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDemande = async (data: any) => {
    if (!selectedId) return;
    try {
      await createDemande({ employeId: selectedId as any, ...data });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitRapport = async (data: any) => {
    if (!selectedId) return;
    try {
      await submitRapport({
        employeId: selectedId as any,
        semaine: new Date().toISOString().split("T")[0],
        ...data,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleValidateRapport = async (rapportId: string) => {
    try {
      await validateRapport({ id: rapportId as any });
    } catch (e) {
      console.error(e);
    }
  };

  const actions = canManage ? (
    <Button variant="accent" onClick={() => setIsAddOpen(true)}>
      <Plus size={16} /> Nouvel employé
    </Button>
  ) : null;

  return (
    <>
      <Header
        title="Équipe & RH"
        subtitle={`${activeEmployees.length} employé(s) · ${activeRequests.length} demande(s) en attente`}
        actions={actions}
      />

      <div className="content-body">
        {!canManage ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
            Accès restreint. Seuls les administrateurs et le CEO peuvent consulter l'annuaire de l'équipe.
          </div>
        ) : (
          <>
            {activeRequests.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--slate)",
                    marginBottom: "12px",
                  }}
                >
                  Demandes en attente
                </p>
                <PendingRequests
                  requests={activeRequests as any}
                  onUpdateStatus={handleUpdateDemandeStatus}
                />
              </div>
            )}

            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--slate)",
                marginBottom: "12px",
              }}
            >
              Annuaire
            </p>

            {employees === undefined ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
                Chargement de l'équipe...
              </div>
            ) : activeEmployees.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
                Aucun employé enregistré. Cliquez sur 'Nouvel employé' pour en ajouter un.
              </div>
            ) : (
              <TeamGrid
                employees={activeEmployees as any}
                onSelectEmployee={(id) => setSelectedId(id)}
              />
            )}
          </>
        )}
      </div>

      <EmployeeDrawer
        employee={selectedEmployee as any}
        onClose={() => setSelectedId(null)}
        onCreateDemande={handleCreateDemande}
        onSubmitRapport={handleSubmitRapport}
        onValidateRapport={handleValidateRapport}
      />

      {canManage && (
        <AddEmployeeDrawer
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleCreateEmployee}
          isCeo={isCeo}
        />
      )}
    </>
  );
}
