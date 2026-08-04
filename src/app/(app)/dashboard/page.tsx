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
import { FinanceJournal } from "@/components/dashboard/FinanceJournal";
import { AddFinanceEntryDrawer } from "@/components/dashboard/AddFinanceEntryDrawer";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Shield, Sparkles, CheckCircle2, Plus } from "lucide-react";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"mois" | "trimestre">("mois");
  const stats = useQuery(api.dashboard.stats, { period });
  const profile = useQuery(api.profiles.current);
  const seed = useMutation(api.seed.seedAll);
  const addFinanceEntry = useMutation(api.finance.create);
  const [seeding, setSeeding] = useState(false);
  const [financeDrawerOpen, setFinanceDrawerOpen] = useState(false);

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
      />

      {profile && profile.name && profile.role === "employe" && (
        <div style={{ padding: "12px 18px", fontSize: "16px", fontWeight: 600 }}>
          Hello "{profile.name}" !!
        </div>
      )}

      <div className="content-body" style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
        {/* KPI Grid - Tailored by Role */}
        <div className="kpi-grid">
          {isCeo ? (
            <>
              <KpiCard
                label="Chiffre d'affaires (CEO)"
                value={stats?.ca ?? 0}
                unit="XAF"
                trend={stats?.caTrend ?? undefined}
                trendDirection="up"
              />
              <KpiCard
                label="Trésorerie (CEO)"
                value={stats?.tresorerie ?? 0}
                unit="XAF"
                trend={stats?.tresorerieTrend ?? undefined}
                trendDirection={stats?.tresorerieUp === false ? "down" : "up"}
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
          className="dashboard-grid"
          style={!isCeo ? { gridTemplateColumns: "1fr" } : undefined}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isCeo && (
              <Card hoverEffect={false}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--slate)",
                      margin: 0,
                    }}
                  >
                    Revenus vs dépenses — 6 derniers mois (Réservé Direction)
                  </h3>
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
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: period === "mois" ? 600 : 500,
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
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: period === "trimestre" ? 600 : 500,
                      }}
                    >
                      Ce trimestre
                    </button>
                  </div>
                </div>
                <RevenueChart period={period} />
              </Card>
            )}

            {isCeo && (
              <Card hoverEffect={false}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    gap: "12px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--slate)",
                    }}
                  >
                    Journal de caisse
                  </h3>
                  <Button variant="outline" onClick={() => setFinanceDrawerOpen(true)} style={{ fontSize: "12.5px" }}>
                    <Plus size={14} />
                    Ajouter
                  </Button>
                </div>
                <FinanceJournal />
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
                      Meilleures sources de revenus
                    </h3>
                    <TopClients period={period} />
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

        {isAdmin && (
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button
              variant="outline"
              onClick={handleSeed}
              disabled={seeding}
              style={{ fontSize: "12.5px" }}
            >
              <Sparkles size={14} />
              {seeding ? "Initialisation..." : "Réinitialiser les données de démo"}
            </Button>
          </div>
        )}
      </div>

      {isCeo && (
        <AddFinanceEntryDrawer
          isOpen={financeDrawerOpen}
          onClose={() => setFinanceDrawerOpen(false)}
          onSubmit={(data) => {
            addFinanceEntry(data).catch((e) => console.error(e));
          }}
        />
      )}
    </>
  );
}
