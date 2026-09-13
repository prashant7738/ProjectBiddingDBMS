import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { EASE } from '../../lib/motion';
import { pad2 } from '../../lib/format';
import { isClosingSoon, useCountdown } from '../../hooks/useCountdown';

/**
 * A figure that counts to its new value instead of snapping, and flashes once
 * when it climbs — the core "something just happened" signal of the saleroom.
 */
export const Figure = ({ value, prefix = 'Rs ', precise = false, className = '', flash = true }) => {
  const reduce = useReducedMotion();
  const target = Number(value);
  const safe = Number.isFinite(target) ? target : 0;

  const motionValue = useMotionValue(safe);
  const first = useRef(true);
  const previous = useRef(safe);
  const [flashing, setFlashing] = useState(false);

  const text = useTransform(motionValue, (latest) =>
    `${prefix}${latest.toLocaleString('en-US', {
      minimumFractionDigits: precise ? 2 : 0,
      maximumFractionDigits: precise ? 2 : 0,
    })}`,
  );

  useEffect(() => {
    if (first.current || reduce) {
      motionValue.set(safe);
      previous.current = safe;
      first.current = false;
      return undefined;
    }

    const climbed = safe > previous.current;
    previous.current = safe;
    const controls = animate(motionValue, safe, { duration: 0.85, ease: EASE });

    let timer;
    if (climbed && flash) {
      setFlashing(true);
      timer = setTimeout(() => setFlashing(false), 900);
    }

    return () => {
      controls.stop();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe, reduce, flash]);

  return (
    <motion.span className={`figure ${flashing ? 'flash-in' : ''} ${className}`}>
      {text}
    </motion.span>
  );
};

/** The live marker. Nothing else in the system is allowed to pulse. */
export const LiveTag = ({ label = 'Live', className = '' }) => (
  <span className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-signal ${className}`}>
    <span className="live-dot" aria-hidden="true" />
    {label}
  </span>
);

export const Tag = ({ children, tone = 'default', className = '' }) => {
  const tones = {
    default: 'border-line text-bone-3',
    bone: 'border-bone text-bone',
    signal: 'border-signal text-signal',
    settled: 'border-settled/60 text-settled',
  };
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${tones[tone] ?? tones.default} ${className}`}
    >
      {children}
    </span>
  );
};

/** Status derived from the lot's own clock, so it can't disagree with the row. */
export const LotStatus = ({ lot, className = '' }) => {
  const now = Date.now();
  const start = new Date(lot.startTime).getTime();
  const end = new Date(lot.endTime).getTime();

  if (lot.isLive && end > now) return <LiveTag className={className} />;
  if (start > now) return <Tag className={className}>Upcoming</Tag>;
  return <Tag className={className}>Closed</Tag>;
};

const Cell = ({ value, unit, urgent }) => (
  <div className="flex flex-col items-center gap-1">
    <span className={`figure text-2xl leading-none md:text-3xl ${urgent ? 'text-signal' : 'text-bone'}`}>
      {pad2(value)}
    </span>
    <span className="label text-[9px]">{unit}</span>
  </div>
);

/**
 * `inline` for list rows, `panel` for the bid console. Both stop ticking the
 * moment the lot closes.
 */
export const Countdown = ({ end, variant = 'inline', onEnd, className = '' }) => {
  const time = useCountdown(end, onEnd);
  const urgent = isClosingSoon(time);

  if (variant === 'panel') {
    if (time.ended) {
      return (
        <div className={`flex items-baseline gap-3 ${className}`}>
          <span className="display text-3xl text-bone-3">Closed</span>
        </div>
      );
    }
    return (
      <div className={`flex items-start gap-5 ${className}`}>
        {time.days > 0 && <Cell value={time.days} unit="Days" urgent={urgent} />}
        <Cell value={time.hours} unit="Hrs" urgent={urgent} />
        <Cell value={time.minutes} unit="Min" urgent={urgent} />
        <Cell value={time.seconds} unit="Sec" urgent={urgent} />
      </div>
    );
  }

  if (time.ended) {
    return <span className={`figure text-bone-4 ${className}`}>Closed</span>;
  }

  return (
    <span className={`figure ${urgent ? 'text-signal' : 'text-bone-2'} ${className}`}>
      {time.days > 0
        ? `${time.days}d ${pad2(time.hours)}h ${pad2(time.minutes)}m`
        : `${pad2(time.hours)}:${pad2(time.minutes)}:${pad2(time.seconds)}`}
    </span>
  );
};

/** Label-over-figure pair used in the hero band and account header. */
export const Stat = ({ label, children, className = '' }) => (
  <div className={className}>
    <div className="figure text-2xl text-bone md:text-3xl">{children}</div>
    <div className="label mt-2">{label}</div>
  </div>
);

export const Rule = ({ className = '' }) => (
  <hr className={`border-0 border-t border-line ${className}`} />
);
