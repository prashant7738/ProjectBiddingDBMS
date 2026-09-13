import { useCallback, useEffect, useState } from 'react';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '../api/auth';
import { normalizeAuction } from '../lib/normalizeAuction';

// Watchlist membership for the signed-in user. Toggles apply optimistically and
// roll back if the server disagrees, so the star never lies for a whole request.
export const useWatchlist = (user) => {
  const [saved, setSaved] = useState(() => new Set());
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.id));

  const load = useCallback(async () => {
    if (!user?.id) {
      setSaved(new Set());
      setLots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getWatchlist(user.id);
      const rows = Array.isArray(res.data) ? res.data : [];
      setLots(rows.map(normalizeAuction));
      setSaved(new Set(rows.map((row) => String(row.id ?? row.auction_id))));
    } catch {
      setLots([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const isSaved = useCallback((id) => saved.has(String(id)), [saved]);

  const toggle = useCallback(async (id) => {
    if (!user?.id) return false;
    const key = String(id);
    const wasSaved = saved.has(key);

    setSaved((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(key); else next.add(key);
      return next;
    });
    if (wasSaved) setLots((prev) => prev.filter((lot) => String(lot.id) !== key));

    try {
      if (wasSaved) await removeFromWatchlist(id);
      else await addToWatchlist(id);
      return !wasSaved;
    } catch {
      setSaved((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(key); else next.delete(key);
        return next;
      });
      return wasSaved;
    }
  }, [saved, user?.id]);

  return { saved, lots, loading, isSaved, toggle, reload: load };
};
