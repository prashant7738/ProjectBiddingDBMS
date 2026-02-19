import React, { useEffect, useState, useContext } from 'react';
import AuctionCard from '../components/AuctionCard';
import { getAuctions, getMediaUrl } from '../api/auth';
import { AppContext } from '../context/AppContext';

const AuctionCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        <div className="p-5 space-y-3">
            <div className="h-4 w-20 bg-gray-200 rounded-full" />
            <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-gray-100 rounded-lg" />
            <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded-xl" />
            </div>
            <div className="flex justify-between pt-1">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-3 w-14 bg-gray-100 rounded" />
            </div>
        </div>
    </div>
);

const SkeletonGrid = ({ count = 6, horizontal = false }) =>
    horizontal ? (
        <div className="flex gap-6 min-w-max">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-80 flex-shrink-0">
                    <AuctionCardSkeleton />
                </div>
            ))}
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <AuctionCardSkeleton key={i} />
            ))}
        </div>
    );

const normalizeAuction = (raw) => {
    const startTime = raw?.start_time ? new Date(raw.start_time) : new Date();
    const endTime   = raw?.end_time   ? new Date(raw.end_time)   : new Date(Date.now() + 3600000);
    const now       = new Date();
    const isLive    = (raw?.is_live ?? raw?.isLive) !== undefined
        ? (raw?.is_live ?? raw?.isLive)
        : (now >= startTime && now <= endTime && (raw?.is_active ?? true));

    return {
        id:          raw?.id ?? raw?.auction_id,
        name:        raw?.title ?? 'Untitled Auction',
        sellerName:  raw?.seller_name ?? raw?.sellerName ?? raw?.seller?.name ?? '',
        categoryId:  raw?.category_id ?? 0,
        image:       getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
        currentBid:  raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0,
        startingBid: raw?.starting_price ?? 0,
        isLive,
        startTime,
        endTime,
        country:     raw?.country ?? 'Unknown',
        description: raw?.description ?? '',
        bidCount:    raw?.bid_count ?? 0,
        registered:  raw?.registered ?? false,
    };
};

const Home = () => {
    const { setSelectedItem, selectedCategory, auctionCache, updateActiveCache } = useContext(AppContext);

    const [auctions, setAuctions]   = useState(auctionCache.active);
    const [firstLoad, setFirstLoad] = useState(auctionCache.active.length === 0);
    const [error, setError]         = useState('');

    useEffect(() => {
        let isMounted = true;
        const loadAuctions = async () => {
            if (auctionCache.active.length === 0) setFirstLoad(true);
            setError('');
            try {
                const res  = await getAuctions();
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : [];
                const normalized = list.map(normalizeAuction);
                if (isMounted) {
                    setAuctions(normalized);
                    updateActiveCache(normalized);
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.error || 'Failed to load auctions.');
            } finally {
                if (isMounted) setFirstLoad(false);
            }
        };
        loadAuctions();
        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hotAuctions = auctions
        .filter(a => a.isLive)
        .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    const endingSoon = auctions.filter(a => {
        const timeLeft = new Date(a.endTime) - new Date();
        return a.isLive && timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000;
    }).sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

    const filteredAuctions = selectedCategory === 0
        ? auctions
        : auctions.filter(a => a.categoryId === selectedCategory);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <section className="mb-12">
                <div className="section-header flex items-center justify-between mb-8">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 flex items-center">
                        <span className="fire-icon text-5xl md:text-6xl mr-4">🔥</span>
                        <span className="gradient-text font-outfit">Hot Auctions</span>
                    </h2>
                    {!firstLoad && hotAuctions.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full">
                            <span className="text-purple-700 font-bold text-sm">{hotAuctions.length} Live Now</span>
                        </div>
                    )}
                </div>

                {firstLoad ? (
                    <SkeletonGrid count={6} />
                ) : error ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-red-700 font-semibold text-lg">{error}</p>
                    </div>
                ) : hotAuctions.length === 0 ? (
                    <div className="empty-state rounded-2xl p-12 text-center">
                        <div className="text-7xl mb-6">😴</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Hot Auctions</h3>
                        <p className="text-gray-600 text-lg font-medium">Check back soon for exciting new auctions!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hotAuctions.slice(0, 6).map((auction, index) => (
                            <div key={auction.id} style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}>
                                <AuctionCard auction={auction} onClick={() => setSelectedItem(auction)} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {(firstLoad || endingSoon.length > 0) && (
                <section className="mb-12">
                    <div className="section-header flex items-center justify-between mb-8">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center">
                            <span className="text-4xl md:text-5xl mr-4">⏰</span>
                            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-outfit">
                                Ending Soon
                            </span>
                        </h2>
                        {!firstLoad && (
                            <div className="bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2 rounded-full">
                                <span className="text-red-700 font-bold text-sm">Last Chance!</span>
                            </div>
                        )}
                    </div>

                    {firstLoad ? (
                        <SkeletonGrid count={3} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {endingSoon.slice(0, 3).map((auction, index) => (
                                <div key={auction.id} style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}>
                                    <AuctionCard auction={auction} onClick={() => setSelectedItem(auction)} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <section className="mb-12">
                <div className="section-header mb-8">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center">
                        <span className="text-4xl md:text-5xl mr-4">🔍</span>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-outfit">
                            Explore More
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto explore-scroll pb-4">
                    {firstLoad ? (
                        <SkeletonGrid count={5} horizontal />
                    ) : (
                        <div className="flex gap-6 min-w-max">
                            {filteredAuctions.slice(0, 10).map((auction, index) => (
                                <div
                                    key={auction.id}
                                    className="w-80 flex-shrink-0"
                                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.05}s backwards` }}
                                >
                                    <AuctionCard auction={auction} onClick={() => setSelectedItem(auction)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;