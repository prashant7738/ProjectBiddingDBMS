import React from 'react'
import AuctionCard from '../components/AuctionCard';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getAuctions, getMediaUrl } from '../api/auth';
import { CATEGORIES } from './AllAuctions';
const UpcomingAuctions = () => {
    const { selectedCategory, liveFilter, setSelectedItem, searchQuery } = useContext(AppContext);
    const { setLiveFilter } = useContext(AppContext);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
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

useEffect(() => {
  const filtered = auctions.filter((auction) => {
    // Only show auctions that haven't started yet
    const isUpcoming = auction.startTime && new Date(auction.startTime) > new Date();
    
    const categoryMatch =
      selectedCategory === 0 || auction.categoryId === selectedCategory;

    const searchMatch =
      auction.name?.toLowerCase().includes(searchQuery.toLowerCase()) 
    return isUpcoming && categoryMatch && searchMatch;
  });

  setFilteredAuctions(filtered);
}, [
  selectedCategory,
  searchQuery,
    auctions,
]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter by Category</h3>
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {Object.entries(CATEGORIES).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Status Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter by Status</h3>
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={liveFilter}
                        onChange={(e) => setLiveFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="all">All Auctions</option>
                        <option value="live">Live Only</option>
                        <option value="upcoming">Upcoming Only</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {filteredAuctions.length} Auctions Found
                </h2>
            </div>

            {loading ? (
                <p className="text-gray-600">Loading auctions…</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map(auction => (
                        <AuctionCard
                            key={auction.id}
                            auction={auction}
                            onClick={() => {
                                setSelectedItem(auction);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );

}

export default UpcomingAuctions