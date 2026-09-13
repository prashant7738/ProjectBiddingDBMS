import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Gavel } from '@phosphor-icons/react';
import { lotNumber, money } from '../../lib/format';
import { EASE } from '../../lib/motion';
import { Countdown, Figure, LotStatus } from '../ui/Data';
import { ImagePlaceholder } from '../ui/Form';

const lotHref = (lot) => `/auctionPage/${lot.id}`;

// How far a live lot has run, as a fraction. Rendered as a hairline under the
// image so a glance tells you whether you have hours or seconds — no label,
// no badge, no text over the photograph.
const elapsedFraction = (lot) => {
  const start = new Date(lot.startTime).getTime();
  const end = new Date(lot.endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
};

const Frame = ({ lot, className = '', imageClassName = '' }) => (
  <div className={`relative overflow-hidden bg-paper-3 ${className}`}>
    {lot.image ? (
      <img
        src={lot.image}
        alt={lot.name}
        loading="lazy"
        className={`h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${imageClassName}`}
      />
    ) : (
      <ImagePlaceholder className="h-full w-full" />
    )}

    {lot.isLive && (
      <span className="absolute inset-x-0 bottom-0 h-[2px] bg-line-soft" aria-hidden="true">
        <span
          className="block h-full bg-signal"
          style={{ width: `${elapsedFraction(lot) * 100}%` }}
        />
      </span>
    )}
  </div>
);

/**
 * The list unit. A full-bleed row with hairline separation — the saleroom
 * catalogue, not a grid of product tiles.
 */
export const LotRow = ({ lot, index }) => (
  <Link
    to={lotHref(lot)}
    className="lot-row group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-4 border-b border-line-soft py-5 pl-4 pr-2 md:grid-cols-[3rem_6rem_1fr_auto_auto_auto] md:gap-6 md:py-6"
  >
    <span className="figure hidden text-xs text-bone-4 md:block">
      {index != null ? String(index + 1).padStart(2, '0') : lotNumber(lot.id)}
    </span>

    <Frame
      lot={lot}
      className="h-20 w-20 md:h-24 md:w-24"
      imageClassName="group-hover:scale-[1.06]"
    />

    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-3">
        <LotStatus lot={lot} />
        <span className="label text-[10px] text-bone-4">{lot.category}</span>
      </div>
      <h3 className="display truncate text-xl text-bone md:text-2xl">{lot.name}</h3>
      <p className="mt-1.5 truncate text-xs text-bone-4">
        {lot.sellerName ? `Consigned by ${lot.sellerName}` : 'Private consignor'}
      </p>
    </div>

    <div className="hidden text-right md:block">
      <p className="label mb-1.5 text-[10px]">Bids</p>
      <p className="figure text-sm text-bone-2">{lot.bidCount}</p>
    </div>

    <div className="col-span-2 flex items-center justify-between gap-6 md:col-span-1 md:block md:text-right">
      <div className="md:mb-1.5">
        <p className="label text-[10px]">Current</p>
      </div>
      <Figure value={lot.currentBid} className="text-lg text-bone md:text-xl" />
    </div>

    <div className="hidden items-center gap-5 md:flex">
      <Countdown end={lot.endTime} className="w-28 text-right text-sm" />
      <ArrowRight
        className="h-4 w-4 shrink-0 text-bone-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-signal"
        aria-hidden="true"
      />
    </div>
  </Link>
);

/**
 * The poster. Used where lots are browsed visually rather than scanned —
 * grids, rails, related lots.
 */
export const LotCard = ({ lot, ratio = 'aspect-[4/5]' }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="group h-full"
    >
      <Link to={lotHref(lot)} className="flex h-full flex-col">
        <Frame lot={lot} className={ratio} imageClassName="group-hover:scale-[1.04]" />

        <div className="flex flex-1 flex-col border-x border-b border-line px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <LotStatus lot={lot} />
            <span className="figure text-[11px] text-bone-4">Lot {lotNumber(lot.id)}</span>
          </div>

          <h3 className="display line-clamp-2 text-xl leading-tight text-bone transition-colors group-hover:text-bone">
            {lot.name}
          </h3>

          <p className="mt-1.5 truncate text-xs text-bone-4">{lot.sellerName || 'Private consignor'}</p>

          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <div>
              <p className="label mb-1 text-[10px]">Current bid</p>
              <Figure value={lot.currentBid} className="text-lg text-bone" />
            </div>
            <div className="text-right">
              <p className="label mb-1 text-[10px]">
                {lot.isLive ? 'Closes in' : 'Status'}
              </p>
              <Countdown end={lot.endTime} className="text-sm" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/** Horizontal scroll-snap rail — a different rhythm from the vertical grid. */
export const LotRail = ({ lots, cardWidth = 'w-[74vw] sm:w-[20rem]' }) => (
  <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:-mx-10 md:px-10">
    {lots.map((lot) => (
      <div key={lot.id} className={`${cardWidth} shrink-0 snap-start`}>
        <LotCard lot={lot} ratio="aspect-[3/4]" />
      </div>
    ))}
  </div>
);

/** Compact line item for account panels and modals. */
export const LotLine = ({ lot, trailing }) => (
  <div className="flex items-center gap-4 border-b border-line-soft py-4 last:border-0">
    <Link to={lotHref(lot)} className="group flex min-w-0 flex-1 items-center gap-4">
      <Frame lot={lot} className="h-14 w-14 shrink-0" imageClassName="group-hover:scale-105" />
      <div className="min-w-0">
        <p className="truncate text-sm text-bone">{lot.name}</p>
        <p className="mt-1 flex items-center gap-2 text-xs text-bone-4">
          <Gavel className="h-3 w-3" aria-hidden="true" />
          {lot.bidCount} {lot.bidCount === 1 ? 'bid' : 'bids'} · {money(lot.currentBid)}
        </p>
      </div>
    </Link>
    {trailing}
  </div>
);
