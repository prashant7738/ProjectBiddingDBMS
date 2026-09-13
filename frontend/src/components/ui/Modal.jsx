import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from '@phosphor-icons/react';
import { EASE } from '../../lib/motion';
import { useScrollLock } from '../../hooks/useInteractions';

export const Modal = ({ open, onClose, title, eyebrow, children, footer, size = 'md' }) => {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-paper/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${widths[size] ?? widths.md} border border-line bg-paper-2 thin-scroll max-h-[90dvh] overflow-y-auto`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-6 border-b border-line px-6 py-5">
              <div>
                {eyebrow && <p className="label mb-2">{eyebrow}</p>}
                <h2 className="display text-2xl text-bone">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center text-bone-3 transition-colors hover:text-bone"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 py-6">{children}</div>

            {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line px-6 py-5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
