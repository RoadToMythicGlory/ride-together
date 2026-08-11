export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export const stagger = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const fadeSoft = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const springSoft = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 36,
  mass: 0.8,
};
