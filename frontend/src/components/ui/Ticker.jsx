import { Link } from 'react-router-dom';
import { lotNumber, money } from '../../lib/format';

/**
 * The saleroom tape: one continuous line of what is moving right now.
 * There is exactly one marquee on this site, and this is it — it earns the
 * pattern because the content is genuinely live and genuinely peripheral.
 */
export const Ticker = ({ lots }) => {
  if (!lots.length) return null;

  const run = lots.slice(0, 12);
  const items = [...run, ...run]; // duplicated so the -50% loop is seamless

  return (
    <div className="group relative overflow-hidden border-y border-line bg-paper-2/60">
      <div className="flex w-max animate-[ticker_42s_linear_infinite] group-hover:[animation-play-state:paused]">
        {items.map((lot, index) => (
          <Link
            key={`${lot.id}-${index}`}
            to={`/auctionPage/${lot.id}`}
            className="flex shrink-0 items-center gap-4 border-r border-line-soft px-6 py-3 transition-colors hover:bg-bone/[0.03]"
          >
            <span className="label text-[10px] text-bone-4">Lot {lotNumber(lot.id)}</span>
            <span className="max-w-[16rem] truncate text-sm text-bone-2">{lot.name}</span>
            <span className="figure text-sm text-signal">{money(lot.currentBid)}</span>
            <span className="label text-[10px] text-bone-4">
              {lot.bidCount} {lot.bidCount === 1 ? 'bid' : 'bids'}
            </span>
          </Link>
        ))}
      </div>
      {/* Feathered edges so the tape reads as continuous rather than clipped. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper to-transparent" />
    </div>
  );
};
