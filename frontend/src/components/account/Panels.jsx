import { useCallback, useEffect, useState } from 'react';
import { BookmarkSimple } from '@phosphor-icons/react';
import { myBids, winItems } from '../../api/auth';
import { normalizeAuction } from '../../lib/normalizeAuction';
import { money, saleDate } from '../../lib/format';
import { LotCard } from '../auction/Lot';
import { LotCardSkeleton, EmptyState, Notice } from '../ui/Feedback';

/** Shared loader for the "lots that relate to me" panels. */
const useUserLots = (fetcher, userId) => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetcher(userId);
      const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setLots(rows.map(normalizeAuction));
    } catch {
      setError('Could not load this list right now.');
    } finally {
      setLoading(false);
    }
  }, [fetcher, userId]);

  useEffect(() => { load(); }, [load]);

  return { lots, loading, error, reload: load };
};

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
);

const LoadingGrid = ({ count = 4 }) => (
  <Grid>{Array.from({ length: count }).map((_, i) => <LotCardSkeleton key={i} />)}</Grid>
);

export const BidsPanel = ({ user }) => {
  const { lots, loading, error } = useUserLots(myBids, user?.id);

  if (loading) return <LoadingGrid />;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!lots.length) {
    return (
      <EmptyState
        title="No bids yet"
        body="Lots you bid on appear here with their live standing, so you can follow every clock from one place."
        actionLabel="Find something"
        actionTo="/all-auctions?status=live"
      />
    );
  }

  return <Grid>{lots.map((lot) => <LotCard key={lot.id} lot={lot} />)}</Grid>;
};

export const WonPanel = ({ user }) => {
  const { lots, loading, error } = useUserLots(winItems, user?.id);

  if (loading) return <LoadingGrid count={3} />;
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!lots.length) {
    return (
      <EmptyState
        title="Nothing won yet"
        body="When you hold the leading bid at the close, the lot lands here with its hammer price."
        actionLabel="Browse live lots"
        actionTo="/all-auctions?status=live"
      />
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-line pb-6">
        <p className="label">Total spent</p>
        <p className="figure text-2xl text-bone">
          {money(lots.reduce((sum, lot) => sum + Number(lot.currentBid || 0), 0), { precise: true })}
        </p>
        <p className="text-xs text-bone-4">across {lots.length} {lots.length === 1 ? 'lot' : 'lots'}</p>
      </div>
      <Grid>{lots.map((lot) => <LotCard key={lot.id} lot={lot} />)}</Grid>
    </>
  );
};

export const SavedPanel = ({ watchlist }) => {
  const { lots, loading, toggle } = watchlist;

  if (loading) return <LoadingGrid count={3} />;
  if (!lots.length) {
    return (
      <EmptyState
        title="Nothing saved"
        body="Save a lot from its page to keep an eye on it without committing to a bid."
        actionLabel="Browse the catalogue"
        actionTo="/all-auctions"
      />
    );
  }

  return (
    <Grid>
      {lots.map((lot) => (
        <div key={lot.id} className="relative">
          <LotCard lot={lot} />
          <button
            type="button"
            onClick={() => toggle(lot.id)}
            aria-label={`Remove ${lot.name} from saved`}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-line bg-paper/80 text-bone-2 backdrop-blur-sm transition-colors hover:border-signal hover:text-signal"
          >
            <BookmarkSimple className="h-4 w-4" weight="fill" aria-hidden="true" />
          </button>
        </div>
      ))}
    </Grid>
  );
};

export { useUserLots, saleDate };
