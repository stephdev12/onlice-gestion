"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

interface Task {
  _id: string;
  titre: string;
  priorite: string;
  echeance: string;
  assigne?: string;
  progression: number;
}

interface TaskItemProps {
  task: Task;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  canUpdateProgress: boolean;
}

export function TaskItem({ task, onUpdateProgress, onDelete, canDelete, canUpdateProgress }: TaskItemProps) {
  const [progress, setProgress] = useState(task.progression);

  const priorityLabels: Record<string, string> = {
    haute: "Haute",
    moyenne: "Moyenne",
    basse: "Basse",
  };

  const dotColor =
    progress >= 100
      ? "var(--teal)"
      : progress > 0
      ? "var(--orange)"
      : "var(--slate)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        border: "1px solid var(--mist-line)",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px",
        background: "var(--paper)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "13.5px", fontWeight: 500, flex: 1 }}>
          {task.titre}
        </span>
        <Badge variant={task.priorite as any}>{priorityLabels[task.priorite] || task.priorite}</Badge>
        {canDelete && <button
          onClick={() => onDelete(task._id)}
          style={{
            background: "none",
            border: "none",
            color: "var(--slate)",
            cursor: "pointer",
            padding: "2px 4px",
          }}
          title="Supprimer la tâche"
        >
          <Trash2 size={14} />
        </button>}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "11.5px",
          color: "var(--slate)",
          marginBottom: "10px",
        }}
      >
        <span>Échéance {formatDate(task.echeance)}</span>
        <span>·</span>
        <span>Assigné: {task.assigne || "—"}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          disabled={!canUpdateProgress}
          onChange={(e) => setProgress(parseInt(e.target.value, 10))}
          onMouseUp={() => onUpdateProgress(task._id, progress)}
          onTouchEnd={() => onUpdateProgress(task._id, progress)}
          style={{ flex: 1, accentColor: "var(--ink)", cursor: "pointer" }}
        />
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "11.5px",
            color: "var(--slate)",
            width: "36px",
            textAlign: "right",
          }}
        >
          {progress}%
        </span>
      </div>
    </motion.div>
  );
}
