import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import { AuthContext } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import { money } from '../lib/format';
import { EASE } from '../lib/motion';
import { Container } from '../components/layout/Section';
import { Button, ActionLink } from '../components/ui/Button';
import { Reveal } from '../components/ui/Motion';
import { BidsPanel, SavedPanel, WonPanel } from '../components/account/Panels';
import { SellingPanel } from '../components/account/SellingPanel';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bids', label: 'Your bids' },
  { id: 'won', label: 'Won' },
  { id: 'selling', label: 'Selling' },
  { id: 'saved', label: 'Saved' },
];

const OverviewCard = ({ label, body, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-start justify-between gap-6 border-b border-line py-7 text-left transition-colors hover:bg-bone/2"
  >
    <div>
      <p className="display text-2xl text-bone md:text-3xl">{label}</p>
      <p className="mt-2 max-w-sm text-sm text-bone-3">{body}</p>
    </div>
    <ArrowRight
      className="mt-2 h-5 w-5 shrink-0 text-bone-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-signal"
      aria-hidden="true"
    />
  </button>
);

const Account = () => {
  const { user, refreshProfile } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const watchlist = useWatchlist(user);

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview';
  const setTab = (id) => setParams(id === 'overview' ? {} : { tab: id });

  const refresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="pt-18">
      {/* Ledger header: who you are and what you can spend. */}
      <Container className="py-14 md:py-20">
        <Reveal>
          <p className="label mb-5">Account</p>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <h1 className="display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] text-bone">
              Good to see you,
              <br />
              {firstName}.
            </h1>

            <div className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="label mb-3">Balance available</p>
              <p className="figure text-4xl text-bone md:text-5xl">
                {money(user?.balance ?? 0, { precise: true })}
              </p>
              <Button variant="quiet" size="sm" onClick={refresh} disabled={refreshing} className="mt-4 px-0">
                {refreshing ? 'Refreshing…' : 'Refresh balance'}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>

      <div className="sticky top-18 z-30 border-y border-line bg-paper/90 backdrop-blur-xl">
        <Container>
          <div className="no-scrollbar flex items-center gap-8 overflow-x-auto py-4">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 border-b-2 pb-1 text-[13px] uppercase tracking-widest transition-colors ${
                  tab === item.id ? 'border-signal text-bone' : 'border-transparent text-bone-4 hover:text-bone-2'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {tab === 'overview' && (
            <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
              <div className="border-t border-line">
                <OverviewCard
                  label="Your bids"
                  body="Every lot you're competing for, with its live standing price."
                  onClick={() => setTab('bids')}
                />
                <OverviewCard
                  label="Won"
                  body="Lots you took, and what they settled at."
                  onClick={() => setTab('won')}
                />
                <OverviewCard
                  label="Selling"
                  body="Your consignments, their paddles and their clocks."
                  onClick={() => setTab('selling')}
                />
                <OverviewCard
                  label={`Saved${watchlist.lots.length ? ` · ${watchlist.lots.length}` : ''}`}
                  body="Lots you're watching without having committed a bid."
                  onClick={() => setTab('saved')}
                />
              </div>

              <aside className="lg:pt-7">
                <div className="border border-line p-8">
                  <p className="label mb-4">Have something to sell?</p>
                  <p className="display text-3xl leading-tight text-bone">
                    The room is
                    <br />
                    already here.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-bone-3">
                    Listing is free and takes about two minutes. You set the
                    opening price and the closing time.
                  </p>
                  <ActionLink to="/create-auction" variant="signal" size="md" className="mt-7 w-full">
                    Consign a lot
                  </ActionLink>
                </div>
              </aside>
            </div>
          )}

          {tab === 'bids' && <BidsPanel user={user} />}
          {tab === 'won' && <WonPanel user={user} />}
          {tab === 'selling' && <SellingPanel user={user} />}
          {tab === 'saved' && <SavedPanel watchlist={watchlist} />}
        </motion.div>
      </Container>
    </div>
  );
};

export default Account;
