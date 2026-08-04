import type { Variants } from "motion/react";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

export const slideFromRight: Variants = {
  hidden: { x: "100%", opacity: 0.5 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 28, stiffness: 220 } },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }
};

export const slideFromBottom: Variants = {
  hidden: { y: "100%", opacity: 0.5 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 28, stiffness: 220 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } }
};

export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const dropdownOpen: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.12 } }
};

export const scalePress: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

export const tabSwitch: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};
