"use client";

import { motion, HTMLMotionProps } from "motion/react";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "accent" | "outline" | "primary" | "approve" | "reject";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, className = "", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`btn btn-${variant} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
