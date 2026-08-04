"use client";

import { motion, AnimatePresence } from "motion/react";
import { slideFromRight, slideFromBottom, backdropFade } from "@/lib/animations";
import { useEffect, useState } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, subtitle, children }: DrawerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 641);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const variants = isMobile ? slideFromBottom : slideFromRight;

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
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="drawer"
          >
            {/* Drag handle (mobile) */}
            {isMobile && <div className="drawer-drag-handle" />}

            <div className="drawer-head">
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
