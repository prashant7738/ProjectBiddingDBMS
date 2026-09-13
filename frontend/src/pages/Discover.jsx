import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, Rows, SquaresFour } from '@phosphor-icons/react';
import { AppContext } from '../context/AppContext';
import { useAuctions } from '../hooks/useAuctions';
import { CATEGORIES, CATEGORY_OPTIONS } from '../lib/categories';
import { Container } from '../components/layout/Section';
import { Reveal } from '../components/ui/Motion';
import { LotCardSkeleton, LotRowSkeleton, Notice, EmptyState } from '../components/ui/Feedback';
import { LotCard, LotRow } from '../components/auction/Lot';

const STATUSES = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ended', label: 'Closed' },
];

const ORDERINGS = [
  { id: 'ending_soon', label: 'Closing soonest' },
  { id: 'newest', label: 'Newest' },
  { id: 'price_low', label: 'Price: low to high' },
  { id: 'price_high', label: 'Price: high to low' },
];

/**
 * The catalogue. Filters live in the URL so a filtered view is a shareable
 * address, and the header's search box feeds the same query.
 */
const Discover = () => {
  const [params, setParams] = useSearchParams();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useContext(AppContext);

  const status = STATUSES.some((s) => s.id === params.get('status')) ? params.get('status') : 'all';
  const ordering = ORDERINGS.some((o) => o.id === params.get('sort')) ? params.get('sort') : 'ending_soon';
  const view = params.get('view') === 'grid' ? 'grid' : 'list';
  const categoryFromUrl = Number(params.get('category') || 0);

  // A department chosen elsewhere (footer, home) arrives via context; mirror it
  // into the URL once so the two never disagree.
  useEffect(() => {
    if (!params.get('category') && selectedCategory) {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('category', String(selectedCategory));
        return next;
      }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (categoryFromUrl !== selectedCategory) setSelectedCategory(categoryFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromUrl]);

  const setParam = (key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'all' || value === '0') next.delete(key);
      else next.set(key, String(value));
      return next;
    });
  };

  const { lots, loading, error } = useAuctions({
    status,
    categoryId: categoryFromUrl,
    search: searchQuery,
    ordering,
  });

  const activeCategoryLabel = CATEGORIES[categoryFromUrl] ?? 'All Categories';

  return (
    <div className="pt-[72px]">
      <Container className="py-14 md:py-20">
        <Reveal>
          <p className="label mb-5">The catalogue</p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="display text-[clamp(2.75rem,8vw,6rem)] leading-[0.9] text-bone">
              Discover
            </h1>
            <p className="figure pb-3 text-sm text-bone-3">
              {loading ? 'Loading…' : `${lots.length} ${lots.length === 1 ? 'lot' : 'lots'}`}
              {categoryFromUrl ? ` · ${activeCategoryLabel}` : ''}
            </p>
          </div>
        </Reveal>
      </Container>

      {/* Filter bar — hairline rows, not a boxed panel of controls. */}
      <div className="sticky top-[72px] z-30 border-y border-line bg-paper/90 backdrop-blur-xl">
        <Container>
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {STATUSES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setParam('status', option.id)}
                  className={`shrink-0 border-b-2 pb-1 text-[13px] uppercase tracking-[0.1em] transition-colors ${
                    status === option.id
                      ? 'border-signal text-bone'
                      : 'border-transparent text-bone-4 hover:text-bone-2'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[12rem] flex-1 lg:flex-none">
                <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-4" aria-hidden="true" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search lots"
                  aria-label="Search lots"
                  className="control h-10 py-0 pl-9 text-sm"
                />
              </div>

              <select
                value={categoryFromUrl}
                onChange={(event) => setParam('category', event.target.value)}
                aria-label="Department"
                className="control h-10 w-auto py-0 text-sm"
              >
                <option value={0}>All departments</option>
                {CATEGORY_OPTIONS.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              <select
                value={ordering}
                onChange={(event) => setParam('sort', event.target.value)}
                aria-label="Sort"
                className="control h-10 w-auto py-0 text-sm"
              >
                {ORDERINGS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>

              <div className="hidden items-center border border-line md:flex">
                <button
                  type="button"
                  onClick={() => setParam('view', 'list')}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  className={`flex h-10 w-10 items-center justify-center transition-colors ${
                    view === 'list' ? 'bg-bone text-paper' : 'text-bone-4 hover:text-bone'
                  }`}
                >
                  <Rows className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setParam('view', 'grid')}
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  className={`flex h-10 w-10 items-center justify-center transition-colors ${
                    view === 'grid' ? 'bg-bone text-paper' : 'text-bone-4 hover:text-bone'
                  }`}
                >
                  <SquaresFour className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        {error && <Notice tone="error" className="mb-8">{error}</Notice>}

        {loading ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <LotCardSkeleton key={index} />)}
            </div>
          ) : (
            <div className="border-t border-line-soft">
              {Array.from({ length: 6 }).map((_, index) => <LotRowSkeleton key={index} />)}
            </div>
          )
        ) : lots.length === 0 ? (
          <EmptyState
            title="Nothing matches"
            body="No lots fit these filters right now. Widen the search, or look at everything currently on the floor."
            actionLabel="Clear filters"
            actionTo="/all-auctions"
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lots.map((lot) => <LotCard key={lot.id} lot={lot} />)}
          </div>
        ) : (
          <div className="border-t border-line">
            {lots.map((lot, index) => <LotRow key={lot.id} lot={lot} index={index} />)}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Discover;
