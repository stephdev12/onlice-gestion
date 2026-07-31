"use client";

import { motion } from "motion/react";
import { scaleIn } from "@/lib/animations";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "pending" | "approved" | "rejected" | "encours" | "termine" | "retard" | "basse" | "moyenne" | "haute";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <motion.span
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className={`badge badge-${variant} ${className}`}
    >
      {children}
    </motion.span>
  );
}
