"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LayoutDashboard,
  GitPullRequest,
  FolderKanban,
  Users,
  Wallet,
  FileText,
  ClipboardList,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const profile = useQuery(api.profiles.current);

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
    { href: "/projets", label: "Projets / Missions", icon: FolderKanban, enabled: true },
    { href: "/equipe", label: "Équipe", icon: Users, enabled: canManage },
    { href: "/rapports", label: "Rapports", icon: ClipboardList, enabled: true },
    { href: "/finance", label: "Finance (CEO)", icon: Wallet, enabled: isCeo },
    { href: "/documents", label: "Documents", icon: FileText, enabled: false },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <Image src="/onlice_logo.png" alt="Onlice" width={120} height={34} className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            if (!item.enabled) {
              return null; // Completely hide restricted pages for employees
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
          <div className="avatar">{avatarInitials}</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{profile?.name || "Utilisateur"}</div>
            <div style={{ fontSize: "11px", color: "var(--slate)" }}>{roleTitle}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
