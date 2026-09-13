import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useAuctions } from '../hooks/useAuctions';
import { lotNumber, money, saleDate } from '../lib/format';
import { Container } from '../components/layout/Section';
import { Reveal } from '../components/ui/Motion';
import { EmptyState, LotRowSkeleton, Notice } from '../components/ui/Feedback';
import { ImagePlaceholder } from '../components/ui/Form';
import { Stat } from '../components/ui/Data';

const SORTS = [
  { id: 'recent', label: 'Most recent' },
  { id: 'hammer', label: 'Highest hammer' },
  { id: 'gain', label: 'Biggest gain' },
];

const gainOf = (lot) => {
  const open = Number(lot.startingBid) || 0;
  const hammer = Number(lot.currentBid) || 0;
  if (open <= 0) return 0;
  return ((hammer - open) / open) * 100;
};

/** The record of what things actually sold for. Priced like a results sheet. */
const Results = () => {
  const { lots, loading, error } = useAuctions({ status: 'ended', ordering: 'newest' });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');

  const rows = useMemo(() => {
    const filtered = lots.filter((lot) =>
      lot.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const sorted = [...filtered];
    if (sort === 'hammer') sorted.sort((a, b) => Number(b.currentBid) - Number(a.currentBid));
    else if (sort === 'gain') sorted.sort((a, b) => gainOf(b) - gainOf(a));
    else sorted.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    return sorted;
  }, [lots, query, sort]);

  const totals = useMemo(() => {
    const hammer = lots.reduce((sum, lot) => sum + Number(lot.currentBid || 0), 0);
    const best = lots.reduce((max, lot) => Math.max(max, gainOf(lot)), 0);
    return { hammer, best };
  }, [lots]);

  return (
    <div className="pt-[72px]">
      <Container className="py-14 md:py-20">
        <Reveal>
          <p className="label mb-5">The record</p>
          <h1 className="display text-[clamp(2.75rem,8vw,6rem)] leading-[0.9] text-bone">
            Results
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-bone-3">
            Every lot that has settled, with the price it opened at and the price
            it took.
          </p>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-line pt-8">
            <Stat label="Lots settled">{loading ? '—' : lots.length}</Stat>
            <Stat label="Total hammer">{loading ? '—' : money(totals.hammer)}</Stat>
            <Stat label="Best gain">{loading ? '—' : `${totals.best.toFixed(0)}%`}</Stat>
          </div>
        </Reveal>
      </Container>

      <div className="sticky top-[72px] z-30 border-y border-line bg-paper/90 backdrop-blur-xl">
        <Container>
          <div className="flex flex-wrap items-center gap-3 py-4">
            <div className="relative min-w-[12rem] flex-1">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-4" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search settled lots"
                aria-label="Search settled lots"
                className="control h-10 py-0 pl-9 text-sm"
              />
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort results"
              className="control h-10 w-auto py-0 text-sm"
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <span className="figure ml-auto text-xs text-bone-4">
              {loading ? '' : `${rows.length} ${rows.length === 1 ? 'result' : 'results'}`}
            </span>
          </div>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        {error && <Notice tone="error" className="mb-8">{error}</Notice>}

        {loading ? (
          <div className="border-t border-line-soft">
            {Array.from({ length: 6 }).map((_, index) => <LotRowSkeleton key={index} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No results yet"
            body="Once lots start closing, their hammer prices are published here permanently."
            actionLabel="See what's live"
            actionTo="/all-auctions?status=live"
          />
        ) : (
          <div className="border-t border-line">
            {/* Column heads exist only where there's room for the full table. */}
            <div className="hidden grid-cols-[3rem_5rem_1fr_9rem_9rem_7rem] items-center gap-6 border-b border-line py-3 lg:grid">
              <span className="label text-[10px]">Lot</span>
              <span />
              <span className="label text-[10px]">Item</span>
              <span className="label text-right text-[10px]">Opened</span>
              <span className="label text-right text-[10px]">Hammer</span>
              <span className="label text-right text-[10px]">Change</span>
            </div>

            {rows.map((lot) => {
              const gain = gainOf(lot);
              return (
                <Link
                  key={lot.id}
                  to={`/auctionPage/${lot.id}`}
                  className="lot-row grid grid-cols-[4rem_1fr] items-center gap-x-5 gap-y-3 border-b border-line-soft py-5 pl-4 lg:grid-cols-[3rem_5rem_1fr_9rem_9rem_7rem] lg:gap-6"
                >
                  <span className="figure hidden text-xs text-bone-4 lg:block">{lotNumber(lot.id)}</span>

                  <div className="h-16 w-16 overflow-hidden bg-paper-3 lg:h-14 lg:w-14">
                    {lot.image ? (
                      <img src={lot.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlaceholder className="h-full w-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="display truncate text-lg text-bone">{lot.name}</h3>
                    <p className="mt-1 text-xs text-bone-4">
                      {lot.category} · settled {saleDate(lot.endTime)} · {lot.bidCount} {lot.bidCount === 1 ? 'bid' : 'bids'}
                    </p>
                  </div>

                  <div className="col-start-2 flex items-baseline gap-6 lg:col-start-auto lg:block lg:text-right">
                    <span className="label text-[10px] lg:hidden">Opened</span>
                    <span className="figure text-sm text-bone-4">{money(lot.startingBid)}</span>
                  </div>

                  <div className="col-start-2 flex items-baseline gap-6 lg:col-start-auto lg:block lg:text-right">
                    <span className="label text-[10px] lg:hidden">Hammer</span>
                    <span className="figure text-base text-bone">{money(lot.currentBid)}</span>
                  </div>

                  <div className="col-start-2 flex items-baseline gap-6 lg:col-start-auto lg:block lg:text-right">
                    <span className="label text-[10px] lg:hidden">Change</span>
                    <span className={`figure text-sm ${gain > 0 ? 'text-settled' : 'text-bone-4'}`}>
                      {gain > 0 ? '+' : ''}{gain.toFixed(1)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Results;
