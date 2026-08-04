"use client";

import { motion } from "motion/react";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function Card({ children, className = "", onClick, hoverEffect = true }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -4, boxShadow: "0 8px 24px rgba(13,22,29,0.08)" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        border: "1px solid var(--mist-line)",
        borderRadius: "var(--radius)",
        padding: "18px",
        background: "var(--paper)",
        cursor: onClick ? "pointer" : "default",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        overflowX: "auto",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
