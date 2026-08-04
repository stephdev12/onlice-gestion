"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, EyeOff } from "lucide-react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "date" | "number";
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  name?: string;
  min?: string;
  max?: string;
}

export function TextInput({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
  multiline = false,
  rows = 3,
  required = false,
  disabled = false,
  error,
  icon,
  clearable = false,
  className = "",
  style,
  name,
  min,
  max,
}: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const hasValue = value.length > 0;
  const isActive = focused || hasValue;
  const inputType = type === "password" && showPassword ? "text" : type;

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    ...style,
  };

  const fieldStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: "var(--radius-sm)",
    border: `1px solid ${error ? "var(--danger)" : focused ? "var(--ink)" : "var(--mist-line)"}`,
    background: "var(--paper)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    ...(focused && !error
      ? { boxShadow: "0 0 0 3px rgba(247, 84, 6, 0.1)" }
      : {}),
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: icon ? "12px 12px 12px 40px" : "12px",
    paddingRight:
      clearable || type === "password" ? "40px" : "12px",
    minHeight: multiline ? undefined : "44px",
    fontSize: "14px",
    color: "var(--ink)",
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    resize: multiline ? "vertical" : "none",
    lineHeight: 1.5,
    ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
  };

  const SharedProps = {
    value,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    disabled,
    name,
    placeholder: label ? (isActive ? placeholder : "") : placeholder,
    required,
    style: inputStyle,
  };

  return (
    <div className={`custom-input ${className}`} style={wrapperStyle}>
      {/* Label */}
      {label && (
        <motion.label
          animate={{
            y: isActive ? -22 : 0,
            scale: isActive ? 0.85 : 1,
            color: error
              ? "var(--danger)"
              : focused
              ? "var(--orange)"
              : "var(--slate)",
          }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            left: icon ? "40px" : "12px",
            top: multiline ? "14px" : "12px",
            fontSize: "14px",
            fontWeight: 500,
            transformOrigin: "left top",
            pointerEvents: "none",
            zIndex: 5,
            background: isActive ? "var(--paper)" : "transparent",
            padding: isActive ? "0 4px" : "0",
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {label}
          {required && (
            <span style={{ color: "var(--danger)", marginLeft: "2px" }}>*</span>
          )}
        </motion.label>
      )}

      <div style={fieldStyle}>
        {/* Icon prefix */}
        {icon && (
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "var(--orange)" : "var(--slate)",
              display: "flex",
              transition: "color 0.15s ease",
              zIndex: 5,
            }}
          >
            {icon}
          </div>
        )}

        {/* Input / Textarea */}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            {...SharedProps}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            min={min}
            max={max}
            {...SharedProps}
          />
        )}

        {/* Clear / Password toggle */}
        {(clearable && hasValue && !disabled && type !== "password") && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "var(--slate)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              zIndex: 5,
            }}
          >
            <X size={14} />
          </button>
        )}

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "var(--slate)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              zIndex: 5,
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              fontSize: "11.5px",
              color: "var(--danger)",
              marginTop: "4px",
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
