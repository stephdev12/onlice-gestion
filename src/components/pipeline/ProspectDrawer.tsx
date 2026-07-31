"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { STAGES } from "@/lib/constants";
import { motion } from "motion/react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface TimelineEvent {
  _id?: string;
  label: string;
  date: string;
  type?: string;
}

interface ProspectDetail {
  _id: string;
  nom: string;
  entreprise?: string;
  tel?: string;
  origine: string;
  stage: string;
  rep?: string;
  timeline?: TimelineEvent[];
}

interface ProspectDrawerProps {
  prospect: ProspectDetail | null;
  onClose: () => void;
  onMoveStage: (id: string, newStage: string, stageLabel: string) => void;
  onAddNote: (id: string, text: string) => void;
  canEdit?: boolean;
}

export function ProspectDrawer({
  prospect,
  onClose,
  onMoveStage,
  onAddNote,
  canEdit = true,
}: ProspectDrawerProps) {
  const [noteText, setNoteText] = useState("");

  if (!prospect) return null;

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(prospect._id, noteText.trim());
    setNoteText("");
  };

  return (
    <Drawer
      isOpen={!!prospect}
      onClose={onClose}
      title={prospect.nom}
      subtitle={prospect.entreprise || "Prospect particulier"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "13px",
            color: "var(--slate)",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--mist-line)",
          }}
        >
          <div>Téléphone : <b style={{ color: "var(--ink)" }}>{prospect.tel || "—"}</b></div>
          <div>Origine : <b style={{ color: "var(--ink)" }}>{prospect.origine}</b></div>
          <div>Responsable : <b style={{ color: "var(--ink)" }}>{prospect.rep || "MK"}</b></div>
        </div>

        <div className="field">
          <label>Étape actuelle</label>
          <select
            value={prospect.stage}
            disabled={!canEdit}
            onChange={(e) => {
              const stageObj = STAGES.find((s) => s.id === e.target.value);
              if (stageObj) onMoveStage(prospect._id, e.target.value, stageObj.label);
            }}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--slate)",
              marginBottom: "12px",
            }}
          >
            Chronologie
          </p>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}
          >
            {(prospect.timeline || []).slice().reverse().map((ev, idx) => (
              <motion.li
                key={idx}
                variants={fadeInUp}
                style={{
                  position: "relative",
                  paddingLeft: "18px",
                  paddingBottom: "16px",
                  borderLeft: "1.5px solid var(--mist-line)",
                  marginLeft: "4px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-5px",
                    top: "3px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--teal)",
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "11px",
                    color: "var(--slate)",
                  }}
                >
                  {ev.date}
                </div>
                <div style={{ fontSize: "13.5px", marginTop: "2px" }}>{ev.label}</div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {canEdit && <div style={{ borderTop: "1px solid var(--mist-line)", paddingTop: "16px" }}>
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
            Ajouter une note
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex : Appel effectué, devis envoyé..."
              style={{ flex: 1, minHeight: "60px" }}
            />
            <Button variant="outline" onClick={handleAddNote} style={{ flexShrink: 0, padding: "10px 14px" }}>
              Ajouter
            </Button>
          </div>
        </div>}
      </div>
    </Drawer>
  );
}
