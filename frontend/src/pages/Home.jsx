import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import { AppContext } from '../context/AppContext';
import { useAuctions, closingWithin, splitLots } from '../hooks/useAuctions';
import { DEPARTMENTS } from '../lib/categories';
import { EASE } from '../lib/motion';
import { lotNumber, money } from '../lib/format';
import { usePointerTilt } from '../hooks/useInteractions';
import { Container, SectionHead } from '../components/layout/Section';
import { ActionLink } from '../components/ui/Button';
import { Countdown, Figure, LiveTag, Rule, Stat } from '../components/ui/Data';
import { Reveal, RevealGroup, RevealItem, RevealLines } from '../components/ui/Motion';
import { LotRowSkeleton } from '../components/ui/Feedback';
import { Ticker } from '../components/ui/Ticker';
import { LotRail, LotRow } from '../components/auction/Lot';
import { ImagePlaceholder } from '../components/ui/Form';

/* ── Hero ─────────────────────────────────────────────────────────────── */

const FeaturedLot = ({ lot }) => {
  const tilt = usePointerTilt(5);

  if (!lot) {
    return (
      <div className="h-[clamp(18rem,44dvh,28rem)] w-full border border-line">
        <ImagePlaceholder className="h-full w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE, delay: 0.25 }}
      style={{ perspective: 1200 }}
    >
      <Link
        to={`/auctionPage/${lot.id}`}
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="group block"
      >
        <motion.div
          style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d' }}
          className="relative h-[clamp(18rem,44dvh,28rem)] overflow-hidden bg-paper-3"
        >
          {lot.image ? (
            <motion.img
              src={lot.image}
              alt={lot.name}
              style={{ x: tilt.shiftX, y: tilt.shiftY }}
              className="h-[104%] w-[104%] -translate-x-[2%] -translate-y-[2%] object-cover"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </motion.div>

        {/* Catalogue caption sits under the plate, never over it. */}
        <div className="border-x border-b border-line">
          <div className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-3">
            <span className="figure text-[11px] text-bone-4">Lot {lotNumber(lot.id)}</span>
            {lot.isLive ? <LiveTag /> : <span className="label text-[10px]">Upcoming</span>}
          </div>

          <div className="flex items-end justify-between gap-6 px-5 py-5">
            <div className="min-w-0">
              <h2 className="display truncate text-2xl text-bone">{lot.name}</h2>
              <p className="mt-2 text-xs text-bone-4">
                {lot.bidCount} {lot.bidCount === 1 ? 'bid' : 'bids'} · {lot.category}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <Figure value={lot.currentBid} className="block text-xl text-bone" />
              <Countdown end={lot.endTime} className="mt-1.5 block text-xs" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Hero = ({ featured, liveCount, totalCount, closingCount, loading }) => (
  <section className="relative pt-[72px]">
    <Container className="grid items-center gap-12 py-10 md:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
      <div>
        <h1 className="display text-[clamp(2.75rem,8.5vw,7rem)] leading-[0.86] text-bone">
          <RevealLines lines={['Every bid', 'changes', 'the game.']} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          className="mt-8 max-w-md text-base leading-relaxed text-bone-3"
        >
          A real-time saleroom for things worth competing over. Take a paddle,
          watch the clock, win the lot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <ActionLink to="/all-auctions?status=live" variant="signal" size="lg" magnetic>
            Explore live lots
          </ActionLink>
          <ActionLink to="/create-auction" variant="ghost" size="lg">
            Sell a lot
          </ActionLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7"
        >
          <Stat label="Live now">{loading ? '—' : liveCount}</Stat>
          <Stat label="Lots listed">{loading ? '—' : totalCount}</Stat>
          <Stat label="Closing today">{loading ? '—' : closingCount}</Stat>
        </motion.div>
      </div>

      <FeaturedLot lot={featured} />
    </Container>
  </section>
);

/* ── Departments ──────────────────────────────────────────────────────── */

const Departments = ({ lots }) => {
  const [active, setActive] = useState(DEPARTMENTS[0].id);

  const counts = useMemo(() => {
    const map = {};
    lots.forEach((lot) => { map[lot.categoryId] = (map[lot.categoryId] || 0) + 1; });
    return map;
  }, [lots]);

  // Each department borrows the photograph of one of its own lots.
  const previews = useMemo(() => {
    const map = {};
    DEPARTMENTS.forEach((dept) => {
      map[dept.id] = lots.find((lot) => lot.categoryId === dept.id && lot.image)?.image || null;
    });
    return map;
  }, [lots]);

  const activeDept = DEPARTMENTS.find((dept) => dept.id === active) ?? DEPARTMENTS[0];

  return (
    <Container className="py-24 md:py-32">
      <SectionHead index="02" title="Departments" className="mb-14" />

      <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <RevealGroup as="ul" className="border-t border-line">
          {DEPARTMENTS.map((dept) => (
            <RevealItem as="li" key={dept.id}>
              <Link
                to={`/all-auctions?category=${dept.id}`}
                onMouseEnter={() => setActive(dept.id)}
                onFocus={() => setActive(dept.id)}
                className="group flex items-center justify-between gap-8 border-b border-line py-7 transition-colors md:py-9"
              >
                <div className="flex min-w-0 items-baseline gap-5">
                  <span className="figure text-xs text-bone-4">
                    {String(dept.id).padStart(2, '0')}
                  </span>
                  <span
                    className={`display truncate text-4xl transition-all duration-500 md:text-6xl ${
                      active === dept.id ? 'text-bone md:translate-x-2' : 'text-bone-4'
                    }`}
                  >
                    {dept.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <span className="figure hidden text-xs text-bone-4 sm:block">
                    {counts[dept.id] || 0} lots
                  </span>
                  <ArrowRight
                    className={`h-5 w-5 transition-all duration-300 ${
                      active === dept.id ? 'translate-x-0 text-signal' : '-translate-x-2 text-bone-4 opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* The preview only exists where there's room for it to mean something. */}
        <Reveal className="hidden lg:block">
          <div className="relative aspect-[3/4] overflow-hidden border border-line bg-paper-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDept.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0"
              >
                {previews[activeDept.id] ? (
                  <img src={previews[activeDept.id]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlaceholder className="h-full w-full" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-bone-3">{activeDept.note}</p>
        </Reveal>
      </div>
    </Container>
  );
};

/* ── How it works ─────────────────────────────────────────────────────── */

const STEPS = [
  {
    index: '01',
    title: 'List',
    body: 'Photograph the piece, set an opening price and a closing time. Your lot enters the catalogue immediately.',
  },
  {
    index: '02',
    title: 'Bid',
    body: 'Take a paddle and bid in real time. Every bid is public, timestamped and binding the moment it lands.',
  },
  {
    index: '03',
    title: 'Win',
    body: 'Highest bid when the clock hits zero takes the lot. The balance settles against your account.',
  },
];

const HowItWorks = () => (
  <section className="border-y border-line bg-paper-2/40">
    <Container className="py-24 md:py-32">
      <SectionHead index="04" title="How the room works" className="mb-16" />

      <RevealGroup className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        {STEPS.map((step) => (
          <RevealItem key={step.index} className="bg-paper p-8 md:p-10">
            <span className="figure text-sm text-signal">{step.index}</span>
            <h3 className="display mt-8 text-4xl text-bone md:text-5xl">{step.title}</h3>
            <p className="mt-5 text-sm leading-relaxed text-bone-3">{step.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Container>
  </section>
);

/* ── Page ─────────────────────────────────────────────────────────────── */

const Home = () => {
  const { auctionCache, updateActiveCache } = useContext(AppContext);
  const { lots, loading, error } = useAuctions({
    status: 'active',
    initial: auctionCache.active,
  });

  // Keep the shared cache warm so a return visit paints instantly.
  useEffect(() => {
    if (lots.length) updateActiveCache(lots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots]);

  const { live, upcoming } = splitLots(lots);
  const closing = closingWithin(lots);
  const featured = live.find((lot) => lot.image) ?? live[0] ?? lots[0] ?? null;

  return (
    <>
      <Hero
        featured={featured}
        liveCount={live.length}
        totalCount={lots.length}
        closingCount={closing.length}
        loading={loading}
      />

      <Ticker lots={live} />

      {/* 01 — the floor, as a catalogue list rather than a grid of tiles. */}
      <Container className="py-24 md:py-32">
        <SectionHead
          index="01"
          title="On the floor"
          note="Lots taking bids this minute, ordered by how soon they close."
          actionTo="/all-auctions?status=live"
          actionLabel="All live lots"
          className="mb-14"
        />

        {loading ? (
          <div className="border-t border-line-soft">
            {Array.from({ length: 5 }).map((_, index) => <LotRowSkeleton key={index} />)}
          </div>
        ) : error ? (
          <p className="border border-line px-6 py-16 text-center text-sm text-bone-3">{error}</p>
        ) : live.length === 0 ? (
          <div className="border border-dashed border-line px-8 py-20 text-center">
            <p className="display text-3xl text-bone">The floor is quiet</p>
            <p className="mx-auto mt-4 max-w-sm text-sm text-bone-3">
              Nothing is taking bids right now. {upcoming.length > 0
                ? `${upcoming.length} ${upcoming.length === 1 ? 'lot opens' : 'lots open'} shortly.`
                : 'Be the first to consign something.'}
            </p>
            <ActionLink to="/create-auction" variant="ghost" size="md" className="mt-8">
              Sell a lot
            </ActionLink>
          </div>
        ) : (
          <div className="border-t border-line">
            {live.slice(0, 6).map((lot, index) => (
              <LotRow key={lot.id} lot={lot} index={index} />
            ))}
          </div>
        )}
      </Container>

      <Departments lots={lots} />

      {/* 03 — a different rhythm: horizontal, image-led, tense. */}
      {(closing.length > 0 || upcoming.length > 0) && (
        <section className="border-t border-line py-24 md:py-32">
          <Container className="mb-12">
            <SectionHead
              index="03"
              title={closing.length > 0 ? 'Closing today' : 'Opening soon'}
              note={
                closing.length > 0
                  ? 'Final hours. These lots settle before the day is out.'
                  : 'Scheduled lots warming up. Register early and be there when the clock starts.'
              }
            />
          </Container>
          <Container>
            <LotRail lots={(closing.length > 0 ? closing : upcoming).slice(0, 8)} />
          </Container>
        </section>
      )}

      <HowItWorks />

      {/* Closing statement. */}
      <Container className="py-28 md:py-40">
        <Reveal className="max-w-4xl">
          <p className="display text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] text-bone">
            Something in your
            <br />
            room is worth
            <br />
            more than you think.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <ActionLink to="/create-auction" variant="signal" size="lg" magnetic>
              Start an auction
            </ActionLink>
            <ActionLink to="/all-auctions" variant="ghost" size="lg">
              Explore live auctions
            </ActionLink>
          </div>
        </Reveal>

        <Rule className="mt-20" />
        <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-bone-4">
          <span>Registration is free. Bidding is binding.</span>
          <span className="figure">{money(lots.reduce((sum, lot) => sum + Number(lot.currentBid || 0), 0))} on the floor</span>
        </Reveal>
      </Container>
    </>
  );
};

export default Home;
