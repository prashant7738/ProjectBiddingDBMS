import React from 'react'
import AuctionCard from '../components/AuctionCard';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getAuctions, getEndedAuctions, getMediaUrl } from '../api/auth';

// Category mapping based on database
export const CATEGORIES = {
    0: 'All Categories',
    1: 'Electronics',
    2: 'Home & Garden',
    3: 'Fashion',
    4: 'Others'
};

const AllAuctions = () => {
    const { selectedCategory, setSelectedItem, searchQuery } = useContext(AppContext);
    const { setSelectedCategory } = useContext(AppContext);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, live, upcoming, ended

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
                // Fetch both active and ended auctions
                const [activeRes, endedRes] = await Promise.all([
                    getAuctions(),
                    getEndedAuctions()
                ]);
                
                const activeList = Array.isArray(activeRes.data)
                    ? activeRes.data
                    : Array.isArray(activeRes.data?.results)
                        ? activeRes.data.results
                        : [];
                        
                const endedList = Array.isArray(endedRes.data)
                    ? endedRes.data
                    : Array.isArray(endedRes.data?.results)
                        ? endedRes.data.results
                        : [];
                
                // Combine both lists
                const allAuctions = [...activeList, ...endedList];
                
                if (isMounted) {
                    const normalized = allAuctions.map(normalizeAuction);
                    console.log('Raw API response:', allAuctions[0]);
                    console.log('Normalized auction:', normalized[0]);
                    setAuctions(normalized);
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
        console.log('Filtering with selectedCategory:', selectedCategory);
        const filtered = auctions.filter((auction) => {
            const now = new Date();
            
            // Status filter logic
            let statusMatch = true;
            if (statusFilter === 'live') {
                statusMatch = auction.isLive && new Date(auction.startTime) <= now && new Date(auction.endTime) > now;
            } else if (statusFilter === 'upcoming') {
                statusMatch = new Date(auction.startTime) > now;
            } else if (statusFilter === 'ended') {
                statusMatch = new Date(auction.endTime) <= now;
            }

            const categoryMatch =
                selectedCategory === 0 || auction.categoryId === selectedCategory;

            const searchMatch =
                auction.name?.toLowerCase().includes(searchQuery.toLowerCase());

            if (auctions.indexOf(auction) === 0) {
                console.log('First auction - categoryId:', auction.categoryId, 'selectedCategory:', selectedCategory, 'match:', categoryMatch);
            }

            return statusMatch && categoryMatch && searchMatch;
        });

        console.log('Filtered auctions:', filtered.length, 'of', auctions.length);
        setFilteredAuctions(filtered);
    }, [
        statusFilter,
        selectedCategory,
        searchQuery,
        auctions,
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 font-outfit">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter Auctions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Auctions</option>
                            <option value="live">Live Only</option>
                            <option value="upcoming">Upcoming Only</option>
                            <option value="ended">Ended Only</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
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
            </div>

            {/* Results */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold font-outfit text-gray-900">
                    {filteredAuctions.length} Auctions Found
                </h2>
            </div>

            {loading ? (
                <p className="text-gray-600">Loading auctions…</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : filteredAuctions.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No auctions found matching your filters.</p>
                    <button 
                        onClick={() => {
                            setStatusFilter('all');
                            setSelectedCategory(0);
                        }}
                        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                        Clear Filters
                    </button>
                </div>
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

export default AllAuctions;