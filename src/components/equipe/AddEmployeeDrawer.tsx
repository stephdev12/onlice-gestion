"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { todayISO } from "@/lib/utils";

interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nom: string;
    email: string;
    role: "admin" | "employe";
    poste?: string;
    departement: string;
    embauche?: string;
    dispo: string;
    competences: string[];
    salaire: number | null;
  }) => void;
  isCeo?: boolean;
}

export function AddEmployeeDrawer({ isOpen, onClose, onSubmit, isCeo = false }: AddEmployeeDrawerProps) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "employe">("employe");
  const [poste, setPoste] = useState("");
  const [departement, setDepartement] = useState("Commercial");
  const [embauche, setEmbauche] = useState(todayISO());
  const [dispo, setDispo] = useState("temps_plein");
  const [competencesText, setCompetencesText] = useState("");
  const [salaireText, setSalaireText] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !email.trim()) {
      setErr("Le nom et l'email sont requis.");
      return;
    }

    const competences = competencesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const salaire = salaireText ? parseInt(salaireText, 10) : null;

    onSubmit({
      nom: nom.trim(),
      email: email.trim().toLowerCase(),
      role,
      poste: poste.trim(),
      departement,
      embauche,
      dispo,
      competences,
      salaire,
    });

    setNom("");
    setEmail("");
    setRole("employe");
    setPoste("");
    setCompetencesText("");
    setSalaireText("");
    setErr("");
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvel employé"
      subtitle="Ajout à l'annuaire et attribution du rôle"
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Nom complet *</label>
          <input
            type="text"
            placeholder="Ex : Grace Ateba"
            value={nom}
            onChange={(e) => {
              setNom(e.target.value);
              if (e.target.value.trim() && email.trim()) setErr("");
            }}
          />
        </div>

        <div className="field">
          <label>Adresse Email * (utilisée pour la connexion)</label>
          <input
            type="email"
            placeholder="grace.ateba@onlice.cm"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (nom.trim() && e.target.value.trim()) setErr("");
            }}
          />
          {err && <div className="field-err">{err}</div>}
        </div>

        <div className="field">
          <label>Rôle et Droits d'accès</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="employe">Employé (Accès restreint aux tâches attribuées)</option>
            {isCeo && <option value="admin">Administrateur (Gestion des projets & équipes)</option>}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Poste</label>
            <input
              type="text"
              placeholder="Ex : Comptable"
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
            />
          </div>

          <div className="field" style={{ flex: 1 }}>
            <label>Département</label>
            <select
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
            >
              <option>Direction</option>
              <option>Commercial</option>
              <option>Marketing</option>
              <option>Développement</option>
              <option>Design</option>
              <option>RH</option>
              <option>Finance</option>
              <option>Support</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Date d'embauche</label>
            <input
              type="date"
              value={embauche}
              onChange={(e) => setEmbauche(e.target.value)}
            />
          </div>

          <div className="field" style={{ flex: 1 }}>
            <label>Disponibilité</label>
            <select value={dispo} onChange={(e) => setDispo(e.target.value)}>
              <option value="temps_plein">Temps plein</option>
              <option value="mi_temps">Mi-temps</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Compétences (séparées par virgules)</label>
          <input
            type="text"
            placeholder="Ex : Excel, Comptabilité"
            value={competencesText}
            onChange={(e) => setCompetencesText(e.target.value)}
          />
        </div>

        {isCeo && (
          <div className="field">
            <label>Salaire (XAF, réservé au CEO)</label>
            <input
              type="number"
              placeholder="Ex : 300000"
              value={salaireText}
              onChange={(e) => setSalaireText(e.target.value)}
            />
          </div>
        )}

        <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "12px" }}>
          Ajouter à l'équipe
        </Button>
      </form>
    </Drawer>
  );
}
