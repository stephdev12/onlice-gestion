"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const profile = useQuery(api.profiles.current);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // For Mobile tab bar: top 4 items + Plus button
  const mobilePrimary = enabledItems.slice(0, 4);
  const mobileSecondary = enabledItems.slice(4);

  const moreSheetModal =
    mounted && moreOpen
      ? createPortal(
          <AnimatePresence>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(13, 22, 29, 0.5)",
                  backdropFilter: "blur(6px)",
                }}
              />

              {/* Sheet content */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                style={{
                  position: "relative",
                  zIndex: 10000,
                  background: "var(--paper)",
                  borderTopLeftRadius: "24px",
                  borderTopRightRadius: "24px",
                  boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
                  padding: "20px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Drag pill */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                  onClick={() => setMoreOpen(false)}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "5px",
                      borderRadius: "3px",
                      background: "var(--slate)",
                      opacity: 0.3,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "var(--ink)",
                      margin: 0,
                    }}
                  >
                    Toutes les rubriques
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(false)}
                    style={{
                      background: "var(--mist)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--ink)",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* List of remaining items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mobileSecondary.map((item) => {
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
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          borderRadius: "14px",
                          textDecoration: "none",
                          background: isActive ? "var(--orange-tint)" : "var(--mist)",
                          color: isActive ? "var(--orange)" : "var(--ink)",
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "15px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight size={18} style={{ opacity: 0.5 }} />
                      </Link>
                    );
                  })}
                </div>

                {/* Profile info footer in mobile sheet */}
                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--mist-line)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div className="avatar" style={{ width: "36px", height: "36px" }}>
                    {avatarInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                      {profile?.name || "Utilisateur"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--slate)" }}>
                      {roleTitle}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR (visible only on screens >= 641px via CSS) ═══ */}
      <aside className="sidebar-desktop">
        <div>
          <div className="sidebar-logo">
            <Image
              src="/onlice_logo.png"
              alt="Onlice ERP"
              width={140}
              height={38}
              className="sidebar-logo-img"
              priority
            />
          </div>
          <nav className="sidebar-nav-desktop">
            {enabledItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={`desktop-${item.href}`}
                  href={item.href}
                  className={`sidebar-link-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="desktopActiveIndicator"
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

        <div className="sidebar-user-desktop">
          <div className="user-info">
            <div className="avatar">{avatarInitials}</div>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ink)" }}>
                {profile?.name || "Utilisateur"}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--slate)" }}>
                {roleTitle}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MOBILE BOTTOM TAB BAR (visible only on screens < 641px via CSS) ═══ */}
      <nav className="sidebar-mobile-bar" aria-label="Navigation principale">
        {mobilePrimary.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className={`mobile-tab-item ${isActive ? "active" : ""}`}
              onClick={() => setMoreOpen(false)}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {mobileSecondary.length > 0 && (
          <button
            type="button"
            className={`mobile-tab-item ${
              mobileSecondary.some((i) => pathname.startsWith(i.href)) ? "active" : ""
            }`}
            onClick={() => setMoreOpen(true)}
            aria-label="Plus de rubriques"
          >
            <MoreHorizontal size={22} />
            <span>Plus</span>
          </button>
        )}
      </nav>

      {moreSheetModal}
    </>
  );
}
