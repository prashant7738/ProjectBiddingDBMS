import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Trash, PencilSimple, ArrowsClockwise } from '@phosphor-icons/react';
import {
  closeExpiredAuctions,
  deleteAdminAuction,
  deleteAdminUser,
  getAdminAuctions,
  getAdminStats,
  getAdminUsers,
  getMediaUrl,
  updateAdminUserBalance,
} from '../api/auth';
import { initialOf, lotNumber, money, saleTime } from '../lib/format';
import { Container } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { Field, ImagePlaceholder } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { Notice, Spinner } from '../components/ui/Feedback';
import { LiveTag, Stat, Tag } from '../components/ui/Data';

/* Admin rows carry fields the public normalizer deliberately drops. */
const normalizeAdminRow = (raw) => {
  const startTime = raw?.start_time ? new Date(raw.start_time) : new Date();
  const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3_600_000);
  const now = new Date();
  const isLive = (raw?.is_live ?? raw?.isLive) !== undefined
    ? (raw?.is_live ?? raw?.isLive)
    : (now >= startTime && now <= endTime && (raw?.is_active ?? true));

  return {
    id: raw?.id ?? raw?.auction_id,
    title: raw?.title ?? 'Untitled lot',
    image: getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
    category: raw?.category_name ?? raw?.category ?? 'general',
    sellerName: raw?.seller_name ?? raw?.sellerName ?? 'Unknown',
    sellerId: raw?.seller_id ?? 'N/A',
    sellerEmail: raw?.seller_email ?? 'N/A',
    sellerBalance: raw?.seller_balance ?? null,
    currentBid: Number(raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0),
    startingPrice: Number(raw?.starting_price ?? 0),
    bidCount: raw?.bid_count ?? 0,
    description: raw?.description ?? '',
    winnerName: raw?.winner_name ?? null,
    winnerId: raw?.winner_id ?? null,
    winnerEmail: raw?.winner_email ?? null,
    winnerBalance: raw?.winner_balance ?? null,
    startTime,
    endTime,
    isLive,
    isUpcoming: startTime > now,
    isEnded: endTime < now,
  };
};

/** Fourteen-day activity, drawn without pulling in a chart library. */
const Sparkline = ({ data, empty }) => {
  if (!data?.length || data.every((d) => d.count === 0)) {
    return <p className="py-8 text-center text-xs text-bone-4">{empty}</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-24 items-end gap-1.5 border-b border-line">
      {data.map((day) => (
        <div
          key={day.day}
          title={`${day.day}: ${day.count}`}
          className="flex-1 bg-signal/70 transition-colors hover:bg-signal"
          style={{ height: `${Math.max(3, (day.count / max) * 100)}%` }}
        />
      ))}
    </div>
  );
};

