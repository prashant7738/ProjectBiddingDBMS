import { Link } from 'react-router-dom';
import { ArrowUpRight } from '@phosphor-icons/react';
import { Reveal } from '../ui/Motion';

/** Page gutter. Every full-width surface uses this and nothing else. */
export const Container = ({ className = '', children }) => (
  <div className={`mx-auto w-full max-w-[1600px] px-5 md:px-10 ${className}`}>{children}</div>
);

/**
 * Section header: an index numeral, a display title and an optional link out.
 * The numeral is the section's identity — it replaces the eyebrow label that
 * would otherwise sit above every single heading on the page.
 */
export const SectionHead = ({ index, title, note, actionTo, actionLabel, className = '' }) => (
  <Reveal className={`flex flex-wrap items-end justify-between gap-6 ${className}`}>
    <div className="flex items-start gap-5 md:gap-8">
      {index && <span className="figure mt-2 text-xs text-signal">{index}</span>}
      <div>
        <h2 className="display text-4xl leading-[0.95] text-bone md:text-6xl">{title}</h2>
        {note && <p className="mt-4 max-w-md text-sm leading-relaxed text-bone-3">{note}</p>}
      </div>
    </div>

    {actionTo && actionLabel && (
      <Link
        to={actionTo}
        className="group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-bone-2 transition-colors hover:text-bone"
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </Link>
    )}
  </Reveal>
);
