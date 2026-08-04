"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import {
  LayoutDashboard,
  GitPullRequest,
  FolderKanban,
  Users,
  Wallet,
  FileText,
  ClipboardList,
  MoreHorizontal,
  X,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const profile = useQuery(api.profiles.current);
  const [moreOpen, setMoreOpen] = useState(false);

  const isCeo = profile?.role === "ceo";
  const isAdmin = profile?.role === "admin";
  const canManage = isCeo || isAdmin;

  const roleTitle = isCeo
    ? "CEO (Direction)"
    : isAdmin
    ? "Administrateur"
    : "Employé";

  const avatarInitials = isCeo ? "CE" : isAdmin ? "AD" : "EM";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
    { href: "/pipeline", label: "Pipeline", icon: GitPullRequest, enabled: canManage },
    { href: "/projets", label: "Projets", icon: FolderKanban, enabled: true },
    { href: "/equipe", label: "Équipe", icon: Users, enabled: canManage },
    { href: "/rapports", label: "Rapports", icon: ClipboardList, enabled: true },
    { href: "/finance", label: "Finance", icon: Wallet, enabled: isCeo },
    { href: "/documents", label: "Documents", icon: FileText, enabled: true },
  ];

  const enabledItems = navItems.filter((item) => item.enabled);

  // Mobile: show max 4 items + "More" button
  const mobileItems = enabledItems.slice(0, 4);
  const moreItems = enabledItems.slice(4);

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <Image
            src="/onlice_logo.png"
            alt="Onlice"
            width={120}
            height={34}
            className="sidebar-logo-img"
          />
        </div>
        <nav className="sidebar-nav">
          {/* Mobile: show limited items + more */}
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMoreOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      bottom: 6,
                      width: 3,
                      background: "var(--gradient)",
                      borderRadius: "0 3px 3px 0",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* More button for overflow items (mobile only) */}
          {moreItems.length > 0 && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={`sidebar-link ${
                  moreItems.some((i) => pathname.startsWith(i.href))
                    ? "active"
                    : ""
                }`}
                onClick={() => setMoreOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  width: "100%",
                }}
              >
                {moreOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
                <span>Plus</span>
              </button>

              {/* More dropdown */}
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="sidebar-more-menu"
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      right: 0,
                      background: "var(--paper)",
                      border: "1px solid var(--mist-line)",
                      borderRadius: "var(--radius)",
                      boxShadow: "var(--shadow-lg)",
                      padding: "6px",
                      zIndex: 100,
                      minWidth: "160px",
                    }}
                  >
                    {moreItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            color: isActive ? "var(--ink)" : "var(--slate)",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: "13px",
                            background: isActive ? "var(--mist)" : "transparent",
                            transition: "background 0.1s",
                          }}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Desktop: show ALL items (via CSS the more button is only visible on mobile) */}
          {moreItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={`desktop-${item.href}`}
                href={item.href}
                className={`sidebar-link sidebar-link-desktop-extra ${isActive ? "active" : ""}`}
                style={{ display: "none" }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      bottom: 6,
                      width: 3,
                      background: "var(--gradient)",
                      borderRadius: "0 3px 3px 0",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="avatar">{avatarInitials}</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>
              {profile?.name || "Utilisateur"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--slate)" }}>
              {roleTitle}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Show desktop-extra links only on desktop */
        @media (min-width: 641px) {
          .sidebar-link-desktop-extra {
            display: flex !important;
          }
          .sidebar-more-menu {
            display: none !important;
          }
          /* Hide the More button on desktop */
          .sidebar-nav > div:last-of-type {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
