"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/Button";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"mois" | "trimestre">("mois");
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.profiles.current);
  const stats = useQuery(
    api.dashboard.stats,
    isAuthenticated && profile ? { period } : "skip"
  );
  const seed = useMutation(api.seed.seedAll);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seed();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const actions = profile?.role === "admin" || profile?.role === "ceo" ? (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <Button
        variant="outline"
        onClick={handleSeed}
        disabled={seeding}
        style={{ fontSize: "12.5px" }}
      >
        {seeding ? "Initialisation..." : "Réinitialiser la démo"}
      </Button>

      <div
        style={{
          display: "flex",
          border: "1px solid var(--mist-line)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setPeriod("mois")}
          style={{
            background: period === "mois" ? "var(--ink)" : "var(--paper)",
            color: period === "mois" ? "#fff" : "var(--slate)",
            border: "none",
            padding: "7px 14px",
            fontSize: "12.5px",
            cursor: "pointer",
          }}
        >
          Ce mois
        </button>
        <button
          onClick={() => setPeriod("trimestre")}
          style={{
            background: period === "trimestre" ? "var(--ink)" : "var(--paper)",
            color: period === "trimestre" ? "#fff" : "var(--slate)",
            border: "none",
            padding: "7px 14px",
            fontSize: "12.5px",
            cursor: "pointer",
          }}
        >
          Ce trimestre
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Header
        title="Tableau de bord"
        subtitle="L'état de l'entreprise, en un coup d'œil"
        actions={actions}
      />

      <div className="content-body">
        {/* KPI Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <KpiCard
            label="Prospects actifs"
            value={stats?.prospectsActifs ?? 0}
            sub="dans le pipeline commercial"
          />
          <KpiCard
            label="Projets"
            value={stats?.projetsTotal ?? 0}
            unit="en cours"
            trend={`${stats?.projetsRetard ?? 0} en retard`}
            trendDirection="down"
          />
          <KpiCard
            label="Équipe"
            value={stats?.employesTotal ?? 0}
            unit="employés"
            sub={`${stats?.demandesEnAttente ?? 0} demandes en attente`}
          />
        </div>
      </div>
    </>
  );
}
