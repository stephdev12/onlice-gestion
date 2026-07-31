"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { WorkloadPanel } from "@/components/dashboard/WorkloadPanel";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { TopClients } from "@/components/dashboard/TopClients";
import { RepPerformance } from "@/components/dashboard/RepPerformance";
import { Card } from "@/components/ui/Card";
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

  const isCeo = profile?.role === "ceo";

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
          {isCeo && <KpiCard
            label="Chiffre d'affaires"
            value={stats?.ca ?? 0}
            unit="XAF"
            trend={stats?.caTrend ?? ""}
            trendDirection="up"
          />}
          {isCeo && <KpiCard
            label="Trésorerie"
            value={stats?.tresorerie ?? 0}
            unit="XAF"
            trend={stats?.tresorerieTrend ?? ""}
            trendDirection="down"
          />}
          <KpiCard
            label="Prospects actifs"
            value={stats?.prospectsActifs ?? 9}
            sub="dans le pipeline commercial"
          />
          <KpiCard
            label="Projets"
            value={stats?.projetsTotal ?? 3}
            unit="en cours"
            trend="1 en retard"
            trendDirection="down"
          />
          {isCeo && <KpiCard
            label="Devis envoyés"
            value={stats?.devisCount ?? 0}
            sub={stats?.devisSub ?? ""}
          />}
          <KpiCard
            label="Équipe"
            value={stats?.employesTotal ?? 5}
            unit="employés"
            sub={`${stats?.demandesEnAttente ?? 2} demandes en attente`}
          />
        </div>

        {/* Dashboard Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: "16px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isCeo && <Card hoverEffect={false}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--slate)",
                  marginBottom: "18px",
                }}
              >
                Revenus vs dépenses — 6 derniers mois
              </h3>
              <RevenueChart />
            </Card>}

            {isCeo && <Card hoverEffect={false}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--slate)",
                  marginBottom: "18px",
                }}
              >
                Charge de travail par équipe
              </h3>
              <WorkloadPanel />
            </Card>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isCeo && <Card hoverEffect={false}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--slate)",
                  marginBottom: "14px",
                }}
              >
                Projets en retard
              </h3>
              <AlertPanel />
            </Card>}

            <Card hoverEffect={false}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--slate)",
                  marginBottom: "14px",
                }}
              >
                Clients les plus rentables
              </h3>
              <TopClients />
            </Card>

            <Card hoverEffect={false}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--slate)",
                  marginBottom: "14px",
                }}
              >
                Performance commerciale
              </h3>
              <RepPerformance />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
