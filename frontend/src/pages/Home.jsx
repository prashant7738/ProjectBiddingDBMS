import React, { useEffect, useState, useContext } from 'react'
import CategoryFilter from '../components/CategoryFilter'
import { NavLink } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';
import { getAuctions, getMediaUrl } from '../api/auth';
import { AppContext } from '../context/AppContext';
const Home = () => {
            const { setSelectedItem } = useContext(AppContext);
            const [auctions, setAuctions] = useState([]);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');

            const normalizeAuction = (raw) => {
                const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000);
                return {
                    id: raw?.id ?? raw?.auction_id,
                    name: raw?.title ?? 'Untitled Auction',
                    category: raw?.category_name ?? raw?.category ?? 'general',
                    image: getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
                    currentBid: raw?.current_bid ?? raw?.starting_price ?? 0,
                    startingBid: raw?.starting_price ?? 0,
                    isLive: raw?.is_live ?? (endTime > new Date()),
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

            const hotAuctions = auctions.filter(a => a.isLive).slice(0, 4);
            const recommended = auctions.filter(a => !a.isLive).slice(0, 4);

            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CategoryFilter />

                    {/* Hot Auctions */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                                <span className="text-4xl mr-3">🔥</span>
                                Hot Auctions
                            </h2>
                            <NavLink
                               to={'/upcoming'}
                                className="text-purple-600 font-semibold hover:text-purple-700 flex items-center"
                            >
                                View All
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </NavLink>
                        </div>

                        {loading && hotAuctions.length === 0 ? (
                            <p className="text-gray-600">Loading auctions…</p>
                        ) : error ? (
                            <p className="text-red-600">{error}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {hotAuctions.map(auction => (
                                    <AuctionCard
                                        key={auction.id}
                                        auction={auction}
                                        onClick={() => setSelectedItem(auction)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* You May Also Like */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">You May Also Like</h2>
                            <NavLink
                                to="/upcoming"
                                className="text-purple-600 font-semibold hover:text-purple-700 flex items-center"
                            >
                                Explore More
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </NavLink>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommended.map(auction => (
                                <AuctionCard
                                    key={auction.id}
                                    auction={auction}
                                    onClick={() => setSelectedItem(auction)}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            );

}

export default Home