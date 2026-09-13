import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { EASE, revealUp, stagger, staggerItem } from '../../lib/motion';

/** Standard scroll reveal. Everything editorial on the page enters this way. */
export const Reveal = ({ as: Tag = 'div', delay = 0, y = 28, className = '', children, ...rest }) => {
  const reduce = useReducedMotion();
  const Component = motion[Tag] ?? motion.div;

  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
};

/** Display type that wipes up from behind a mask, line by line. */
export const RevealLines = ({ lines, className = '', lineClassName = '', delay = 0 }) => {
  const reduce = useReducedMotion();

  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden">
          {reduce ? (
            <span className={`block ${lineClassName}`}>{line}</span>
          ) : (
            <motion.span
              className={`block ${lineClassName}`}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, ease: EASE, delay: delay + index * 0.09 }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
};

/** Sequenced children — lot rows, step lists, footer columns. */
export const RevealGroup = ({ as: Tag = 'div', delay = 0, gap = 0.07, className = '', children, ...rest }) => {
  const reduce = useReducedMotion();
  const Component = motion[Tag] ?? motion.div;
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Component className={className} {...stagger(delay, gap)} {...rest}>
      {children}
    </Component>
  );
};

export const RevealItem = ({ as: Tag = 'div', className = '', children, ...rest }) => {
  const reduce = useReducedMotion();
  const Component = motion[Tag] ?? motion.div;
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Component className={className} {...staggerItem} {...rest}>
      {children}
    </Component>
  );
};

/** Scroll-linked vertical drift for imagery. Transform-only, so it stays cheap. */
export const Parallax = ({ amount = 40, className = '', children }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="h-full w-full" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
};

export { revealUp };
