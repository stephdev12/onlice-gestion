"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LogOut,
  User,
  Moon,
  Sun,
  Download,
  Shield,
  ChevronDown,
} from "lucide-react";
import { dropdownOpen, backdropFade } from "@/lib/animations";

type ThemeMode = "light" | "dark";

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("onlice-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function ProfileDropdown() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.current);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolvedTheme = getPreferredTheme();
    setTheme(resolvedTheme);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("onlice-theme", nextTheme);
  };

  const roleLabel =
    profile?.role === "ceo"
      ? "CEO (Direction)"
      : profile?.role === "admin"
      ? "Administrateur"
      : "Employé";

  const roleBadgeColor =
    profile?.role === "ceo"
      ? { bg: "var(--orange-tint)", color: "var(--orange)" }
      : profile?.role === "admin"
      ? { bg: "var(--teal-tint)", color: "var(--teal)" }
      : { bg: "var(--mist)", color: "var(--slate)" };

  const avatarInitials =
    profile?.role === "ceo" ? "CE" : profile?.role === "admin" ? "AD" : "EM";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* ── Trigger ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 12px 6px 6px",
          borderRadius: "14px",
          border: `1px solid ${isOpen ? "var(--ink)" : "var(--mist-line)"}`,
          background: "var(--paper)",
          cursor: "pointer",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          ...(isOpen ? { boxShadow: "var(--shadow-sm)" } : {}),
        }}
      >
        {/* Avatar with gradient ring */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "var(--gradient)",
            padding: "2px",
            flexShrink: 0,
          }}
        >
          <div
            className="avatar"
            style={{
              width: "100%",
              height: "100%",
              fontSize: "11px",
              borderRadius: "50%",
            }}
          >
            {avatarInitials}
          </div>
        </div>

        {/* Name + role (desktop only) */}
        <div className="profile-dropdown-info" style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: "1.2",
              letterSpacing: "-0.01em",
            }}
          >
            {profile?.name || "Utilisateur"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--slate)",
              lineHeight: "1.2",
            }}
          >
            {roleLabel}
          </div>
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", color: "var(--slate)", flexShrink: 0 }}
          className="profile-dropdown-chevron"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* ── Dropdown ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownOpen}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              width: "240px",
              background: "var(--paper)",
              border: "1px solid var(--mist-line)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-lg)",
              padding: "8px",
              zIndex: 200,
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Profile item */}
            <DropdownItem
              icon={<User size={16} />}
              label="Profil"
              value={
                <span
                  style={{
                    background: roleBadgeColor.bg,
                    color: roleBadgeColor.color,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    fontWeight: 600,
                  }}
                >
                  {profile?.role?.toUpperCase()}
                </span>
              }
            />

            {/* Theme toggle */}
            <DropdownItem
              icon={theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              label={theme === "light" ? "Mode sombre" : "Mode clair"}
              onClick={toggleTheme}
            />

            {/* Install app */}
            {installEvent && (
              <DropdownItem
                icon={<Download size={16} />}
                label="Installer l'app"
                onClick={async () => {
                  await installEvent.prompt();
                  await installEvent.userChoice;
                  setInstallEvent(null);
                  setIsOpen(false);
                }}
              />
            )}

            {/* Separator */}
            <div
              style={{
                height: "1px",
                margin: "6px 0",
                background:
                  "linear-gradient(to right, transparent, var(--mist-line), transparent)",
              }}
            />

            {/* Sign out */}
            <button
              type="button"
              onClick={() => void signOut()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                borderRadius: "10px",
                background: "var(--danger-tint)",
                cursor: "pointer",
                transition: "background 0.15s ease",
                fontFamily: "inherit",
              }}
            >
              <LogOut size={16} style={{ color: "var(--danger)" }} />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--danger)",
                }}
              >
                Se déconnecter
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Dropdown Item ──────────────────────────────────────────────────── */
function DropdownItem({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "10px 12px",
        border: "1px solid transparent",
        borderRadius: "10px",
        background: "transparent",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.15s ease, border-color 0.15s ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--mist)";
        e.currentTarget.style.borderColor = "var(--mist-line)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <span style={{ color: "var(--slate)", display: "flex", flexShrink: 0 }}>
        {icon}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--ink)",
          textAlign: "left",
        }}
      >
        {label}
      </span>
      {value && <div style={{ flexShrink: 0 }}>{value}</div>}
    </button>
  );
}
