import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuctions, getEndedAuctions } from '../api/auth';
import { normalizeAuction } from '../lib/normalizeAuction';

// One fetcher for every list surface (home, discover, results). `status` maps
// onto the backend's two list endpoints:
//   active | live | upcoming -> /auctions/   (live/upcoming pass a status param)
//   ended                    -> /auctions/ended/
//   all                      -> both, merged
export const useAuctions = ({
  status = 'active',
  categoryId = 0,
  search = '',
  ordering = 'ending_soon',
  enabled = true,
  initial = [],
} = {}) => {
  const [lots, setLots] = useState(initial);
  const [loading, setLoading] = useState(initial.length === 0);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);

  // Keystrokes shouldn't each cost a request.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const onLoadRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    setLoading(true);
    setError('');

    const filters = {
      category_id: categoryId || undefined,
      search: debouncedSearch || undefined,
      ordering,
    };

    const unwrap = (res) => {
      const data = res?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.results)) return data.results;
      return [];
    };

    const run = async () => {
      try {
        let rows;
        if (status === 'ended') {
          rows = unwrap(await getEndedAuctions(filters));
        } else if (status === 'all') {
          const [active, ended] = await Promise.all([
            getAuctions(filters),
            getEndedAuctions(filters),
          ]);
          rows = [...unwrap(active), ...unwrap(ended)];
        } else if (status === 'active') {
          rows = unwrap(await getAuctions(filters));
        } else {
          rows = unwrap(await getAuctions({ ...filters, status }));
        }

        if (!alive) return;
        const normalized = rows.map(normalizeAuction);
        setLots(normalized);
        onLoadRef.current?.(normalized, status);
      } catch (err) {
        if (alive) setError(err.response?.data?.error || 'Could not load lots right now.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => { alive = false; };
  }, [status, categoryId, debouncedSearch, ordering, enabled, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return {
    lots,
    loading,
    error,
    reload,
    onLoad: (fn) => { onLoadRef.current = fn; },
  };
};

// Convenience selectors used across the marketplace surfaces.
export const splitLots = (lots) => {
  const now = Date.now();
  const live = [];
  const upcoming = [];
  const closed = [];

  lots.forEach((lot) => {
    const start = new Date(lot.startTime).getTime();
    const end = new Date(lot.endTime).getTime();
    if (lot.isLive && end > now) live.push(lot);
    else if (start > now) upcoming.push(lot);
    else closed.push(lot);
  });

  live.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
  upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  closed.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

  return { live, upcoming, closed };
};

export const closingWithin = (lots, ms = 24 * 60 * 60 * 1000) => {
  const now = Date.now();
  return lots.filter((lot) => {
    const end = new Date(lot.endTime).getTime();
    return lot.isLive && end > now && end - now <= ms;
  });
};
