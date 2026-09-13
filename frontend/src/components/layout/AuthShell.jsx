import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { EASE } from '../../lib/motion';
import { RevealLines } from '../ui/Motion';

/**
 * Split entrance used by sign in, join and the admin door. The left panel is
 * the statement; the right panel is the only place with controls.
 */
export const AuthShell = ({ statement, note, footnote, children }) => (
  <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
    <div className="relative hidden flex-col justify-between border-r border-line p-10 lg:flex xl:p-14">
      <Link to="/" className="group inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.1em] text-bone-3 transition-colors hover:text-bone">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        LiveBid
      </Link>

      <div>
        <h1 className="display text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[0.92] text-bone">
          <RevealLines lines={statement} />
        </h1>
        {note && <p className="mt-8 max-w-sm text-sm leading-relaxed text-bone-3">{note}</p>}
      </div>

      <p className="text-xs text-bone-4">{footnote}</p>
    </div>

    <div className="flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-14 xl:px-20">
      <Link to="/" className="mb-10 flex items-baseline gap-1.5 lg:hidden">
        <span className="display text-xl text-bone">LiveBid</span>
        <span className="mb-1 h-1.5 w-1.5 rounded-full bg-signal" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  </div>
);
