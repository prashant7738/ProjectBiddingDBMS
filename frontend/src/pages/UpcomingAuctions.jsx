import React from 'react'
import AuctionCard from '../components/AuctionCard';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getAuctions, getMediaUrl } from '../api/auth';
const UpcomingAuctions = () => {
    const { selectedCategory, selectedCountry, liveFilter, setSelectedItem, searchQuery } = useContext(AppContext);
    const { setSelectedCategory, setSelectedCountry, setLiveFilter } = useContext(AppContext);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
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
            currentBid: raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0,
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

useEffect(() => {
  const filtered = auctions.filter((auction) => {
    const categoryMatch =
      selectedCategory === "all" || auction.category === selectedCategory;

    const countryMatch =
      selectedCountry === "all" || auction.country === selectedCountry;

    const liveMatch =
      liveFilter === "all" ||
      (liveFilter === "live" && auction.isLive) ||
      (liveFilter === "upcoming" && !auction.isLive);

    const searchMatch =
      auction.name?.toLowerCase().includes(searchQuery.toLowerCase()) 
    return categoryMatch && countryMatch && liveMatch && searchMatch;
  });

  setFilteredAuctions(filtered);
}, [
  selectedCategory,
  selectedCountry,
  liveFilter,
  searchQuery,
    auctions,
]);

        const countries = ['all', ...new Set(auctions.map(a => a.country))];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter Auctions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
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

                    {/* Country Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {countries.map(country => (
                                <option key={country} value={country}>
                                    {country === 'all' ? 'All Countries' : country}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="art">Art</option>
                            <option value="jewelry">Jewelry</option>
                            <option value="furniture">Furniture</option>
                        </select>
                    </div>
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