"use client";

import { motion, AnimatePresence } from "motion/react";
import { slideFromRight, slideFromBottom, backdropFade } from "@/lib/animations";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, subtitle, children }: DrawerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 641);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const variants = isMobile ? slideFromBottom : slideFromRight;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "flex-end" : "flex-end",
            pointerEvents: "auto",
          }}
        >
          {/* Backdrop */}
          <motion.div
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(13, 22, 29, 0.55)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* Drawer / Bottom Sheet Container */}
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "relative",
              zIndex: 10000,
              background: "var(--paper)",
              boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.22)",
              display: "flex",
              flexDirection: "column",
              ...(isMobile
                ? {
                    width: "100%",
                    maxHeight: "88vh",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                : {
                    width: "480px",
                    maxWidth: "92vw",
                    height: "100vh",
                    borderLeft: "1px solid var(--mist-line)",
                  }),
            }}
          >
            {/* Mobile Drag handle */}
            {isMobile && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0 4px",
                  cursor: "pointer",
                }}
                onClick={onClose}
              >
                <div
                  style={{
                    width: "40px",
                    height: "5px",
                    borderRadius: "3px",
                    background: "var(--slate)",
                    opacity: 0.35,
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: isMobile ? "14px 20px 14px" : "22px 24px 18px",
                borderBottom: "1px solid var(--mist-line)",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "var(--slate)",
                      marginTop: "4px",
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="icon-btn"
                aria-label="Fermer"
                style={{
                  background: "var(--mist)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--ink)",
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: isMobile ? "16px 20px 32px" : "24px",
                overflowY: "auto",
                overflowX: "hidden",
                flex: 1,
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
