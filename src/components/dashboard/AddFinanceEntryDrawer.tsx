"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

interface AddFinanceEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "entree" | "sortie";
    montant: number;
    date: string;
    source?: string;
    motif?: string;
    description?: string;
  }) => void;
}

const today = () => new Date().toISOString().split("T")[0];

export function AddFinanceEntryDrawer({ isOpen, onClose, onSubmit }: AddFinanceEntryDrawerProps) {
  const [type, setType] = useState<"entree" | "sortie">("entree");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(today());
  const [source, setSource] = useState("");
  const [motif, setMotif] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");

  const reset = () => {
    setType("entree");
    setMontant("");
    setDate(today());
    setSource("");
    setMotif("");
    setDescription("");
    setErr("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(montant);
    if (!amount || amount <= 0) {
      setErr("Le montant doit être un nombre positif.");
      return;
    }
    if (type === "sortie" && !motif.trim()) {
      setErr("Précise la raison de cette sortie.");
      return;
    }

    onSubmit({
      type,
      montant: amount,
      date,
      source: type === "entree" ? source.trim() || undefined : undefined,
      motif: type === "sortie" ? motif.trim() : undefined,
      description: description.trim() || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle transaction"
      subtitle="Enregistre une entrée ou une sortie d'argent"
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Type de transaction</label>
          <div
            style={{
              display: "flex",
              border: "1px solid var(--mist-line)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setType("entree")}
              style={{
                flex: 1,
                background: type === "entree" ? "var(--teal)" : "var(--paper)",
                color: type === "entree" ? "#fff" : "var(--slate)",
                border: "none",
                padding: "9px 14px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Entrée
            </button>
            <button
              type="button"
              onClick={() => setType("sortie")}
              style={{
                flex: 1,
                background: type === "sortie" ? "var(--danger)" : "var(--paper)",
                color: type === "sortie" ? "#fff" : "var(--slate)",
                border: "none",
                padding: "9px 14px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Sortie
            </button>
          </div>
        </div>

        <div className="field">
          <label>Montant (XAF) *</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Ex : 150000"
            value={montant}
            onChange={(e) => {
              setMontant(e.target.value);
              if (err) setErr("");
            }}
          />
        </div>

        <div className="field">
          <label>Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {type === "entree" ? (
          <div className="field">
            <label>Source (provenance de l&apos;argent)</label>
            <input
              type="text"
              placeholder="Ex : Essomba Distribution"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        ) : (
          <div className="field">
            <label>Raison de la sortie *</label>
            <input
              type="text"
              placeholder="Ex : Salaire équipe, achat matériel…"
              value={motif}
              onChange={(e) => {
                setMotif(e.target.value);
                if (err) setErr("");
              }}
            />
          </div>
        )}

        <div className="field">
          <label>Description (optionnel)</label>
          <textarea
            rows={3}
            placeholder="Détails supplémentaires"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {err && <div className="field-err" style={{ marginBottom: "12px" }}>{err}</div>}

        <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "4px" }}>
          Enregistrer la transaction
        </Button>
      </form>
    </Drawer>
  );
}
