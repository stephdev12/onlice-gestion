"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { REPORT_MOOD_LABELS } from "@/lib/constants";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";

export default function RapportsPage() {
  const profile = useQuery(api.profiles.current);
  const isManager = profile?.role === "ceo" || profile?.role === "admin";

  const myReports = useQuery(api.reports.mine, profile?.role === "employe" ? {} : "skip");
  const reviewReports = useQuery(api.reports.reviewList, isManager ? { status: "a_valider" } : "skip");

  const submitMine = useMutation(api.reports.submitMine);
  const validate = useMutation(api.reports.validate);

  const [form, setForm] = useState({
    periodeType: "journalier" as "journalier" | "hebdomadaire",
    dateRef: new Date().toISOString().split("T")[0],
    realisations: "",
    objectifs: "",
    problemes: "",
    previsions: "",
    humeur: "bon" as "excellent" | "bon" | "moyen" | "difficile",
  });

  const canSubmit = useMemo(() => !!form.realisations.trim(), [form.realisations]);

  return (
    <>
      <Header
        title="Rapports d'activité"
        subtitle={isManager ? "Validation des rapports employés" : "Rapport journalier / hebdomadaire"}
      />

      <div className="content-body" style={{ display: "grid", gap: "16px" }}>
        {profile?.role === "employe" && (
          <div className="report-shell">
            <h3>Soumettre un rapport</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSubmit) return;
                await submitMine({
                  periodeType: form.periodeType,
                  dateRef: form.dateRef,
                  realisations: form.realisations,
                  objectifs: form.objectifs || undefined,
                  problemes: form.problemes || undefined,
                  previsions: form.previsions || undefined,
                  humeur: form.humeur,
                });
                setForm((f) => ({
                  ...f,
                  realisations: "",
                  objectifs: "",
                  problemes: "",
                  previsions: "",
                }));
              }}
            >
              <div className="form-row">
                <div className="field">
                  <label>Type</label>
                  <select value={form.periodeType} onChange={(e) => setForm((f) => ({ ...f, periodeType: e.target.value as "journalier" | "hebdomadaire" }))}>
                    <option value="journalier">Journalier</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                  </select>
                </div>
                <div className="field">
                  <label>Date de référence</label>
                  <input type="date" value={form.dateRef} onChange={(e) => setForm((f) => ({ ...f, dateRef: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Humeur</label>
                  <select value={form.humeur} onChange={(e) => setForm((f) => ({ ...f, humeur: e.target.value as "excellent" | "bon" | "moyen" | "difficile" }))}>
                    <option value="excellent">Excellent</option>
                    <option value="bon">Bon</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Ce qui a été fait</label>
                <textarea required value={form.realisations} onChange={(e) => setForm((f) => ({ ...f, realisations: e.target.value }))} />
              </div>
              <div className="field">
                <label>Objectifs</label>
                <textarea value={form.objectifs} onChange={(e) => setForm((f) => ({ ...f, objectifs: e.target.value }))} />
              </div>
              <div className="field">
                <label>Défis rencontrés</label>
                <textarea value={form.problemes} onChange={(e) => setForm((f) => ({ ...f, problemes: e.target.value }))} />
              </div>
              <div className="field">
                <label>Prévisions / plan suivant</label>
                <textarea value={form.previsions} onChange={(e) => setForm((f) => ({ ...f, previsions: e.target.value }))} />
              </div>
              <Button type="submit" variant="primary" disabled={!canSubmit}>Envoyer le rapport</Button>
            </form>

            <div className="report-list">
              <h4>Mes rapports</h4>
              {(myReports || []).map((report) => (
                <div key={report._id} className="report-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <strong>{report.periodeType || "hebdomadaire"} · {report.semaine}</strong>
                    <Badge variant={report.statut === "valide" ? "approved" : "pending"}>{report.statut === "valide" ? "Validé" : "À valider"}</Badge>
                  </div>
                  <p>{report.realisations}</p>
                </div>
              ))}
              {myReports && myReports.length === 0 && <div className="kanban-empty">Aucun rapport envoyé pour le moment.</div>}
            </div>
          </div>
        )}

        {isManager && (
          <div className="report-shell">
            <h3>Rapports à valider</h3>
            <div className="report-list">
              {(reviewReports || []).map((report) => (
                <div key={report._id} className="report-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <strong>{report.employeNom}</strong>
                      <div style={{ fontSize: "12px", color: "var(--slate)" }}>{report.employePoste}</div>
                    </div>
                    <Badge variant="pending">{report.periodeType || "hebdomadaire"}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "6px" }}>
                    Référence: {report.semaine} · Humeur: {REPORT_MOOD_LABELS[report.humeur || "bon"] || "Bon"}
                  </div>
                  <p><strong>Fait:</strong> {report.realisations}</p>
                  {report.objectifs && <p><strong>Objectifs:</strong> {report.objectifs}</p>}
                  {report.problemes && <p><strong>Défis:</strong> {report.problemes}</p>}
                  {report.previsions && <p><strong>Prévisions:</strong> {report.previsions}</p>}
                  <Button variant="approve" onClick={() => void validate({ id: report._id })}>
                    Valider
                  </Button>
                </div>
              ))}
              {reviewReports && reviewReports.length === 0 && <div className="kanban-empty">Aucun rapport en attente.</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
