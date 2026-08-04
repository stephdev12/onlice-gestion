"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "default";
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  label,
  disabled = false,
  className = "",
  style,
  size = "default",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSm = size === "sm";

  return (
    <div
      ref={containerRef}
      className={`custom-select ${className}`}
      style={{ position: "relative", ...style }}
    >
      {label && (
        <label className="custom-select-label">{label}</label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen((v) => !v);
        }}
        className="custom-select-trigger"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          width: "100%",
          minHeight: isSm ? "36px" : "44px",
          padding: isSm ? "6px 10px" : "9px 12px",
          borderRadius: "var(--radius-sm)",
          border: `1px solid ${isOpen ? "var(--ink)" : "var(--mist-line)"}`,
          background: "var(--paper)",
          color: selectedOption ? "var(--ink)" : "var(--slate)",
          fontSize: isSm ? "12.5px" : "14px",
          fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          textAlign: "left",
          fontFamily: "inherit",
          ...(isOpen ? { boxShadow: "0 0 0 3px rgba(247, 84, 6, 0.1)" } : {}),
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selectedOption?.label || placeholder}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, display: "flex", color: "var(--slate)" }}
        >
          <ChevronDown size={isSm ? 14 : 16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="custom-select-dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              background: "var(--paper)",
              border: "1px solid var(--mist-line)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              maxHeight: "240px",
              overflowY: "auto",
              padding: "4px",
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    minHeight: isSm ? "34px" : "40px",
                    padding: isSm ? "6px 10px" : "8px 12px",
                    border: "none",
                    borderRadius: "6px",
                    background: isSelected ? "var(--mist)" : "transparent",
                    color: isSelected ? "var(--ink)" : "var(--slate)",
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: isSm ? "12.5px" : "13.5px",
                    cursor: "pointer",
                    transition: "background 0.1s ease, color 0.1s ease",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--mist)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check size={14} style={{ color: "var(--orange)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
