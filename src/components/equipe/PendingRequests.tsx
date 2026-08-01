"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { TYPE_LABELS } from "@/lib/constants";

interface Demande {
  _id: string;
  employeNom: string;
  employeInitials: string;
  type: string;
  debut: string;
  fin: string;
  motif?: string;
}

interface PendingRequestsProps {
  requests: Demande[];
  onUpdateStatus: (id: string, status: "approuve" | "refuse") => void;
  canEdit?: boolean;
}

export function PendingRequests({ requests, onUpdateStatus, canEdit = true }: PendingRequestsProps) {
  if (requests.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "8px 0" }}>
        Aucune demande en attente.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <AnimatePresence>
        {requests.map((d) => (
          <motion.div
            key={d._id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              border: "1px solid var(--mist-line)",
              borderRadius: "10px",
              background: "var(--paper)",
              flexWrap: "wrap",
            }}
          >
            <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "11px" }}>
              {d.employeInitials}
            </div>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 600 }}>
                {d.employeNom}{" "}
                <span style={{ fontWeight: 400, color: "var(--slate)" }}>
                  — {TYPE_LABELS[d.type] || d.type}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "2px" }}>
                {formatDate(d.debut)}
                {d.fin && d.fin !== d.debut ? ` → ${formatDate(d.fin)}` : ""}
                {d.motif ? ` · ${d.motif}` : ""}
              </div>
            </div>
            {canEdit && <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="approve"
                onClick={() => onUpdateStatus(d._id, "approuve")}
              >
                Approuver
              </Button>
              <Button
                variant="reject"
                onClick={() => onUpdateStatus(d._id, "refuse")}
              >
                Refuser
              </Button>
            </div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
