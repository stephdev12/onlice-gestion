"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, todayISO } from "@/lib/utils";
import { DISPO_LABELS, TYPE_LABELS } from "@/lib/constants";
import { motion } from "motion/react";

interface Demande {
  _id: string;
  type: string;
  debut: string;
  fin: string;
  motif?: string;
  statut: string;
}

interface Rapport {
  _id: string;
  semaine: string;
  realisations: string;
  problemes?: string;
  besoins?: string;
  objectifs?: string;
  statut: string;
}

interface EmployeeDetail {
  _id: string;
  nom: string;
  initials: string;
  poste?: string;
  departement: string;
  embauche?: string;
  dispo: string;
  competences: string[];
  solde?: number | null;
  salaire?: number | null;
  demandes?: Demande[];
  rapports?: Rapport[];
}

interface EmployeeDrawerProps {
  employee: EmployeeDetail | null;
  onClose: () => void;
  onCreateDemande: (data: { type: string; debut: string; fin: string; motif?: string }) => void;
  onSubmitRapport: (data: { realisations: string; problemes?: string; besoins?: string; objectifs?: string }) => void;
  onValidateRapport: (rapportId: string) => void;
  canEdit: boolean;
}

export function EmployeeDrawer({
  employee,
  onClose,
  onCreateDemande,
  onSubmitRapport,
  onValidateRapport,
  canEdit,
}: EmployeeDrawerProps) {
  const [showSalary, setShowSalary] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveType, setLeaveType] = useState("conge");
  const [leaveDebut, setLeaveDebut] = useState(todayISO());
  const [leaveFin, setLeaveFin] = useState(todayISO());
  const [leaveMotif, setLeaveMotif] = useState("");

  const [showReportForm, setShowReportForm] = useState(false);
  const [rReal, setRReal] = useState("");
  const [rProb, setRProb] = useState("");
  const [rBesoin, setRBesoin] = useState("");
  const [rObj, setRObj] = useState("");

  if (!employee) return null;

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateDemande({
      type: leaveType,
      debut: leaveDebut,
      fin: leaveFin || leaveDebut,
      motif: leaveMotif.trim(),
    });
    setShowLeaveForm(false);
    setLeaveMotif("");
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rReal.trim()) return;
    onSubmitRapport({
      realisations: rReal.trim(),
      problemes: rProb.trim(),
      besoins: rBesoin.trim(),
      objectifs: rObj.trim(),
    });
    setShowReportForm(false);
    setRReal("");
    setRProb("");
    setRBesoin("");
    setRObj("");
  };

  const latestReport = (employee.rapports || [])
    .slice()
    .sort((a, b) => (a.semaine < b.semaine ? 1 : -1))[0];

  return (
    <Drawer
      isOpen={!!employee}
      onClose={onClose}
      title={employee.nom}
      subtitle={`${employee.poste || "—"} · ${employee.departement}`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "13px", color: "var(--slate)" }}>
          <div>Département : <b style={{ color: "var(--ink)" }}>{employee.departement}</b></div>
          <div>Depuis le : <b style={{ color: "var(--ink)" }}>{formatDate(employee.embauche)}</b></div>
          <div>Disponibilité : <b style={{ color: "var(--ink)" }}>{DISPO_LABELS[employee.dispo] || employee.dispo}</b></div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {employee.competences.map((c) => (
            <Badge key={c} variant="neutral">
              {c}
            </Badge>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <span>Salaire :</span>
          <span style={{ fontFamily: "'Geist Mono', monospace" }}>
            {employee.salaire
              ? showSalary
                ? `${employee.salaire.toLocaleString("fr-FR")} XAF`
                : "••••••"
              : "Facturation au forfait"}
          </span>
          {employee.salaire && (
            <button
              onClick={() => setShowSalary(!showSalary)}
              style={{
                fontSize: "12px",
                color: "var(--slate)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {showSalary ? "Masquer" : "Afficher"}
            </button>
          )}
        </div>

        {/* Section Congés */}
        <div style={{ borderTop: "1px solid var(--mist-line)", paddingTop: "16px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--slate)",
              marginBottom: "8px",
            }}
          >
            Congés
          </p>
          <div style={{ fontSize: "13.5px", marginBottom: "10px" }}>
            {employee.solde !== null && employee.solde !== undefined ? (
              <>
                <b style={{ fontFamily: "'Geist Mono', monospace" }}>{employee.solde}</b> jours restants sur 25
              </>
            ) : (
              "Freelance — pas de solde de congés"
            )}
          </div>

          {(employee.demandes || []).map((d) => (
            <div
              key={d._id}
              style={{
                border: "1px solid var(--mist-line)",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                  {TYPE_LABELS[d.type] || d.type}
                </span>
                <Badge
                  variant={
                    d.statut === "approuve"
                      ? "approved"
                      : d.statut === "refuse"
                      ? "rejected"
                      : "pending"
                  }
                >
                  {d.statut === "approuve"
                    ? "Approuvé"
                    : d.statut === "refuse"
                    ? "Refusé"
                    : "En attente"}
                </Badge>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--slate)" }}>
                {formatDate(d.debut)}
                {d.fin && d.fin !== d.debut ? ` → ${formatDate(d.fin)}` : ""}
              </div>
              {d.motif && (
                <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "2px" }}>
                  {d.motif}
                </div>
              )}
            </div>
          ))}

          {canEdit && (!showLeaveForm ? (
            <button
              onClick={() => setShowLeaveForm(true)}
              style={{
                width: "100%",
                fontSize: "12.5px",
                color: "var(--ink)",
                background: "var(--mist)",
                border: "1px dashed var(--mist-line)",
                borderRadius: "10px",
                padding: "9px",
                textAlign: "center",
                cursor: "pointer",
                marginTop: "6px",
              }}
            >
              + Nouvelle demande
            </button>
          ) : (
            <form
              onSubmit={handleLeaveSubmit}
              style={{
                border: "1px solid var(--mist-line)",
                borderRadius: "10px",
                padding: "12px",
                marginTop: "8px",
                background: "var(--mist)",
              }}
            >
              <div className="field">
                <label>Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="conge">Congé</option>
                  <option value="absence">Absence</option>
                  <option value="retard">Retard</option>
                  <option value="mission">Mission extérieure</option>
                  <option value="teletravail">Télétravail</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Date début</label>
                  <input
                    type="date"
                    value={leaveDebut}
                    onChange={(e) => setLeaveDebut(e.target.value)}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Date fin</label>
                  <input
                    type="date"
                    value={leaveFin}
                    onChange={(e) => setLeaveFin(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Motif</label>
                <textarea
                  placeholder="Ex : Vacances en famille"
                  value={leaveMotif}
                  onChange={(e) => setLeaveMotif(e.target.value)}
                  style={{ minHeight: "50px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLeaveForm(false)}
                  style={{ flex: 1 }}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" style={{ flex: 1 }}>
                  Envoyer
                </Button>
              </div>
            </form>
          ))}
        </div>

        {/* Section Rapport hebdomadaire */}
        <div style={{ borderTop: "1px solid var(--mist-line)", paddingTop: "16px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--slate)",
              marginBottom: "10px",
            }}
          >
            Rapport hebdomadaire
          </p>

          {!latestReport && canEdit ? (
            !showReportForm ? (
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--slate)",
                  border: "1px dashed var(--mist-line)",
                  borderRadius: "10px",
                  padding: "14px",
                  textAlign: "center",
                }}
              >
                Aucun rapport soumis pour l'instant.
                <br />
                <Button
                  variant="outline"
                  onClick={() => setShowReportForm(true)}
                  style={{ marginTop: "10px" }}
                >
                  Soumettre le rapport de la semaine
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div className="field">
                  <label>Qu'as-tu réalisé ?</label>
                  <textarea
                    value={rReal}
                    onChange={(e) => setRReal(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Quels problèmes ?</label>
                  <textarea
                    value={rProb}
                    onChange={(e) => setRProb(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Quels besoins ?</label>
                  <textarea
                    value={rBesoin}
                    onChange={(e) => setRBesoin(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Objectifs semaine prochaine ?</label>
                  <textarea
                    value={rObj}
                    onChange={(e) => setRObj(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary" style={{ width: "100%" }}>
                  Envoyer le rapport
                </Button>
              </form>
            )
          ) : (
            <div
              style={{
                border: "1px solid var(--mist-line)",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--slate)",
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  Semaine du {formatDate(latestReport.semaine)}
                </span>
                <Badge
                  variant={latestReport.statut === "valide" ? "approved" : "pending"}
                >
                  {latestReport.statut === "valide" ? "Validé" : "À valider"}
                </Badge>
              </div>

              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--slate)", textTransform: "uppercase", margin: "8px 0 2px" }}>
                Réalisations
              </p>
              <p style={{ fontSize: "13.5px" }}>{latestReport.realisations}</p>

              {latestReport.problemes && (
                <>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--slate)", textTransform: "uppercase", margin: "8px 0 2px" }}>
                    Problèmes
                  </p>
                  <p style={{ fontSize: "13.5px" }}>{latestReport.problemes}</p>
                </>
              )}

              {latestReport.statut === "a_valider" && (
                <Button
                  variant="approve"
                  onClick={() => onValidateRapport(latestReport._id)}
                  style={{ width: "100%", marginTop: "12px" }}
                >
                  Valider ce rapport
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
