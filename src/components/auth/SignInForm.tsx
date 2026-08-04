"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Mail, User, Lock } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setNameInput] = useState("");
  const [password, setPassword] = useState("");

  const setName = useMutation(api.profiles.setName);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("flow", flow);
    if (flow === "signUp") {
      formData.set("name", name);
    }

    try {
      await signIn("password", formData);
      if (flow === "signUp" && name.trim()) {
        try {
          await setName({ name: name.trim() });
        } catch (e) {
          console.debug("Could not set profile name:", e);
        }
      }
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Sign-in error:", err);
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
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <TextInput
            value={email}
            onChange={setEmail}
            label="Adresse Email"
            placeholder="votre.nom@onlice.cm"
            type="email"
            icon={<Mail size={16} />}
            required
            name="email"
          />

          {flow === "signUp" && (
            <TextInput
              value={name}
              onChange={setNameInput}
              label="Nom complet"
              placeholder="Jean Dupont"
              icon={<User size={16} />}
              required
              name="name"
            />
          )}

          <TextInput
            value={password}
            onChange={setPassword}
            label="Mot de passe"
            placeholder="••••••••"
            type="password"
            icon={<Lock size={16} />}
            required
            name="password"
          />
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="field-err"
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "var(--danger-tint)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12.5px",
            fontWeight: 500,
          }}
        >
          {error}
        </motion.div>
      )}

      <Button
        variant="accent"
        type="submit"
        style={{ width: "100%", marginTop: "20px" }}
        disabled={loading}
      >
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
            fontFamily: "inherit",
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
