"use client";

import Image from "next/image";
import { SignInForm } from "@/components/auth/SignInForm";
import { motion } from "motion/react";

export default function LoginPage() {
  return (
    <div
      className="login-page-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <Image
          src="/onlice_logo.png"
          alt="Onlice"
          width={300}
          height={100}
          style={{ width: "auto", height: "46px", objectFit: "contain", marginBottom: 12 }}
          priority
        />
        <div style={{ fontSize: "15px", color: "var(--slate)", fontWeight: 500 }}>
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
