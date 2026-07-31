"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    const params = Object.fromEntries(formData.entries());
    console.debug("SignInForm submit params:", params);

    try {
      await signIn("password", formData);
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "Échec de l'authentification. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "380px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={flow}
          initial={{ opacity: 0, x: flow === "signIn" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: flow === "signIn" ? 20 : -20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="field">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre.nom@onlice.cm"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="field-err"
          style={{ marginBottom: "16px", padding: "8px 12px", background: "var(--danger-tint)", borderRadius: "6px" }}
        >
          {error}
        </motion.div>
      )}

      <Button variant="accent" type="submit" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
        {loading
          ? "Chargement..."
          : flow === "signIn"
          ? "Se connecter à Onlice"
          : "Créer un compte"}
      </Button>

      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setFlow(flow === "signIn" ? "signUp" : "signIn");
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--slate)",
            fontSize: "13px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {flow === "signIn"
            ? "Nouveau sur Onlice ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </form>
  );
}
