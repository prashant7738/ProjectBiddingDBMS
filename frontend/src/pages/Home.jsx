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
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse-fire {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                @keyframes shimmer-text {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }
                .section-header {
                    animation: fadeInUp 0.6s ease-out;
                }
                .fire-icon {
                    animation: pulse-fire 2s ease-in-out infinite;
                    filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4));
                }
                .gradient-text {
                    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer-text 3s linear infinite;
                }
                .loading-spinner {
                    border: 4px solid rgba(124, 58, 237, 0.1);
                    border-top: 4px solid #7c3aed;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .empty-state {
                    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                    border: 2px dashed #7c3aed;
                }
            `}</style>

            <CategoryFilter />

            {/* Live Auctions */}
            <section className="mb-12">
                <div className="section-header flex items-center justify-between mb-8">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 flex items-center">
                        <span className="fire-icon text-5xl md:text-6xl mr-4">🔥</span>
                        <span className="gradient-text">Live Auctions</span>
                    </h2>
                    {liveAuctions.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full">
                            <span className="text-purple-700 font-bold text-sm">{liveAuctions.length} Live Now</span>
                        </div>
                    )}
                </div>

                {loading && liveAuctions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="loading-spinner mb-4"></div>
                        <p className="text-gray-600 font-semibold">Loading auctions…</p>
                    </div>
                ) : liveAuctions.length === 0 ? (
                    <div className="empty-state rounded-2xl p-12 text-center">
                        <div className="text-7xl mb-6">😴</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Live Auctions</h3>
                        <p className="text-gray-600 text-lg font-medium">Check back soon for exciting new auctions!</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 font-semibold text-lg">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {liveAuctions.map((auction, index) => (
                            <div 
                                key={auction.id}
                                style={{ 
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`
                                }}
                            >
                                <AuctionCard
                                    auction={auction}
                                    onClick={() => setSelectedItem(auction)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;