"use client";

import { SignInForm } from "@/components/auth/SignInForm";
import { motion } from "motion/react";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 30%, #FDEDE5 0%, #FFFFFF 70%)",
        padding: "24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          onli<span style={{ color: "var(--orange)" }}>c</span>e
        </div>
        <div style={{ fontSize: "15px", color: "var(--slate)" }}>
          Plateforme ERP Écosystème Startup
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          borderRadius: "var(--radius)",
          background: "var(--paper)",
          border: "1px solid var(--mist-line)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <SignInForm />
      </motion.div>
    </div>
  );
}
