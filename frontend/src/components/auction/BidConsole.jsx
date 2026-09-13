import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookmarkSimple, Check, Gavel, Trophy } from '@phosphor-icons/react';
import { AuthContext } from '../../context/AuthContext';
import { money, saleTime, suggestedIncrement } from '../../lib/format';
import { EASE } from '../../lib/motion';
import { Button } from '../ui/Button';
import { Countdown, Figure, LiveTag, Tag } from '../ui/Data';
import { Notice, Spinner } from '../ui/Feedback';

const Divider = () => <div className="my-7 border-t border-line" />;

/**
 * Everything a bidder can do with a lot, in one column.
 *
 * The panel is a small state machine: closed, your own lot, signed out,
 * unregistered, registered-but-not-open, and live. Each state shows exactly
 * one next action — there is never a disabled bid box with no explanation.
 */
export const BidConsole = ({
  lot,
  currentBid,
  bidCount,
  bidderCount,
  myBid,
  isRegistered,
  checkingRegistration,
  registering,
  onRegister,
  onBid,
  submitting,
  bidError,
  isSaved,
  onToggleSave,
  connected,
}) => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');

  const increment = suggestedIncrement(currentBid);
  const minimumNext = Number(currentBid || 0) + increment;
  const ended = new Date(lot.endTime).getTime() <= Date.now();
  const notYetOpen = new Date(lot.startTime).getTime() > Date.now();
  const isSeller = user && lot.sellerId != null && String(user.id) === String(lot.sellerId);

  const submit = async (event) => {
    event.preventDefault();
    const ok = await onBid(amount);
    if (ok) setAmount('');
  };

  const quickSet = (multiplier) => setAmount(String(Number(currentBid || 0) + increment * multiplier));

  return (
    <div className="lg:sticky lg:top-28">
      {/* Header line: status, socket health, save. */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {ended ? <Tag>Closed</Tag> : notYetOpen ? <Tag>Upcoming</Tag> : <LiveTag />}
          {!ended && (
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-bone-4">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-settled' : 'bg-bone-4'}`} />
              {connected ? 'Realtime' : 'Reconnecting'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={isSaved}
          className={`flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition-colors ${
            isSaved ? 'border-bone text-bone' : 'border-line text-bone-3 hover:border-bone-4 hover:text-bone-2'
          }`}
        >
          <BookmarkSimple className="h-3.5 w-3.5" weight={isSaved ? 'fill' : 'regular'} aria-hidden="true" />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      <h1 className="display mt-6 text-4xl leading-[0.95] text-bone md:text-5xl">{lot.name}</h1>

      <p className="mt-4 text-sm text-bone-3">
        {lot.sellerName ? (
          <>Consigned by <span className="text-bone-2">{lot.sellerName}</span></>
        ) : (
          'Private consignor'
        )}
        <span className="mx-2 text-bone-4">·</span>
        {lot.category}
      </p>

      <Divider />

      {/* Price + clock, side by side: the two numbers that decide everything. */}
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div>
          <p className="label mb-3">{ended ? 'Hammer price' : 'Current bid'}</p>
          <Figure value={currentBid} precise className="block text-4xl text-bone md:text-5xl" />
          <p className="mt-3 text-xs text-bone-4">
            {bidCount} {bidCount === 1 ? 'bid' : 'bids'} · {bidderCount} {bidderCount === 1 ? 'bidder' : 'bidders'}
            {lot.startingBid ? <> · opened at {money(lot.startingBid)}</> : null}
          </p>
        </div>

        <div>
          <p className="label mb-3">{ended ? 'Closed' : notYetOpen ? 'Opens' : 'Closes in'}</p>
          {notYetOpen ? (
            <p className="figure text-xl text-bone">{saleTime(lot.startTime)}</p>
          ) : (
            <Countdown end={lot.endTime} variant="panel" />
          )}
        </div>
      </div>

      <Divider />

      {/* ── State machine ─────────────────────────────────────────────── */}

      {ended ? (
        <div className="border border-line p-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-settled" weight="fill" aria-hidden="true" />
            <p className="label text-bone-2">Result</p>
          </div>
          {lot.winnerName ? (
            <>
              <p className="display mt-4 text-3xl text-bone">{lot.winnerName}</p>
              <p className="mt-2 text-sm text-bone-3">
                Took the lot at <span className="text-bone">{money(currentBid, { precise: true })}</span>.
              </p>
            </>
          ) : (
            <>
              <p className="display mt-4 text-3xl text-bone-3">Passed</p>
              <p className="mt-2 text-sm text-bone-4">This lot closed without a bid.</p>
            </>
          )}
        </div>
      ) : isSeller ? (
        <div className="border border-line p-6">
          <p className="label mb-3">Your lot</p>
          <p className="text-sm leading-relaxed text-bone-3">
            You are the consignor. Watch the ledger below as bids arrive — you
            can edit or withdraw this lot from your account until it opens.
          </p>
          <Link
            to="/dashboard?tab=selling"
            className="link-draw mt-5 inline-block text-[13px] uppercase tracking-[0.1em] text-bone"
          >
            Manage in account
          </Link>
        </div>
      ) : !user ? (
        <div className="border border-line p-6">
          <p className="label mb-3">Registration required</p>
          <p className="text-sm leading-relaxed text-bone-3">
            Bidding is open to registered accounts. Sign in to take a paddle for
            this lot.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="btn btn-signal h-11 px-6">Sign in</Link>
            <Link to="/register" className="btn btn-ghost h-11 px-6">Create account</Link>
          </div>
        </div>
      ) : checkingRegistration ? (
        <div className="flex items-center gap-3 border border-line p-6 text-sm text-bone-3">
          <Spinner className="h-4 w-4" />
          Checking your paddle…
        </div>
      ) : !isRegistered ? (
        <div className="border border-line p-6">
          <p className="label mb-3">Take a paddle</p>
          <p className="text-sm leading-relaxed text-bone-3">
            Register for this lot to place bids. It takes one click and costs
            nothing.
          </p>
          <Button
            variant="signal"
            size="block"
            className="mt-6"
            onClick={onRegister}
            disabled={registering}
          >
            {registering ? 'Registering…' : 'Register to bid'}
            <Gavel className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : notYetOpen ? (
        <div className="flex items-start gap-3 border border-line p-6">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-settled" aria-hidden="true" />
          <div>
            <p className="text-sm text-bone">You hold paddle #{String(user.id).padStart(3, '0')}.</p>
            <p className="mt-1.5 text-sm text-bone-3">
              Bidding opens {saleTime(lot.startTime)}.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="mb-4 flex items-center justify-between">
            <p className="label">Your bid</p>
            <p className="text-[11px] text-bone-4">
              Paddle #{String(user.id).padStart(3, '0')}
            </p>
          </div>

          {/* Quick increments do the mental arithmetic for the bidder. */}
          <div className="mb-3 flex flex-wrap gap-2">
            {[1, 2, 5].map((multiplier) => (
              <button
                key={multiplier}
                type="button"
                onClick={() => quickSet(multiplier)}
                className="figure border border-line px-3 py-2 text-xs text-bone-2 transition-colors hover:border-bone hover:text-bone"
              >
                +{money(increment * multiplier)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-bone-4">Rs</span>
              <input
                type="number"
                inputMode="decimal"
                min={minimumNext}
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={String(minimumNext)}
                aria-label="Bid amount"
                className="control h-14 pl-10 text-lg"
              />
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="signal"
                size="lg"
                magnetic
                disabled={submitting || !amount}
                className="h-14 w-full sm:w-auto"
              >
                {submitting ? 'Placing…' : 'Place bid'}
              </Button>
            </motion.div>
          </div>

          <p className="mt-3 text-xs text-bone-4">
            Minimum next bid {money(minimumNext)}. Bids are binding and public.
          </p>

          {bidError && <Notice tone="error" className="mt-4">{bidError}</Notice>}

          {myBid?.amount != null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-5 flex items-center justify-between border border-line px-4 py-3"
            >
              <span className="label">Your standing bid</span>
              <span className="figure text-sm text-bone">{money(myBid.amount, { precise: true })}</span>
            </motion.div>
          )}
        </form>
      )}

      {bidError && (isSeller || !isRegistered) && (
        <Notice tone="error" className="mt-4">{bidError}</Notice>
      )}
    </div>
  );
};
