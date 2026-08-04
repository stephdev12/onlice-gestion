"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Trash2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export function FinanceJournal() {
  const entries = useQuery(api.finance.list);
  const removeEntry = useMutation(api.finance.remove);

  const handleDelete = (id: Id<"financeEntries">) => {
    removeEntry({ id }).catch((e) => console.error(e));
  };

  if (entries === undefined) return null;

  if (entries.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "var(--slate)", padding: "4px 0" }}>
        Aucune transaction enregistrée pour l&apos;instant.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "320px", overflowY: "auto", width: "100%", overflowX: "auto", minWidth: 0, wordBreak: "break-word" }}>
      {entries.slice(0, 20).map((e) => (
        <div
          key={e._id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            padding: "10px 0",
            borderBottom: "1px solid var(--mist-line)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 500 }}>
              {e.type === "entree" ? e.source || "Entrée" : e.motif || "Sortie"}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--slate)", marginTop: "1px" }}>
              {e.date}
              {e.description ? ` · ${e.description}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "13px",
                color: e.type === "entree" ? "var(--teal)" : "var(--danger)",
              }}
            >
              {e.type === "entree" ? "+" : "-"}
              {e.montant.toLocaleString()} XAF
            </span>
            <button
              onClick={() => handleDelete(e._id)}
              className="icon-btn"
              aria-label="Supprimer"
              style={{ padding: "4px" }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
