import React, { useEffect, useState, useContext } from 'react';
import AuctionCard from '../components/AuctionCard';
import { AppContext } from '../context/AppContext';
import { getAuctions, getEndedAuctions, getMediaUrl } from '../api/auth';

export const CATEGORIES = {
    0: 'All Categories',
    1: 'Electronics',
    2: 'Home & Garden',
    3: 'Fashion',
    4: 'Others'
};

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
        description: raw?.description ?? '',
        bidCount:    raw?.bid_count ?? 0,
        registered:  raw?.registered ?? false,
    };
};

const AllAuctions = () => {
    const {
        selectedCategory, setSelectedCategory,
        setSelectedItem, searchQuery,
        auctionCache, updateActiveCache, updateEndedCache,
    } = useContext(AppContext);

    // Seed from cache so the grid is never empty on revisit
    const seedList = [
        ...auctionCache.active,
        ...auctionCache.ended,
    ];
    const [auctions, setAuctions]     = useState(seedList);
    const [firstLoad, setFirstLoad]   = useState(seedList.length === 0);
    const [error, setError]           = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filteredAuctions, setFilteredAuctions] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const loadAuctions = async () => {
            if (seedList.length === 0) setFirstLoad(true);
            setError('');
            try {
                const [activeRes, endedRes] = await Promise.all([
                    getAuctions(),
                    getEndedAuctions(),
                ]);
                const activeList = Array.isArray(activeRes.data)
                    ? activeRes.data
                    : Array.isArray(activeRes.data?.results) ? activeRes.data.results : [];
                const endedList  = Array.isArray(endedRes.data)
                    ? endedRes.data
                    : Array.isArray(endedRes.data?.results)  ? endedRes.data.results  : [];

                const normalized = [...activeList, ...endedList].map(normalizeAuction);
                if (isMounted) {
                    setAuctions(normalized);
                    updateActiveCache(activeList.map(normalizeAuction));
                    updateEndedCache(endedList.map(normalizeAuction));
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.error || 'Failed to load auctions.');
            } finally {
                if (isMounted) setFirstLoad(false);
            }
        };
        loadAuctions();
        return () => { isMounted = false; };
 
    }, []);

    useEffect(() => {
        const now = new Date();
        const filtered = auctions.filter((auction) => {
            let statusMatch = true;
            if (statusFilter === 'live')     statusMatch = auction.isLive && new Date(auction.startTime) <= now && new Date(auction.endTime) > now;
            else if (statusFilter === 'upcoming') statusMatch = new Date(auction.startTime) > now;
            else if (statusFilter === 'ended')    statusMatch = new Date(auction.endTime) <= now;

            const categoryMatch = selectedCategory === 0 || auction.categoryId === selectedCategory;
            const searchMatch   = auction.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return statusMatch && categoryMatch && searchMatch;
        });
        setFilteredAuctions(filtered);
    }, [statusFilter, selectedCategory, searchQuery, auctions]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 font-outfit">
                <h3 className="font-semibold mb-4 text-gray-800 text-2xl">Filter Auctions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block  font-medium text-gray-700 mb-2 text-xl">Status</label>
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
                    <div>
                        <label className="block text-xl font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {Object.entries(CATEGORIES).map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Count */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold font-outfit text-gray-900">
                    {firstLoad ? (
                        <span className="inline-block h-7 w-44 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        `${filteredAuctions.length} Auctions Found`
                    )}
                </h2>
            </div>

            {/* Grid */}
            {error ? (
                <p className="text-red-600">{error}</p>
            ) : firstLoad ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <AuctionCardSkeleton key={i} />)}
                </div>
            ) : filteredAuctions.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No auctions found matching your filters.</p>
                    <button
                        onClick={() => { setStatusFilter('all'); setSelectedCategory(0); }}
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
                            onClick={() => setSelectedItem(auction)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllAuctions;