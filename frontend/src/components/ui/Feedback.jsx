import { AnimatePresence, motion } from 'motion/react';
import { Warning, CheckCircle, Info } from '@phosphor-icons/react';
import { EASE } from '../../lib/motion';
import { ActionLink } from './Button';

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} />;

/** Placeholder shaped like the row it replaces, so nothing shifts on load. */
export const LotRowSkeleton = () => (
  <div className="flex items-center gap-6 border-b border-line-soft px-4 py-6">
    <Skeleton className="h-4 w-10" />
    <Skeleton className="h-20 w-20 shrink-0" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-1/5" />
    </div>
    <Skeleton className="hidden h-4 w-24 md:block" />
    <Skeleton className="h-4 w-28" />
  </div>
);

export const LotCardSkeleton = () => (
  <div className="border border-line">
    <Skeleton className="aspect-[4/5] w-full" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const Spinner = ({ className = '' }) => (
  <span
    className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-signal ${className}`}
    role="status"
    aria-label="Loading"
  />
);

const TONES = {
  error: { icon: Warning, wrap: 'border-signal/40 bg-signal/[0.06] text-signal-2' },
  success: { icon: CheckCircle, wrap: 'border-settled/40 bg-settled/[0.06] text-settled' },
  info: { icon: Info, wrap: 'border-line bg-bone/[0.03] text-bone-2' },
};

export const Notice = ({ tone = 'info', children, className = '' }) => {
  const { icon: Icon, wrap } = TONES[tone] ?? TONES.info;
  return (
    <div className={`flex items-start gap-3 border px-4 py-3 text-sm ${wrap} ${className}`} role={tone === 'error' ? 'alert' : undefined}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
};

/** Empty states say what the surface is for and give one way to fill it. */
export const EmptyState = ({ title, body, actionLabel, actionTo, className = '' }) => (
  <div className={`border border-dashed border-line px-8 py-20 text-center ${className}`}>
    <h3 className="display text-3xl text-bone">{title}</h3>
    {body && <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-bone-3">{body}</p>}
    {actionLabel && actionTo && (
      <ActionLink to={actionTo} variant="ghost" size="md" className="mt-8">
        {actionLabel}
      </ActionLink>
    )}
  </div>
);

/** Transient bid activity, anchored under the header. */
export const LiveToast = ({ event, children }) => (
  <AnimatePresence>
    {event && (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="pointer-events-none fixed left-1/2 top-24 z-60 w-[min(92vw,26rem)] -translate-x-1/2"
      >
        <div className="flex items-center gap-3 border border-signal/40 bg-paper-2/95 px-4 py-3 backdrop-blur-md">
          <span className="live-dot" aria-hidden="true" />
          {children}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
