import React, { useEffect, useState, useContext } from 'react'
import AuctionCard from '../components/AuctionCard';
import { getAuctions, getMediaUrl } from '../api/auth';
import { AppContext } from '../context/AppContext';

const Home = () => {
    const { setSelectedItem, selectedCategory, setSelectedCategory } = useContext(AppContext);
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
            categoryId: raw?.category_id ?? 0,
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
                    console.log('Loaded auctions:', list);
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

    const hotAuctions = auctions.filter(a => a.isLive).sort((a, b) => new Date(b.endTime)- new Date(a.endTime));
    
    // Ending Soon - auctions ending in the next 24 hours
    const endingSoon = auctions.filter(a => {
        const timeLeft = new Date(a.endTime) - new Date();
        return a.isLive && timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000;
    }).sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

    // Filtered auctions based on selected category
    const filteredAuctions = selectedCategory === 0 
        ? auctions 
        : auctions.filter(a => a.categoryId === selectedCategory);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hot Auctions */}
            <section className="mb-12">
                <div className="section-header flex items-center justify-between mb-8">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 flex items-center">
                        <span className="fire-icon text-5xl md:text-6xl mr-4">🔥</span>
                        <span className="gradient-text">Hot Auctions</span>
                    </h2>
                    {hotAuctions.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full">
                            <span className="text-purple-700 font-bold text-sm">{hotAuctions.length} Live Now</span>
                        </div>
                    )}
                </div>

                {loading && hotAuctions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="loading-spinner mb-4"></div>
                        <p className="text-gray-600 font-semibold">Loading auctions…</p>
                    </div>
                ) : hotAuctions.length === 0 ? (
                    <div className="empty-state rounded-2xl p-12 text-center">
                        <div className="text-7xl mb-6">😴</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Hot Auctions</h3>
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
                        {hotAuctions.slice(0, 6).map((auction, index) => (
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

            {/* Ending Soon */}
            {endingSoon.length > 0 && (
                <section className="mb-12">
                    <div className="section-header flex items-center justify-between mb-8">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center">
                            <span className="text-4xl md:text-5xl mr-4">⏰</span>
                            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                Ending Soon
                            </span>
                        </h2>
                        <div className="bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2 rounded-full">
                            <span className="text-red-700 font-bold text-sm">Last Chance!</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {endingSoon.slice(0, 3).map((auction, index) => (
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
                </section>
            )}

            {/* Explore - Horizontal Scroll */}
            <section className="mb-12">
                <div className="section-header mb-8">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center">
                        <span className="text-4xl md:text-5xl mr-4">🔍</span>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Explore More
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto explore-scroll pb-4">
                    <div className="flex gap-6 min-w-max">
                        {filteredAuctions.slice(0, 10).map((auction, index) => (
                            <div 
                                key={auction.id}
                                className="w-80 flex-shrink-0"
                                style={{ 
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.05}s backwards`
                                }}
                            >
                                <AuctionCard
                                    auction={auction}
                                    onClick={() => setSelectedItem(auction)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;