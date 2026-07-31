"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const ensureCurrentUser = useMutation(api.profiles.ensureCurrentUser);
  const profile = useQuery(api.profiles.current);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && profile === null) {
      void ensureCurrentUser();
    }
  }, [isAuthenticated, profile, ensureCurrentUser]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--mist)",
          fontFamily: "'Geist', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
            onli<span style={{ color: "var(--orange)" }}>c</span>e
          </div>
          <div style={{ fontSize: "13px", color: "var(--slate)" }}>Vérification de l'authentification...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
