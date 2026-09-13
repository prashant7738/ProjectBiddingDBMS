import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

// Pointer-driven values are kept off React state on purpose: these update on
// every mousemove/scroll frame and re-rendering the tree that often is what
// makes "premium" interactions stutter on mid-range laptops and phones.

/** Cursor-following pull for a primary action. */
export const useMagnetic = (strength = 0.35, radius = 90) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

  const onMouseMove = (event) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > radius + Math.max(rect.width, rect.height) / 2) return;
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, style: { x: springX, y: springY }, onMouseMove, onMouseLeave };
};

/** Subtle 3D tilt + counter-parallax for a featured image. */
export const usePointerTilt = (maxDegrees = 6) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const config = { stiffness: 150, damping: 22, mass: 0.6 };
  const sx = useSpring(px, config);
  const sy = useSpring(py, config);

  const rotateY = useTransform(sx, [0, 1], [-maxDegrees, maxDegrees]);
  const rotateX = useTransform(sy, [0, 1], [maxDegrees, -maxDegrees]);
  const shiftX = useTransform(sx, [0, 1], ['2%', '-2%']);
  const shiftY = useTransform(sy, [0, 1], ['2%', '-2%']);

  const onMouseMove = (event) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return { ref, rotateX, rotateY, shiftX, shiftY, onMouseMove, onMouseLeave };
};

/** Boolean scroll state for the header. Flips rarely, so state is fine here. */
export const useScrollState = (threshold = 24) => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > threshold);
      // Only retract the bar once well past the fold, and never while the page
      // is bouncing at the top.
      setHidden(y > 220 && y > lastY.current + 4);
      lastY.current = y;
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return { scrolled, hidden };
};

/** Locks body scroll while a modal or the mobile menu is open. */
export const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [locked]);
};
