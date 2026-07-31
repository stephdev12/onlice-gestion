"use client";

import { motion, AnimatePresence } from "motion/react";
import { slideFromRight, backdropFade } from "@/lib/animations";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, subtitle, children }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="overlay"
          />
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="drawer"
          >
            <div class="drawer-head">
              <div>
                <h2>{title}</h2>
                {subtitle && <div className="sub">{subtitle}</div>}
              </div>
              <button onClick={onClose} className="icon-btn" aria-label="Fermer">
                ✕
              </button>
            </div>
            <div className="drawer-body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
