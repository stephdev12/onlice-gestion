"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

/* ─── Constants ──────────────────────────────────────────────────────── */
const GLASS_SHADOW_LIGHT =
  "0 0 6px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.08), inset 3px 3px 0.5px -3px rgba(0,0,0,0.9), inset -3px -3px 0.5px -3px rgba(0,0,0,0.85), inset 1px 1px 1px -0.5px rgba(0,0,0,0.6), inset -1px -1px 1px -0.5px rgba(0,0,0,0.6), inset 0 0 6px 6px rgba(0,0,0,0.12), inset 0 0 2px 2px rgba(0,0,0,0.06), 0 0 12px rgba(255,255,255,0.15)";

const GLASS_SHADOW_DARK =
  "0 0 8px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.08), inset 3px 3px 0.5px -3.5px rgba(255,255,255,0.09), inset -3px -3px 0.5px -3.5px rgba(255,255,255,0.85), inset 1px 1px 1px -0.5px rgba(255,255,255,0.6), inset -1px -1px 1px -0.5px rgba(255,255,255,0.6), inset 0 0 6px 6px rgba(255,255,255,0.12), inset 0 0 2px 2px rgba(255,255,255,0.06), 0 0 12px rgba(0,0,0,0.15)";

const DEFAULT_FILTER_SCALE = 30;
const BUTTON_FILTER_SCALE = 70;

/* ─── SVG Glass Filter ───────────────────────────────────────────────── */
interface GlassFilterProps {
  id: string;
  scale?: number;
}

const GlassFilter = React.memo(
  ({ id, scale = DEFAULT_FILTER_SCALE }: GlassFilterProps) => (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }} focusable={false}>
      <title>Glass Effect Filter</title>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id={id}
          width="200%"
          x="-50%"
          y="-50%"
        >
          <feTurbulence
            baseFrequency="0.05 0.05"
            numOctaves={1}
            result="turbulence"
            seed={1}
            type="fractalNoise"
          />
          <feGaussianBlur
            in="turbulence"
            result="blurredNoise"
            stdDeviation={2}
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            result="displaced"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B"
          />
          <feGaussianBlur in="displaced" result="finalBlur" stdDeviation={4} />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
);
GlassFilter.displayName = "GlassFilter";

/* ─── useIsDark hook ─────────────────────────────────────────────────── */
function useIsDark() {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

/* ─── Liquid Glass Card ──────────────────────────────────────────────── */
interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  glassSize?: "sm" | "default" | "lg";
  glassEffect?: boolean;
  hoverEffect?: boolean;
}

export function LiquidGlassCard({
  children,
  className = "",
  style,
  onClick,
  glassSize = "default",
  glassEffect = true,
  hoverEffect = true,
}: LiquidGlassCardProps) {
  const filterId = React.useId();
  const isDark = useIsDark();

  const paddingMap = { sm: "10px", default: "18px", lg: "24px" };

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hoverEffect
          ? { y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }
          : undefined
      }
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        background: isDark ? "rgba(15,24,34,0.2)" : "rgba(255,255,255,0.2)",
        backdropFilter: "blur(2px)",
        borderRadius: "var(--radius)",
        padding: paddingMap[glassSize],
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* Glass shadow layer */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          boxShadow: isDark ? GLASS_SHADOW_DARK : GLASS_SHADOW_LIGHT,
        }}
      />

      {/* SVG displacement filter layer */}
      {glassEffect && (
        <>
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              zIndex: -1,
              overflow: "hidden",
              borderRadius: "inherit",
              backdropFilter: `url("#${filterId}")`,
            }}
          />
          <GlassFilter id={filterId} scale={DEFAULT_FILTER_SCALE} />
        </>
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>

      {/* Hover gradient shine */}
      <div
        className="liquid-glass-shine"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 20,
          borderRadius: "inherit",
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)"
            : "linear-gradient(to right, transparent, rgba(0,0,0,0.05), transparent)",
          opacity: 0,
          transition: "opacity 0.2s ease-out",
        }}
      />
    </motion.div>
  );
}

/* ─── Liquid Glass Button ────────────────────────────────────────────── */
type LiquidGlassButtonProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
  className?: string;
  variant?: "accent" | "outline" | "primary" | "approve" | "reject" | "ghost";
};

export function LiquidGlassButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: LiquidGlassButtonProps) {
  const filterId = React.useId();
  const isDark = useIsDark();

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`btn btn-${variant} ${className}`}
        style={{
          position: "relative",
          ...(props.style || {}),
        }}
        {...props}
      >
        {/* Glass shadow layer */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            boxShadow: isDark ? GLASS_SHADOW_DARK : GLASS_SHADOW_LIGHT,
          }}
        />
        {/* SVG displacement */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            isolation: "isolate",
            zIndex: -1,
            overflow: "hidden",
            borderRadius: "inherit",
            backdropFilter: `url("#${filterId}")`,
          }}
        />
        <span style={{ position: "relative", zIndex: 10 }}>{children}</span>
      </motion.button>
      <GlassFilter id={filterId} scale={BUTTON_FILTER_SCALE} />
    </>
  );
}

export { GlassFilter };
