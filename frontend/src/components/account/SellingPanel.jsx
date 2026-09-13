import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, PencilSimple, Trash, Users } from '@phosphor-icons/react';
import {
  deleteMyAuction,
  getMediaUrl,
  getRegisteredUsers,
  myAuctions,
  updateMyAuction,
} from '../../api/auth';
import { CATEGORIES, CATEGORY_OPTIONS } from '../../lib/categories';
import { initialOf, lotNumber, money, saleTime } from '../../lib/format';
import { Button } from '../ui/Button';
import { Field, ImagePlaceholder, SelectField, TextArea } from '../ui/Form';
import { Modal } from '../ui/Modal';
import { EmptyState, LotRowSkeleton, Notice } from '../ui/Feedback';
import { Tag, LiveTag } from '../ui/Data';

const statusOf = (row) => {
  const now = Date.now();
  const start = new Date(row.start_time).getTime();
  const end = new Date(row.end_time).getTime();
  if (now < start) return 'upcoming';
  if (now >= start && now <= end && row.is_active) return 'live';
  return 'closed';
};

const toLocalInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/** Consignor view: every lot you've listed, and what you can still do to it. */
export const SellingPanel = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null); // 'edit' | 'delete' | 'bidders'
  const [bidders, setBidders] = useState([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '', category_id: '', starting_price: '', end_time: '' });

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await myAuctions(user.id);
      setRows(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load your lots.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const close = () => { setMode(null); setSelected(null); setBidders([]); };

  const openEdit = (row) => {
    setSelected(row);
    setDraft({
      title: row.title || '',
      description: row.description || '',
      category_id: row.category_id || '',
      starting_price: row.starting_price || '',
      end_time: toLocalInput(row.end_time),
    });
    setMode('edit');
  };

  const openBidders = async (row) => {
    setSelected(row);
    setMode('bidders');
    try {
      const res = await getRegisteredUsers(row.id);
      setBidders(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch {
      setBidders([]);
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      // Only send what actually changed — the backend patches in place.
      const changes = {};
      if (draft.title !== selected.title) changes.title = draft.title;
      if (draft.description !== selected.description) changes.description = draft.description;
      if (String(draft.category_id) !== String(selected.category_id)) changes.category_id = parseInt(draft.category_id, 10);
      if (String(draft.starting_price) !== String(selected.starting_price)) changes.starting_price = parseFloat(draft.starting_price);
      if (draft.end_time) {
        const nextEnd = new Date(draft.end_time).toISOString();
        if (nextEnd !== new Date(selected.end_time).toISOString()) changes.end_time = nextEnd;
      }

      const res = await updateMyAuction(user.id, selected.id, changes);
      const updated = res.data;
      setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      setNotice('Lot updated.');
      close();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update that lot.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await deleteMyAuction(user.id, selected.id);
      setRows((prev) => prev.filter((row) => row.id !== selected.id));
      setNotice('Lot withdrawn.');
      close();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not withdraw that lot.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-line-soft">
        {Array.from({ length: 3 }).map((_, i) => <LotRowSkeleton key={i} />)}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="You haven't consigned anything"
        body="List your first lot and it enters the catalogue immediately. It takes about two minutes."
        actionLabel="Sell a lot"
        actionTo="/create-auction"
      />
    );
  }

  return (
    <>
      {error && <Notice tone="error" className="mb-6">{error}</Notice>}
      {notice && <Notice tone="success" className="mb-6">{notice}</Notice>}

      <div className="border-t border-line">
        {rows.map((row) => {
          const state = statusOf(row);
          const editable = state === 'upcoming';

          return (
            <div
              key={row.id}
              className="grid grid-cols-[4rem_1fr] items-start gap-4 border-b border-line-soft py-5 md:grid-cols-[5rem_1fr_auto] md:items-center md:gap-6 md:py-6"
            >
              <div className="h-16 w-16 overflow-hidden bg-paper-3 md:h-20 md:w-20">
                {row.image_url ? (
                  <img src={getMediaUrl(row.image_url)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlaceholder className="h-full w-full" />
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  {state === 'live' ? <LiveTag /> : <Tag>{state === 'upcoming' ? 'Upcoming' : 'Closed'}</Tag>}
                  <span className="figure text-[11px] text-bone-4">Lot {lotNumber(row.id)}</span>
                  <span className="label text-[10px]">{CATEGORIES[row.category_id] || 'General'}</span>
                </div>

                <h3 className="display truncate text-xl text-bone">{row.title}</h3>

                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-xs text-bone-4">
                  <span>Opened {money(row.starting_price || 0)}</span>
                  <span className="text-bone-2">
                    {state === 'closed' ? 'Final' : 'Current'} {money(row.current_highest_bid || 0)}
                  </span>
                  <span>{row.bid_count || 0} {row.bid_count === 1 ? 'bid' : 'bids'}</span>
                  <span>Closes {saleTime(row.end_time)}</span>
                </div>
              </div>

              <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1">
                <Button variant="ghost" size="sm" onClick={() => openBidders(row)}>
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Paddles
                </Button>

                <Link to={`/auctionPage/${row.id}`} className="btn btn-ghost h-9 px-4 text-[11px]">
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  View
                </Link>

                {editable && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                      <PencilSimple className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelected(row); setMode('delete'); }}
                      className="border-signal/40 text-signal-2 hover:border-signal hover:text-signal"
                    >
                      <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                      Withdraw
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit — only reachable before bidding opens. */}
      <Modal
        open={mode === 'edit'}
        onClose={close}
        eyebrow={selected ? `Lot ${lotNumber(selected.id)}` : ''}
        title="Edit lot"
        footer={(
          <>
            <Button variant="ghost" size="md" onClick={close}>Cancel</Button>
            <Button variant="signal" size="md" onClick={saveEdit} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        )}
      >
        <div className="space-y-6">
          <Field
            label="Lot title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <TextArea
            label="Catalogue note"
            rows={4}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              label="Department"
              value={draft.category_id}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
            >
              {CATEGORY_OPTIONS.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectField>
            <Field
              label="Opening price"
              type="number"
              min="0"
              step="0.01"
              value={draft.starting_price}
              onChange={(e) => setDraft({ ...draft, starting_price: e.target.value })}
            />
          </div>
          <Field
            label="Bidding closes"
            type="datetime-local"
            value={draft.end_time}
            onChange={(e) => setDraft({ ...draft, end_time: e.target.value })}
          />
        </div>
      </Modal>

      {/* Withdraw */}
      <Modal
        open={mode === 'delete'}
        onClose={close}
        eyebrow="This cannot be undone"
        title="Withdraw lot"
        size="sm"
        footer={(
          <>
            <Button variant="ghost" size="md" onClick={close}>Keep it listed</Button>
            <Button variant="signal" size="md" onClick={confirmDelete} disabled={busy}>
              {busy ? 'Withdrawing…' : 'Withdraw'}
            </Button>
          </>
        )}
      >
        <p className="text-sm leading-relaxed text-bone-3">
          <span className="text-bone">{selected?.title}</span> will be removed
          from the catalogue along with any registrations it has collected.
        </p>
      </Modal>

      {/* Registered paddles */}
      <Modal
        open={mode === 'bidders'}
        onClose={close}
        eyebrow={selected?.title}
        title="Registered paddles"
        footer={<Button variant="ghost" size="md" onClick={close}>Close</Button>}
      >
        {bidders.length === 0 ? (
          <p className="py-8 text-center text-sm text-bone-4">No one has registered for this lot yet.</p>
        ) : (
          <ul>
            {bidders.map((person, index) => (
              <li key={person.id || index} className="flex items-center gap-4 border-b border-line-soft py-3.5 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center border border-line text-[11px] text-bone-3">
                  {initialOf(person.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-bone">{person.name}</p>
                  <p className="truncate text-xs text-bone-4">{person.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
};
