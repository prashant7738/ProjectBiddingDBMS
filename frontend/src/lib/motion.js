// Motion vocabulary. Every animated surface pulls its easing and timing from
// here so the whole site accelerates and settles the same way.

export const EASE = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

// Content entering the viewport: rises and settles, never bounces.
export const revealUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: EASE },
};

export const revealFade = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: EASE },
};

// Parent/child pair for sequenced reveals (lot rows, step lists, nav items).
export const stagger = (delayChildren = 0, staggerChildren = 0.07) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.2 },
  variants: {
    hidden: {},
    visible: { transition: { delayChildren, staggerChildren } },
  },
});

export const staggerItem = {
  variants: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  },
};

// Route changes: a short vertical wipe, quick enough to feel instant.
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.24, ease: EASE },
};

export const springSoft = { type: 'spring', stiffness: 220, damping: 28, mass: 0.7 };
export const springTight = { type: 'spring', stiffness: 420, damping: 32 };
