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
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Shield, Sparkles, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"mois" | "trimestre">("mois");
  const stats = useQuery(api.dashboard.stats, { period });
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

  const isCeo = stats?.isCeo ?? false;
  const isAdmin = stats?.isAdmin ?? false;

  const actions = (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      {isAdmin && (
        <Button
          variant="outline"
          onClick={handleSeed}
          disabled={seeding}
          style={{ fontSize: "12.5px" }}
        >
          <Sparkles size={14} />
          {seeding ? "Initialisation..." : "Réinitialiser les données de démo"}
        </Button>
      )}

      {isCeo && (
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
      )}
    </div>
  );

  return (
    <>
      <Header
        title="Tableau de bord"
        subtitle={
          isCeo
            ? "Vue d'ensemble stratégique et financière"
            : isAdmin
            ? "Gestion opérationnelle de l'équipe et des projets"
            : "Espace personnel et suivi de vos missions"
        }
        actions={actions}
      />

      <div className="content-body">
        {/* KPI Grid - Tailored by Role */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {isCeo ? (
            <>
              <KpiCard
                label="Chiffre d'affaires (CEO)"
                value={stats?.ca ?? 4850000}
                unit="XAF"
                trend={stats?.caTrend ?? undefined}
                trendDirection="up"
              />
              <KpiCard
                label="Trésorerie (CEO)"
                value={stats?.tresorerie ?? 2130000}
                unit="XAF"
                trend={stats?.tresorerieTrend ?? undefined}
                trendDirection="down"
              />
              <KpiCard
                label="Prospects actifs"
                value={stats?.prospectsActifs ?? 0}
                sub="dans le pipeline commercial"
              />
              <KpiCard
                label="Projets"
                value={stats?.projetsTotal ?? 0}
                unit="en cours"
                trend={stats?.projetsRetard ? `${stats.projetsRetard} en retard` : undefined}
                trendDirection="down"
              />
              <KpiCard
                label="Devis envoyés"
                value={stats?.devisCount ?? 0}
                sub={stats?.devisSub ?? undefined}
              />
              <KpiCard
                label="Équipe"
                value={stats?.employesTotal ?? 0}
                unit="employés"
                sub={`${stats?.demandesEnAttente ?? 0} demandes en attente`}
              />
            </>
          ) : isAdmin ? (
            <>
              <KpiCard
                label="Projets en cours"
                value={stats?.projetsTotal ?? 0}
                unit="projets"
                trend={stats?.projetsRetard ? `${stats.projetsRetard} en retard` : undefined}
                trendDirection="down"
              />
              <KpiCard
                label="Prospects actifs"
                value={stats?.prospectsActifs ?? 0}
                sub="dans le pipeline commercial"
              />
              <KpiCard
                label="Équipe gérée"
                value={stats?.employesTotal ?? 0}
                unit="membres"
                sub={`${stats?.demandesEnAttente ?? 0} demandes à traiter`}
              />
            </>
          ) : (
            <>
              <KpiCard
                label="Mes missions assignées"
                value={stats?.myTasksCount ?? 0}
                unit="missions"
                sub="Missions à réaliser"
              />
              <KpiCard
                label="Projets en cours"
                value={stats?.projetsTotal ?? 0}
                unit="projets"
                sub="Auxquels vous participez"
              />
            </>
          )}
        </div>

        {/* Dashboard Sections based on Role */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCeo ? "1.3fr 1fr" : "1fr",
            gap: "16px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isCeo && (
              <Card hoverEffect={false}>
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
                  Revenus vs dépenses — 6 derniers mois (Réservé Direction)
                </h3>
                <RevenueChart />
              </Card>
            )}

            {(isCeo || isAdmin) && (
              <Card hoverEffect={false}>
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
              </Card>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(isCeo || isAdmin) && (
              <>
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
                    Projets en retard
                  </h3>
                  <AlertPanel />
                </Card>

                {isCeo && (
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
                )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
