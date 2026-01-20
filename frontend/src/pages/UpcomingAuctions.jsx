import React from 'react'
import AuctionCard from '../components/AuctionCard';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { mockAuctions } from '../data/mockAuctions';
const UpcomingAuctions = () => {
    const { selectedCategory, selectedCountry, liveFilter, setSelectedItem, searchQuery } = useContext(AppContext);
    const { setSelectedCategory, setSelectedCountry, setLiveFilter } = useContext(AppContext);
    const [filteredAuctions, setFilteredAuctions] = useState([]);

useEffect(() => {
  const filtered = mockAuctions.filter((auction) => {
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
  mockAuctions,
]);

    const countries = ['all', ...new Set(mockAuctions.map(a => a.country))];

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
        </div>
    );

}

export default UpcomingAuctions