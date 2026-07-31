"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { 
  LayoutDashboard, 
  GitPullRequest, 
  FolderKanban, 
  Users, 
  Wallet, 
  FileText, 
  LogOut 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const ensureCurrentUser = useMutation(api.profiles.ensureCurrentUser);
  const profile = useQuery(api.profiles.current);

  useEffect(() => {
    if (profile === undefined) return;
    if (profile === null) void ensureCurrentUser();
  }, [ensureCurrentUser, profile]);

  const isCeo = profile?.role === "ceo";
  const isAdmin = profile?.role === "admin";
  const canManage = isCeo || isAdmin;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
    { href: "/pipeline", label: "Pipeline", icon: GitPullRequest, enabled: canManage },
    { href: "/projets", label: "Projets", icon: FolderKanban, enabled: true },
    { href: "/equipe", label: "Équipe", icon: Users, enabled: canManage },
    { href: "/finance", label: "Finance (Bientôt)", icon: Wallet, enabled: false },
    { href: "/documents", label: "Documents (Bientôt)", icon: FileText, enabled: false },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          onli<span className="c">c</span>e
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            if (!item.enabled) {
              return (
                <div key={item.href} className="sidebar-link sidebar-disabled">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
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
            <div className="avatar">{isCeo ? "CE" : isAdmin ? "AD" : "EM"}</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{isCeo ? "CEO" : isAdmin ? "Administrateur" : "Employé"}</div>
            <div style={{ fontSize: "11px", color: "var(--slate)" }}>{isCeo ? "Accès financier et gestion" : isAdmin ? "Gestion équipe et projets" : "Missions attribuées"}</div>
          </div>
        </div>
        <button
          onClick={() => void signOut()}
          className="icon-btn"
          title="Se déconnecter"
          style={{ cursor: "pointer" }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