const AdminConsole = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('auctions');

  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null); // 'details' | 'delete' | 'balance' | 'deleteUser'
  const [balanceDraft, setBalanceDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [settling, setSettling] = useState(false);

  const bounceToLogin = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  }, [navigate]);

  const loadAuctions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminAuctions();
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setRows(list.map(normalizeAdminRow));
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) { bounceToLogin(); return; }
      setError(err.response?.data?.error || 'Could not load lots.');
    } finally {
      setLoading(false);
    }
  }, [bounceToLogin]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminUsers();
      setUsers(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) { bounceToLogin(); return; }
      setError(err.response?.data?.error || 'Could not load accounts.');
    } finally {
      setLoading(false);
    }
  }, [bounceToLogin]);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    if (tab === 'auctions') {
      loadAuctions();
      getAdminStats().then((res) => setAnalytics(res.data)).catch(() => {});
    } else {
      loadUsers();
    }
  }, [tab, navigate, loadAuctions, loadUsers]);

  const stats = useMemo(() => ({
    total: rows.length,
    live: rows.filter((r) => r.isLive).length,
    upcoming: rows.filter((r) => r.isUpcoming).length,
    ended: rows.filter((r) => r.isEnded).length,
  }), [rows]);

  const visibleRows = useMemo(() => {
    let list = rows;
    if (statusFilter === 'live') list = list.filter((r) => r.isLive);
    else if (statusFilter === 'upcoming') list = list.filter((r) => r.isUpcoming);
    else if (statusFilter === 'ended') list = list.filter((r) => r.isEnded);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.sellerName.toLowerCase().includes(q));
    }
    return list;
  }, [rows, statusFilter, query]);

  const visibleUsers = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, query]);

  const settleExpired = async () => {
    setSettling(true);
    setNotice('');
    try {
      const res = await closeExpiredAuctions();
      const count = res.data?.closed_count ?? 0;
      setNotice(`Settled ${count} expired ${count === 1 ? 'lot' : 'lots'}.`);
      await loadAuctions();
    } catch (err) {
      setError(err.response?.data?.error || 'Settlement run failed.');
    } finally {
      setSettling(false);
    }
  };

  const removeAuction = async () => {
    setBusy(true);
    try {
      await deleteAdminAuction(selected.id);
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
      setNotice('Lot removed.');
      setMode(null);
      setSelected(null);
    } catch {
      setError('Could not remove that lot.');
    } finally {
      setBusy(false);
    }
  };

  const saveBalance = async () => {
    setBusy(true);
    try {
      const res = await updateAdminUserBalance(selected.id, parseFloat(balanceDraft));
      const updated = res.data;
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setNotice('Balance updated.');
      setMode(null);
      setSelected(null);
      setBalanceDraft('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update that balance.');
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async () => {
    setBusy(true);
    try {
      await deleteAdminUser(selected.id);
      setUsers((prev) => prev.filter((u) => u.id !== selected.id));
      setNotice('Account deleted.');
      setMode(null);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete that account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh">
      {/* Console bar — deliberately not the public header. */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-xl">
        <Container>
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-baseline gap-4">
              <Link to="/" className="display text-lg text-bone">LiveBid</Link>
              <span className="label text-[10px] text-signal">Console</span>
            </div>

            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
                {['auctions', 'users'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setTab(id); setQuery(''); }}
                    className={`border-b-2 pb-1 text-[13px] uppercase tracking-[0.1em] transition-colors ${
                      tab === id ? 'border-signal text-bone' : 'border-transparent text-bone-4 hover:text-bone-2'
                    }`}
                  >
                    {id === 'auctions' ? 'Lots' : 'Accounts'}
                  </button>
                ))}
              </nav>
              <Button variant="ghost" size="sm" onClick={bounceToLogin}>Sign out</Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10">
        {error && <Notice tone="error" className="mb-6">{error}</Notice>}
        {notice && <Notice tone="success" className="mb-6">{notice}</Notice>}

        {tab === 'auctions' ? (
          <>
            <div className="mb-10 grid grid-cols-2 gap-6 border-b border-line pb-8 md:grid-cols-4">
              <Stat label="Lots total">{stats.total}</Stat>
              <Stat label="Live now"><span className="text-signal">{stats.live}</span></Stat>
              <Stat label="Upcoming">{stats.upcoming}</Stat>
              <Stat label="Settled">{stats.ended}</Stat>
            </div>

            {analytics && (
              <div className="mb-10 grid gap-8 border-b border-line pb-10 lg:grid-cols-3">
                <div>
                  <p className="label mb-4">Lots listed · 14 days</p>
                  <Sparkline data={analytics.auctions_by_day} empty="No lots listed in this window." />
                </div>
                <div>
                  <p className="label mb-4">Bids placed · 14 days</p>
                  <Sparkline data={analytics.bids_by_day} empty="No bids in this window." />
                </div>
                <div>
                  <p className="label mb-4">By department</p>
                  {analytics.category_breakdown?.length ? (
                    <div className="space-y-3">
                      {analytics.category_breakdown.map((row) => {
                        const max = Math.max(1, ...analytics.category_breakdown.map((c) => c.count));
                        return (
                          <div key={row.category}>
                            <div className="mb-1.5 flex justify-between text-xs text-bone-3">
                              <span>{row.category}</span>
                              <span className="figure">{row.count}</span>
                            </div>
                            <div className="h-px bg-line">
                              <div className="h-px bg-signal" style={{ width: `${(row.count / max) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-xs text-bone-4">No lots yet.</p>
                  )}
                </div>
              </div>
            )}

            <div className="mb-8 flex flex-wrap items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lots or consignors"
                aria-label="Search lots"
                className="control h-10 w-auto min-w-[16rem] flex-1 py-0 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="control h-10 w-auto py-0 text-sm"
              >
                <option value="all">All lots</option>
                <option value="live">Live</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Settled</option>
              </select>
              <Button variant="ghost" size="md" onClick={settleExpired} disabled={settling}>
                <ArrowsClockwise className="h-4 w-4" aria-hidden="true" />
                {settling ? 'Settling…' : 'Settle expired'}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-24"><Spinner /></div>
            ) : visibleRows.length === 0 ? (
              <p className="border border-dashed border-line py-20 text-center text-sm text-bone-4">No lots match.</p>
            ) : (
              <div className="border-t border-line">
                {visibleRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-5 border-b border-line-soft py-4">
                    <div className="h-14 w-14 overflow-hidden bg-paper-3">
                      {row.image ? (
                        <img src={row.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlaceholder className="h-full w-full" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-3">
                        {row.isLive ? <LiveTag /> : <Tag>{row.isUpcoming ? 'Upcoming' : 'Settled'}</Tag>}
                        <span className="figure text-[11px] text-bone-4">Lot {lotNumber(row.id)}</span>
                      </div>
                      <p className="truncate text-sm text-bone">{row.title}</p>
                      <p className="mt-1 truncate text-xs text-bone-4">
                        {row.sellerName} · {row.bidCount} {row.bidCount === 1 ? 'bid' : 'bids'} · {money(row.currentBid)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(row); setMode('details'); }}>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border-signal/40 text-signal-2 hover:border-signal hover:text-signal"
                        onClick={() => { setSelected(row); setMode('delete'); }}
                      >
                        <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search accounts"
              aria-label="Search accounts"
              className="control mb-8 h-10 py-0 text-sm"
            />

            {loading ? (
              <div className="flex justify-center py-24"><Spinner /></div>
            ) : visibleUsers.length === 0 ? (
              <p className="border border-dashed border-line py-20 text-center text-sm text-bone-4">No accounts match.</p>
            ) : (
              <div className="border-t border-line">
                {visibleUsers.map((person) => (
                  <div key={person.id} className="flex items-center gap-5 border-b border-line-soft py-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line text-xs text-bone-3">
                      {initialOf(person.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-bone">{person.name}</p>
                      <p className="truncate text-xs text-bone-4">{person.email} · #{person.id}</p>
                    </div>
                    <p className="figure hidden text-sm text-settled sm:block">
                      {money(person.balance || 0, { precise: true })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelected(person);
                          setBalanceDraft(String(person.balance ?? 0));
                          setMode('balance');
                        }}
                      >
                        <PencilSimple className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border-signal/40 text-signal-2 hover:border-signal hover:text-signal"
                        onClick={() => { setSelected(person); setMode('deleteUser'); }}
                      >
                        <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Container>

      {/* Lot detail */}
      <Modal
        open={mode === 'details'}
        onClose={() => setMode(null)}
        eyebrow={selected ? `Lot ${lotNumber(selected.id)}` : ''}
        title={selected?.title || ''}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="aspect-[16/9] w-full overflow-hidden bg-paper-3">
              {selected.image ? (
                <img src={selected.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlaceholder className="h-full w-full" />
              )}
            </div>

            <dl className="grid gap-x-8 sm:grid-cols-2">
              {[
                ['Department', selected.category],
                ['Consignor', `${selected.sellerName} (#${selected.sellerId})`],
                ['Consignor email', selected.sellerEmail],
                ['Opening price', money(selected.startingPrice)],
                ['Standing bid', money(selected.currentBid, { precise: true })],
                ['Bids', String(selected.bidCount)],
                ['Opens', saleTime(selected.startTime, { withYear: true })],
                ['Closes', saleTime(selected.endTime, { withYear: true })],
              ].map(([term, value]) => (
                <div key={term} className="flex items-baseline justify-between gap-4 border-b border-line-soft py-2.5">
                  <dt className="label text-[10px]">{term}</dt>
                  <dd className="truncate text-right text-sm text-bone-2">{value}</dd>
                </div>
              ))}
            </dl>

            {selected.isEnded && selected.winnerId && (
              <div className="border border-settled/40 bg-settled/[0.05] p-4">
                <p className="label mb-2 text-settled">Winner</p>
                <p className="text-sm text-bone">{selected.winnerName} · #{selected.winnerId}</p>
                {selected.winnerEmail && <p className="mt-1 text-xs text-bone-3">{selected.winnerEmail}</p>}
                {selected.winnerBalance != null && (
                  <p className="mt-1 text-xs text-bone-3">Balance {money(selected.winnerBalance, { precise: true })}</p>
                )}
              </div>
            )}

            <div>
              <p className="label mb-2">Catalogue note</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-bone-3">
                {selected.description || 'No note provided.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove lot */}
      <Modal
        open={mode === 'delete'}
        onClose={() => setMode(null)}
        eyebrow="This cannot be undone"
        title="Remove lot"
        size="sm"
        footer={(
          <>
            <Button variant="ghost" size="md" onClick={() => setMode(null)}>Cancel</Button>
            <Button variant="signal" size="md" onClick={removeAuction} disabled={busy}>
              {busy ? 'Removing…' : 'Remove'}
            </Button>
          </>
        )}
      >
        <p className="text-sm text-bone-3">
          <span className="text-bone">{selected?.title}</span> and its bid history will be deleted.
        </p>
      </Modal>

      {/* Adjust balance */}
      <Modal
        open={mode === 'balance'}
        onClose={() => setMode(null)}
        eyebrow={selected?.email}
        title="Adjust balance"
        size="sm"
        footer={(
          <>
            <Button variant="ghost" size="md" onClick={() => setMode(null)}>Cancel</Button>
            <Button variant="signal" size="md" onClick={saveBalance} disabled={busy}>
              {busy ? 'Saving…' : 'Update balance'}
            </Button>
          </>
        )}
      >
        <div className="space-y-5">
          <div className="flex items-baseline justify-between border-b border-line-soft pb-3">
            <span className="label">Current</span>
            <span className="figure text-sm text-bone">{money(selected?.balance || 0, { precise: true })}</span>
          </div>
          <Field
            label="New balance"
            type="number"
            min="0"
            step="0.01"
            value={balanceDraft}
            onChange={(e) => setBalanceDraft(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete account */}
      <Modal
        open={mode === 'deleteUser'}
        onClose={() => setMode(null)}
        eyebrow="This cannot be undone"
        title="Delete account"
        size="sm"
        footer={(
          <>
            <Button variant="ghost" size="md" onClick={() => setMode(null)}>Cancel</Button>
            <Button variant="signal" size="md" onClick={removeUser} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        )}
      >
        <p className="text-sm text-bone-3">
          <span className="text-bone">{selected?.name}</span> will be removed along with their bids and consignments.
        </p>
      </Modal>
    </div>
  );
};

export default AdminConsole;
