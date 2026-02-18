import React, { useEffect, useState, useContext } from 'react';
import AuctionCard from '../components/AuctionCard';
import { AppContext } from '../context/AppContext';
import { getEndedAuctions, getMediaUrl } from '../api/auth';

// ── Skeleton ──────────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

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
        winnerName:  raw?.winner_name ?? raw?.winnerName ?? raw?.winner?.name ?? 'No Winner',
        category:    raw?.category_name ?? raw?.category ?? 'general',
        image:       getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
        currentBid:  raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0,
        winningBid:  raw?.winning_bid ?? raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0,
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

const Results = () => {
    const {
        selectedCategory, setSelectedCategory,
        selectedCountry,  setSelectedCountry,
        setSelectedItem,  searchQuery,
        auctionCache,     updateEndedCache,
    } = useContext(AppContext);

    // Seed immediately from cache so there's no blank flash on revisit
    const [auctions, setAuctions]           = useState(auctionCache.ended);
    const [firstLoad, setFirstLoad]         = useState(auctionCache.ended.length === 0);
    const [error, setError]                 = useState('');
    const [filteredAuctions, setFilteredAuctions] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const loadAuctions = async () => {
            if (auctionCache.ended.length === 0) setFirstLoad(true);
            setError('');
            try {
                const res  = await getEndedAuctions();
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results) ? res.data.results : [];
                const normalized = list.map(normalizeAuction);
                if (isMounted) {
                    setAuctions(normalized);
                    updateEndedCache(normalized);
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.error || 'Failed to load auction results.');
            } finally {
                if (isMounted) setFirstLoad(false);
            }
        };
        loadAuctions();
        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const filtered = auctions.filter((auction) => {
            const isEnded        = new Date(auction.endTime) <= new Date();
            const categoryMatch  = !selectedCategory || selectedCategory === 'all' || auction.category === selectedCategory;
            const countryMatch   = !selectedCountry  || selectedCountry  === 'all' || auction.country   === selectedCountry;
            const searchMatch    = auction.name?.toLowerCase().includes((searchQuery || '').toLowerCase());
            return isEnded && categoryMatch && countryMatch && searchMatch;
        });
        setFilteredAuctions(filtered);
    }, [selectedCategory, selectedCountry, searchQuery, auctions]);

    const countries = ['all', ...new Set(auctions.map(a => a.country))];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-outfit">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Auction Results</h1>
                <p className="text-gray-600">View completed auctions and their winners</p>
            </div>

            {/* Filters */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home & Garden">Home & Garden</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select
                            value={selectedCountry || 'all'}
                            onChange={(e) => setSelectedCountry && setSelectedCountry(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {countries.map(country => (
                                <option key={country} value={country}>
                                    {country === 'all' ? 'All Countries' : country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Count */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {firstLoad ? (
                        <span className="inline-block h-7 w-40 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        `${filteredAuctions.length} Results Found`
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
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg mt-4">No completed auctions yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back later for auction results!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map(auction => (
                        <div key={auction.id} className="relative">
                            <AuctionCard
                                auction={auction}
                                onClick={() => setSelectedItem(auction)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Results;