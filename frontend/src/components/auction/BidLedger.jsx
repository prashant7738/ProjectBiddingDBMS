import { AnimatePresence, motion } from 'motion/react';
import { initialOf, money, relativeTime } from '../../lib/format';
import { EASE } from '../../lib/motion';

/**
 * Public bid history. The leading bid is the only row carrying signal colour;
 * everything under it recedes, so the top of the stack reads instantly.
 */
export const BidLedger = ({ bids, currentUserId }) => (
  <section>
    <div className="flex items-baseline justify-between border-b border-line pb-3">
      <h2 className="label">Bid ledger</h2>
      <span className="figure text-xs text-bone-4">
        {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
      </span>
    </div>

    {bids.length === 0 ? (
      <p className="py-10 text-center text-sm text-bone-4">
        No bids yet. The floor is open.
      </p>
    ) : (
      <ul className="thin-scroll max-h-[22rem] overflow-y-auto">
        <AnimatePresence initial={false}>
          {bids.map((bid, index) => {
            const leading = index === 0;
            const mine = currentUserId != null && String(bid.bidderId) === String(currentUserId);
            return (
              <motion.li
                key={`${bid.time}-${bid.amount}-${index}`}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex items-center gap-4 border-b border-line-soft py-3.5 last:border-0"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center border text-[11px] ${
                    leading ? 'border-signal text-signal' : 'border-line text-bone-4'
                  }`}
                >
                  {initialOf(bid.bidder)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${leading ? 'text-bone' : 'text-bone-2'}`}>
                    {bid.bidder}
                    {mine && <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-bone-4">You</span>}
                  </p>
                  <p className="mt-0.5 text-[11px] text-bone-4">{relativeTime(bid.time)}</p>
                </div>

                <div className="text-right">
                  <p className={`figure text-sm ${leading ? 'text-signal' : 'text-bone-3'}`}>
                    {money(bid.amount)}
                  </p>
                  {leading && (
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-bone-4">Leading</p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    )}
  </section>
);
