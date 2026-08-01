"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { todayISO } from "@/lib/utils";

interface AddProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titre: string;
    client?: string;
    description?: string;
    projectType?: "dev" | "marketing_digital" | "design" | "campagne_marketing" | "rapide";
    echeanceDefaut: string;
    equipe: string[];
  }) => void;
}

export function AddProjectDrawer({ isOpen, onClose, onSubmit }: AddProjectDrawerProps) {
  const [titre, setTitre] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<"dev" | "marketing_digital" | "design" | "campagne_marketing" | "rapide">("dev");
  const [echeance, setEcheance] = useState(todayISO());
  const [equipeText, setEquipeText] = useState("MK, SK");
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setErr(true);
      return;
    }
    const equipe = equipeText
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    onSubmit({
      titre: titre.trim(),
      client: client.trim(),
      description: description.trim(),
      projectType,
      echeanceDefaut: echeance || todayISO(),
      equipe,
    });

    setTitre("");
    setClient("");
    setDescription("");
    setErr(false);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau projet"
      subtitle="Création d'un projet d'entreprise"
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Titre du projet *</label>
          <input
            type="text"
            placeholder="Ex : Refonte site vitrine"
            value={titre}
            onChange={(e) => {
              setTitre(e.target.value);
              if (e.target.value.trim()) setErr(false);
            }}
          />
          {err && <div className="field-err">Le titre est requis.</div>}
        </div>

        <div className="field">
          <label>Client</label>
          <input
            type="text"
            placeholder="Ex : Boutique Ada"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            placeholder="Résumé et objectifs du projet"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ minHeight: "70px" }}
          />
        </div>

        <div className="field">
          <label>Type de projet</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as "dev" | "marketing_digital" | "design" | "campagne_marketing" | "rapide")}
          >
            <option value="dev">Developpement logiciel</option>
            <option value="marketing_digital">Marketing digital</option>
            <option value="design">Design / Branding</option>
            <option value="campagne_marketing">Campagne marketing</option>
            <option value="rapide">Projet rapide</option>
          </select>
        </div>

        <div className="field">
          <label>Échéance globale</label>
          <input
            type="date"
            value={echeance}
            onChange={(e) => setEcheance(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Équipe (initiales séparées par virgules)</label>
          <input
            type="text"
            placeholder="Ex : MK, SK, RT"
            value={equipeText}
            onChange={(e) => setEquipeText(e.target.value)}
          />
        </div>

        <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "12px" }}>
          Créer le projet
        </Button>
      </form>
    </Drawer>
  );
}
