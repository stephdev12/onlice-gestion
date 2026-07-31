"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

interface AddProspectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nom: string;
    entreprise?: string;
    tel?: string;
    origine: string;
    action?: string;
    rep?: string;
  }) => void;
}

export function AddProspectDrawer({ isOpen, onClose, onSubmit }: AddProspectDrawerProps) {
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [tel, setTel] = useState("");
  const [origine, setOrigine] = useState("Facebook");
  const [action, setAction] = useState("");
  const [rep, setRep] = useState("MK");
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setErr(true);
      return;
    }
    onSubmit({
      nom: nom.trim(),
      entreprise: entreprise.trim(),
      tel: tel.trim(),
      origine,
      action: action.trim(),
      rep: rep.trim().toUpperCase(),
    });
    setNom("");
    setEntreprise("");
    setTel("");
    setAction("");
    setErr(false);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau prospect"
      subtitle="Ajouté à l'étape 'Nouveau prospect'"
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Nom complet *</label>
          <input
            type="text"
            placeholder="Ex : Paul Etoundi"
            value={nom}
            onChange={(e) => {
              setNom(e.target.value);
              if (e.target.value.trim()) setErr(false);
            }}
          />
          {err && <div className="field-err">Le nom est requis.</div>}
        </div>

        <div className="field">
          <label>Entreprise</label>
          <input
            type="text"
            placeholder="Ex : Boutique Ada"
            value={entreprise}
            onChange={(e) => setEntreprise(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Téléphone / WhatsApp</label>
          <input
            type="text"
            placeholder="+237 6 …"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Origine du prospect</label>
          <select value={origine} onChange={(e) => setOrigine(e.target.value)}>
            <option>Facebook</option>
            <option>Instagram</option>
            <option>WhatsApp</option>
            <option>Référence</option>
            <option>Site web</option>
            <option>Salon</option>
            <option>Autre</option>
          </select>
        </div>

        <div className="field">
          <label>Prochaine action</label>
          <input
            type="text"
            placeholder="Ex : Premier appel demain 10h"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Responsable (initiales)</label>
          <input
            type="text"
            maxLength={2}
            placeholder="Ex : MK"
            value={rep}
            onChange={(e) => setRep(e.target.value)}
          />
        </div>

        <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "12px" }}>
          Ajouter le prospect
        </Button>
      </form>
    </Drawer>
  );
}
