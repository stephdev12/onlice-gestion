"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import Image from "next/image";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const ensureCurrentUser = useMutation(api.profiles.ensureCurrentUser);
  const profile = useQuery(
    api.profiles.current,
    isAuthenticated ? {} : "skip"
  );

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

  // Show loading while:
  // 1. Auth is still loading
  // 2. User is authenticated but profile query hasn't returned yet (undefined)
  // 3. User is authenticated but profile is null (not created yet, ensureCurrentUser running)
  if (isLoading || !isAuthenticated || profile === undefined || profile === null) {
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
          <Image src="/onlice_logo.png" alt="Onlice" width={180} height={46} />
          <div style={{ fontSize: "13px", color: "var(--slate)", marginTop: 10 }}>
            {!isLoading && isAuthenticated
              ? "Initialisation de votre espace..."
              : "Vérification de l'authentification..."}
          </div>
        </div>
      </div>
    );
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
