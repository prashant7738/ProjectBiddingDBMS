import { useEffect, useState } from "react";
import { getEndedAuctions, getMediaUrl } from "../api/auth";
import { CATEGORIES } from './AllAuctions';

const PriceResults = () => {
    const [priceSearchQuery, setPriceSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('date'); // date, price, percentage

    const normalizeAuction = (raw) => {
        const finalPrice = raw?.current_highest_bid ?? raw?.winning_bid ?? raw?.final_price ?? 0;
        const estimatedPrice = raw?.starting_price ?? raw?.estimated_price ?? 0;
        const percentageChange = estimatedPrice > 0 
            ? ((finalPrice - estimatedPrice) / estimatedPrice * 100).toFixed(1)
            : 0;

        return {
            id: raw?.id ?? raw?.auction_id,
            name: raw?.title ?? 'Untitled Auction',
            categoryId: raw?.category_id ?? 0,
            image: getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
            estimatedPrice: estimatedPrice,
            finalPrice: finalPrice,
            percentageChange: parseFloat(percentageChange),
            winner: raw?.winner_name ?? raw?.winner?.name ?? 'Unknown',
            soldDate: raw?.end_time ?? raw?.sold_date ?? new Date(),
            bidCount: raw?.bid_count ?? 0,
        };
    };

    useEffect(() => {
        let isMounted = true;
        const loadResults = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getEndedAuctions();
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : [];
                if (isMounted) {
                    const normalized = list.map(normalizeAuction);
                    setResults(normalized);
                    setFilteredResults(normalized);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.error || 'Failed to load price results.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        loadResults();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let filtered = results.filter((item) =>
            item.name.toLowerCase().includes(priceSearchQuery.toLowerCase())
        );

        // Sort results
        if (sortBy === 'price') {
            filtered = filtered.sort((a, b) => b.finalPrice - a.finalPrice);
        } else if (sortBy === 'percentage') {
            filtered = filtered.sort((a, b) => b.percentageChange - a.percentageChange);
        } else {
            filtered = filtered.sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate));
        }

        setFilteredResults(filtered);
    }, [priceSearchQuery, results, sortBy]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-outfit">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Price Results</h2>
                <p className="text-gray-600">View final prices from completed auctions</p>
            </div>

            {/* Search and Sort Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search auction results..."
                            value={priceSearchQuery}
                            onChange={(e) => setPriceSearchQuery(e.target.value)}
                            className="w-full px-6 py-3 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="md:w-48">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="date">Latest First</option>
                        <option value="price">Highest Price</option>
                        <option value="percentage">Biggest Gain</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-gray-600 font-medium">
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading results…</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                    <p className="text-red-700 font-semibold">{error}</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h3>
                    <p className="text-gray-600">Try adjusting your search query</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                        <div className="col-span-5">Item</div>
                        <div className="col-span-2 text-right">Estimated</div>
                        <div className="col-span-2 text-right">Final Price</div>
                        <div className="col-span-2 text-right">Change</div>
                        <div className="col-span-1 text-right">Bids</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {filteredResults.map((result) => (
                            <div
                                key={result.id}
                                className="result-row grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-all"
                            >
                                {/* Item Info */}
                                <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                                    <img
                                        src={result.image || '/placeholder-image.jpg'}
                                        alt={result.name}
                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{result.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                {CATEGORIES[result.categoryId] ?? 'Unknown'}
                                            </span>
                                            <span className="text-gray-500">
                                                {new Date(result.soldDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Estimated Price */}
                                <div className="col-span-1 md:col-span-2 md:text-right">
                                    <div className="text-sm text-gray-500 md:hidden">Estimated:</div>
                                    <div className="font-semibold text-gray-700">
                                        ₹{result.estimatedPrice.toLocaleString()}
                                    </div>
                                </div>

                                {/* Final Price */}
                                <div className="col-span-1 md:col-span-2 md:text-right">
                                    <div className="text-sm text-gray-500 md:hidden">Final Price:</div>
                                    <div className="font-bold text-green-600 text-lg">
                                        ₹{result.finalPrice.toLocaleString()}
                                    </div>
                                </div>

                                {/* Percentage Change */}
                                <div className="col-span-1 md:col-span-2 md:text-right">
                                    <div className="text-sm text-gray-500 md:hidden">Change:</div>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold ${
                                        result.percentageChange > 0
                                            ? 'bg-green-100 text-green-700'
                                            : result.percentageChange < 0
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {result.percentageChange > 0 && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {result.percentageChange < 0 && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>{result.percentageChange > 0 ? '+' : ''}{result.percentageChange}%</span>
                                    </div>
                                </div>

                                {/* Bid Count */}
                                <div className="col-span-1 md:col-span-1 md:text-right">
                                    <div className="text-sm text-gray-500 md:hidden">Bids:</div>
                                    <div className="inline-flex items-center gap-1 text-purple-600 font-semibold">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {result.bidCount}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceResults;