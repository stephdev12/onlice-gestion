"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/Select";
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

const PROJECT_TYPE_OPTIONS = [
  { value: "dev", label: "🖥️ Développement logiciel" },
  { value: "marketing_digital", label: "📢 Marketing digital" },
  { value: "design", label: "🎨 Design / Branding" },
  { value: "campagne_marketing", label: "📣 Campagne marketing" },
  { value: "rapide", label: "⚡ Projet rapide" },
];

export function AddProjectDrawer({ isOpen, onClose, onSubmit }: AddProjectDrawerProps) {
  const [titre, setTitre] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("dev");
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
      projectType: projectType as any,
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
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <TextInput
          value={titre}
          onChange={(v) => {
            setTitre(v);
            if (v.trim()) setErr(false);
          }}
          label="Titre du projet"
          placeholder="Ex : Refonte site vitrine"
          required
          error={err ? "Le titre est requis." : undefined}
        />

        <TextInput
          value={client}
          onChange={setClient}
          label="Client"
          placeholder="Ex : Boutique Ada"
        />

        <TextInput
          value={description}
          onChange={setDescription}
          label="Description"
          placeholder="Résumé et objectifs du projet"
          multiline
          rows={3}
        />

        <Select
          value={projectType}
          onChange={setProjectType}
          options={PROJECT_TYPE_OPTIONS}
          label="Type de projet"
        />

        <TextInput
          value={echeance}
          onChange={setEcheance}
          label="Échéance globale"
          type="date"
        />

        <TextInput
          value={equipeText}
          onChange={setEquipeText}
          label="Équipe (initiales séparées par virgules)"
          placeholder="Ex : MK, SK, RT"
        />

        <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "4px" }}>
          Créer le projet
        </Button>
      </form>
    </Drawer>
  );
}
