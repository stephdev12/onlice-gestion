"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FinanceJournal } from "@/components/dashboard/FinanceJournal";
import { TopClients } from "@/components/dashboard/TopClients";
import { AddFinanceEntryDrawer } from "@/components/dashboard/AddFinanceEntryDrawer";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, ShieldAlert } from "lucide-react";

export default function FinancePage() {
  const profile = useQuery(api.profiles.current);
  const [period, setPeriod] = useState<"mois" | "trimestre">("mois");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const createEntry = useMutation(api.finance.create);

  const summary = useQuery(
    api.finance.summary,
    profile?.role === "ceo" ? { period } : "skip"
  );

  const isCeo = profile?.role === "ceo";

  if (profile === undefined) {
    return (
      <>
        <Header title="Trésorerie & Finances" subtitle="Chargement..." />
        <div className="content-body">
          <div style={{ padding: "40px", textAlign: "center", color: "var(--slate)" }}>
            Initialisation des données financières...
          </div>
        </div>
      </>
    );
  }

  if (!isCeo) {
    return (
      <>
        <Header
          title="Trésorerie & Finances"
          subtitle="Accès réservé Direction Générale"
        />
        <div className="content-body" style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
          <Card hoverEffect={false}>
            <div style={{ textAlign: "center", padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "var(--danger-tint, rgba(239, 68, 68, 0.1))",
                  color: "var(--danger)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert size={28} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--ink)" }}>
                Accès exclusivement réservé au CEO
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--slate)", maxWidth: "420px" }}>
                Les données de trésorerie, flux de caisse et marges financières sont des informations confidentielles réservées à la Direction Générale (CEO).
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  const actions = (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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
            padding: "7px 14px",
            fontSize: "12.5px",
            cursor: "pointer",
            fontWeight: period === "trimestre" ? 600 : 500,
          }}
        >
          Ce trimestre
        </button>
      </div>

      <Button variant="accent" onClick={() => setIsAddOpen(true)}>
        <Plus size={16} /> Nouveau mouvement
      </Button>
    </div>
  );

  return (
    <>
      <Header
        title="Trésorerie & Finances"
        subtitle="Pilotage stratégique des flux de caisse — Direction Générale"
        actions={actions}
      />

      <div className="content-body" style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
        {/* KPI Grid */}
        <div className="kpi-grid">
          <KpiCard
            label="Chiffre d'affaires (Entrées)"
            value={summary?.totalEntrees ?? 0}
            unit="XAF"
            trend="Période sélectionnée"
            trendDirection="up"
          />
          <KpiCard
            label="Dépenses & Sorties"
            value={summary?.totalSorties ?? 0}
            unit="XAF"
            trend="Période sélectionnée"
            trendDirection="down"
          />
          <KpiCard
            label="Bénéfice Net"
            value={summary?.benefice ?? 0}
            unit="XAF"
            trend={(summary?.benefice ?? 0) >= 0 ? "Résultat positif" : "Déficit temporaire"}
            trendDirection={(summary?.benefice ?? 0) >= 0 ? "up" : "down"}
          />
          <KpiCard
            label="Trésorerie disponible"
            value={summary?.balance ?? 0}
            unit="XAF"
            sub="Solde cumulé global"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0, width: "100%" }}>
            <Card hoverEffect={false}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--slate)",
                  marginBottom: "16px",
                }}
              >
                Revenus vs Dépenses — 6 derniers mois
              </h3>
              <RevenueChart period={period} />
            </Card>

            <Card hoverEffect={false}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  gap: "12px",
                  flexWrap: "wrap",
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
                  Journal complet de caisse
                </h3>
                <Button variant="outline" onClick={() => setIsAddOpen(true)} style={{ fontSize: "12px" }}>
                  <Plus size={14} />
                  Ajouter un mouvement
                </Button>
              </div>
              <FinanceJournal />
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0, width: "100%" }}>
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
                Principales sources de revenus
              </h3>
              <TopClients period={period} />
            </Card>
          </div>
        </div>
      </div>

      <AddFinanceEntryDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={(data) => {
          createEntry(data).catch((e) => console.error(e));
          setIsAddOpen(false);
        }}
      />
    </>
  );
}
