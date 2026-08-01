"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      // The Convex Auth client throws a cryptic "Cannot read properties of
      // null (reading 'redirect')" when the server rejects bad credentials
      // (wrong password, or no account yet for this email) — show a clear message instead.
      const message: string = err?.message || "";
      if (message.includes("reading 'redirect'") || message.toLowerCase().includes("invalidaccountid") || message.toLowerCase().includes("invalidsecret")) {
        setError(
          flow === "signIn"
            ? "Email ou mot de passe incorrect, ou compte pas encore créé. Si vous venez d'être ajouté à l'équipe, utilisez « Créer un compte » avec le même email."
            : "Impossible de créer le compte. Cet email est peut-être déjà utilisé."
        );
      } else {
        setError(message || "Échec de l'authentification. Vérifiez vos identifiants.");
      }
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
            <div className="password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
