import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useMagnetic } from '../../hooks/useInteractions';

// Hoisted: creating this inside a component would remount the link every render.
const MotionLink = motion.create(Link);

const VARIANTS = {
  signal: 'btn btn-signal',
  bone: 'btn btn-bone',
  ghost: 'btn btn-ghost',
  quiet: 'btn btn-quiet',
};

const SIZES = {
  sm: 'h-9 px-4 text-[11px]',
  md: 'h-11 px-6',
  lg: 'h-14 px-8 text-sm',
  block: 'h-14 w-full px-8 text-sm',
};

const classesFor = (variant, size, className) =>
  `${VARIANTS[variant] ?? VARIANTS.signal} ${SIZES[size] ?? SIZES.md} ${className}`.trim();

export const Button = ({
  variant = 'signal',
  size = 'md',
  magnetic = false,
  className = '',
  children,
  ...rest
}) => {
  const magnet = useMagnetic();
  const interaction = magnetic
    ? { style: magnet.style, onMouseMove: magnet.onMouseMove, onMouseLeave: magnet.onMouseLeave, ref: magnet.ref }
    : {};

  return (
    <motion.button className={classesFor(variant, size, className)} {...interaction} {...rest}>
      {children}
    </motion.button>
  );
};

export const ActionLink = ({
  to,
  variant = 'signal',
  size = 'md',
  magnetic = false,
  className = '',
  children,
  ...rest
}) => {
  const magnet = useMagnetic();
  const interaction = magnetic
    ? { style: magnet.style, onMouseMove: magnet.onMouseMove, onMouseLeave: magnet.onMouseLeave, ref: magnet.ref }
    : {};

  return (
    <MotionLink to={to} className={classesFor(variant, size, className)} {...interaction} {...rest}>
      {children}
    </MotionLink>
  );
};

// Text link with the underline that draws in from the left.
export const TextLink = ({ to, href, className = '', children, ...rest }) => {
  const classes = `link-draw text-[13px] uppercase tracking-[0.08em] text-bone hover:text-bone ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} {...rest}>
      {children}
    </Link>
  );
};
