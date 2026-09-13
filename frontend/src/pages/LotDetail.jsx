import { useContext, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { useLiveAuction } from '../hooks/useLiveAuction';
import { useAuctions } from '../hooks/useAuctions';
import { useWatchlist } from '../hooks/useWatchlist';
import { lotNumber, money, saleTime } from '../lib/format';
import { Container, SectionHead } from '../components/layout/Section';
import { Reveal } from '../components/ui/Motion';
import { ActionLink } from '../components/ui/Button';
import { LiveToast, Skeleton } from '../components/ui/Feedback';
import { LotGallery } from '../components/auction/LotGallery';
import { BidConsole } from '../components/auction/BidConsole';
import { BidLedger } from '../components/auction/BidLedger';
import { LotRail } from '../components/auction/Lot';

const DetailRow = ({ term, children }) => (
  <div className="flex items-baseline justify-between gap-6 border-b border-line-soft py-3.5 last:border-0">
    <dt className="label text-[10px]">{term}</dt>
    <dd className="text-right text-sm text-bone-2">{children}</dd>
  </div>
);

const LoadingLot = () => (
  <Container className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
    <Skeleton className="aspect-[4/5] w-full" />
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-4/5" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  </Container>
);

const LotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { auctionCache } = useContext(AppContext);

  const {
    lot, loading, loadError,
    currentBid, bids, bidderCount, myBid,
    isRegistered, checkingRegistration, registering, register,
    submitBid, submitting, bidError,
    liveEvent, connected,
  } = useLiveAuction(id, user);

  const { isSaved, toggle } = useWatchlist(user);

  const { lots: activeLots } = useAuctions({ status: 'active', initial: auctionCache.active });
  const related = activeLots
    .filter((row) => String(row.id) !== String(id) && row.categoryId === lot?.categoryId)
    .slice(0, 8);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [id]);

  if (loading && !lot) return <div className="pt-[72px]"><LoadingLot /></div>;

  if (!lot) {
    return (
      <div className="pt-[72px]">
        <Container className="py-32 text-center">
          <p className="display text-4xl text-bone">{loadError || 'Lot not found'}</p>
          <ActionLink to="/all-auctions" variant="ghost" size="md" className="mt-8">
            Back to the catalogue
          </ActionLink>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-[72px]">
      <LiveToast event={liveEvent}>
        <p className="text-sm text-bone">
          <span className="text-bone-3">{liveEvent?.bidder} bid</span>{' '}
          <span className="figure text-signal">{money(liveEvent?.amount)}</span>
        </p>
      </LiveToast>

      <Container className="py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-bone-4 transition-colors hover:text-bone"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          Back
        </button>
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <LotGallery lot={lot} />
        </div>

        <BidConsole
          lot={lot}
          currentBid={currentBid}
          bidCount={bids.length || lot.bidCount}
          bidderCount={bidderCount}
          myBid={myBid}
          isRegistered={isRegistered}
          checkingRegistration={checkingRegistration}
          registering={registering}
          onRegister={register}
          onBid={submitBid}
          submitting={submitting}
          bidError={bidError}
          isSaved={isSaved(lot.id)}
          onToggleSave={() => (user ? toggle(lot.id) : navigate('/login'))}
          connected={connected}
        />
      </Container>

      {/* Catalogue note + condition line + the public ledger. */}
      <div className="border-t border-line">
        <Container className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
          <Reveal>
            <h2 className="label mb-6">Catalogue note</h2>
            <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-bone-2">
              {lot.description || 'No catalogue note was provided for this lot.'}
            </p>

            <dl className="mt-12 border-t border-line">
              <DetailRow term="Lot">{lotNumber(lot.id)}</DetailRow>
              <DetailRow term="Department">{lot.category}</DetailRow>
              <DetailRow term="Consignor">{lot.sellerName || 'Private consignor'}</DetailRow>
              <DetailRow term="Opening price">{money(lot.startingBid)}</DetailRow>
              <DetailRow term="Bidding opened">{saleTime(lot.startTime, { withYear: true })}</DetailRow>
              <DetailRow term="Bidding closes">{saleTime(lot.endTime, { withYear: true })}</DetailRow>
            </dl>
          </Reveal>

          <Reveal delay={0.05}>
            <BidLedger bids={bids} currentUserId={user?.id} />
          </Reveal>
        </Container>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line py-20 md:py-24">
          <Container className="mb-10">
            <SectionHead
              title={`More in ${lot.category}`}
              actionTo={`/all-auctions?category=${lot.categoryId}`}
              actionLabel="See department"
            />
          </Container>
          <Container>
            <LotRail lots={related} />
          </Container>
        </section>
      )}
    </div>
  );
};

export default LotDetail;
