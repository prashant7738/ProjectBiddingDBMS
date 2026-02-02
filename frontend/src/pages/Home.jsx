import React, { useEffect, useState, useContext } from 'react'
import CategoryFilter from '../components/CategoryFilter'
import AuctionCard from '../components/AuctionCard';
import { getAuctions, getMediaUrl } from '../api/auth';
import { AppContext } from '../context/AppContext';
const Home = () => {
            const { setSelectedItem } = useContext(AppContext);
            const [auctions, setAuctions] = useState([]);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');

            const normalizeAuction = (raw) => {
                const startTime = raw?.start_time ? new Date(raw.start_time) : new Date();
                const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000);
                const now = new Date();
                
                const isLive = (raw?.is_live ?? raw?.isLive) !== undefined 
                    ? (raw?.is_live ?? raw?.isLive) 
                    : (now >= startTime && now <= endTime && (raw?.is_active ?? true));
                
                return {
                    id: raw?.id ?? raw?.auction_id,
                    name: raw?.title ?? 'Untitled Auction',
                    sellerName: raw?.seller_name ?? raw?.sellerName ?? raw?.seller?.name ?? '',
                    category: raw?.category_name ?? raw?.category ?? 'general',
                    image: getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
                    currentBid: raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0,
                    startingBid: raw?.starting_price ?? 0,
                    isLive,
                    startTime,
                    endTime,
                    country: raw?.country ?? 'Unknown',
                    description: raw?.description ?? '',
                    bidCount: raw?.bid_count ?? 0,
                    registered: raw?.registered ?? false,
                };
            };

            useEffect(() => {
                let isMounted = true;
                const loadAuctions = async () => {
                    setLoading(true);
                    setError('');
                    try {
                        const res = await getAuctions();
                        const list = Array.isArray(res.data)
                            ? res.data
                            : Array.isArray(res.data?.results)
                                ? res.data.results
                                : [];
                        if (isMounted) {
                            setAuctions(list.map(normalizeAuction));
                        }
                    } catch (err) {
                        if (isMounted) {
                            setError(err.response?.data?.error || 'Failed to load auctions.');
                        }
                    } finally {
                        if (isMounted) {
                            setLoading(false);
                        }
                    }
                };
                loadAuctions();
                return () => { isMounted = false; };
            }, []);

            const liveAuctions = auctions.filter(a => a.isLive);

            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CategoryFilter />

                    {/* Live Auctions */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                                <span className="text-4xl mr-3">🔥</span>
                                Live Auctions
                            </h2>
                        </div>

                        {loading && liveAuctions.length === 0 ? (
                            <p className="text-gray-600">Loading auctions…</p>
                        ) : liveAuctions.length === 0 ? (
                            <p className="text-gray-600">No live auctions at the moment.</p>
                        ) : error ? (
                            <p className="text-red-600">{error}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {liveAuctions.map(auction => (
                                    <AuctionCard
                                        key={auction.id}
                                        auction={auction}
                                        onClick={() => setSelectedItem(auction)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            );

}

export default Home