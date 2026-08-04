"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, Check, Sparkles } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { ProfileDropdown } from "./ProfileDropdown";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const notifications = useQuery(api.projects.notifications);
  const markRead = useMutation(api.projects.markNotificationRead);
  const updateTaskProgress = useMutation(api.projects.updateTaskProgress);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = (notifications || []).filter((n) => !n.readAt).length;

  return (
    <>
      <header className="headbar">
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>

        <div className="headbar-actions">
          {actions}

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="icon-btn"
            style={{ position: "relative" }}
            title="Notifications & Missions"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "var(--orange)",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </header>

      {/* Notifications / Missions Drawer */}
      <Drawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Missions & Notifications"
        subtitle="Vos notifications de missions assignées"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(!notifications || notifications.length === 0) ? (
            <div style={{ fontSize: "13px", color: "var(--slate)", padding: "20px 0", textAlign: "center" }}>
              Aucune notification de mission pour le moment.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  border: "1px solid var(--mist-line)",
                  borderRadius: "10px",
                  padding: "12px",
                  background: n.readAt ? "var(--paper)" : "var(--orange-tint)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>
                    <Sparkles size={14} style={{ color: "var(--orange)", display: "inline", marginRight: "6px" }} />
                    {n.message}
                  </div>
                  {!n.readAt && (
                    <button
                      onClick={async () => {
                        await markRead({ id: n._id });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "11px",
                        color: "var(--teal)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Lu
                    </button>
                  )}
                </div>

                <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={async () => {
                      await updateTaskProgress({ id: n.taskId, progression: 100 });
                      await markRead({ id: n._id });
                    }}
                    className="btn btn-approve"
                    style={{ fontSize: "11.5px", padding: "6px 10px" }}
                  >
                    <Check size={12} /> Marquer 100% Terminé
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  );
}
