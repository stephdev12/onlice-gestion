"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { STAGES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";

interface Prospect {
  _id: string;
  nom: string;
  entreprise?: string;
  tel?: string;
  origine: string;
  stage: string;
  action?: string;
  rep?: string;
}

interface KanbanBoardProps {
  prospects: Prospect[];
  onSelectProspect: (id: string) => void;
  onMoveStage: (id: string, newStage: string, stageLabel: string) => void;
  canEdit?: boolean;
}

export function KanbanBoard({ prospects, onSelectProspect, onMoveStage, canEdit = true }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const stageProspects = prospects.filter((p) => p.stage === stage.id);
        const dotClass =
          stage.group === "new"
            ? "var(--slate)"
            : stage.group === "progress"
            ? "var(--orange)"
            : "var(--teal)";

        return (
          <div key={stage.id} className="kanban-column">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 4px 12px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: dotClass,
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>{stage.label}</span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--slate)",
                  marginLeft: "auto",
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {stageProspects.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              <AnimatePresence mode="popLayout">
                {stageProspects.map((p) => (
                  <motion.div
                    key={p._id}
                    layoutId={p._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <Card
                      onClick={() => onSelectProspect(p._id)}
                      hoverEffect
                      className="pcard"
                    >
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{p.nom}</div>
                      <div style={{ fontSize: "12.5px", color: "var(--slate)", marginTop: "1px" }}>
                        {p.entreprise || "—"}
                      </div>

                      <div style={{ marginTop: "10px" }}>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "100px",
                            background: "var(--mist)",
                            color: "var(--slate)",
                          }}
                        >
                          {p.origine}
                        </span>
                      </div>

                      {p.action && (
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "var(--slate)",
                            marginTop: "8px",
                            lineHeight: "1.4",
                          }}
                        >
                          → {p.action}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "12px",
                        }}
                      >
                        <select
                          value={p.stage}
                          disabled={!canEdit}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newStageObj = STAGES.find((s) => s.id === e.target.value);
                            if (newStageObj) {
                              onMoveStage(p._id, e.target.value, newStageObj.label);
                            }
                          }}
                          style={{
                            fontSize: "11px",
                            border: "1px solid var(--mist-line)",
                            borderRadius: "6px",
                            padding: "3px 5px",
                            color: "var(--slate)",
                            background: "var(--paper)",
                            maxWidth: "120px",
                          }}
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <div className="avatar" style={{ width: "24px", height: "24px", fontSize: "10px" }}>
                          {p.rep || "MK"}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
