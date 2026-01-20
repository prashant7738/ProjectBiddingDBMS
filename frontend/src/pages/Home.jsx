import React from 'react'
import CategoryFilter from '../components/CategoryFilter'
import { mockAuctions } from '../data/mockAuctions';
import { mockPriceResults } from '../data/mockPriceResult';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import AuctionCard from '../components/AuctionCard';
import { useEffect } from 'react';
import { getProfile } from '../api/auth';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
const Home = () => {

            const hotAuctions = mockAuctions.filter(a => a.isLive).slice(0, 4);
            const recommended = mockAuctions.slice(4, 8);
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
                               to={'/upcomingauctions'}
                                className="text-purple-600 font-semibold hover:text-purple-700 flex items-center"
                            >
                                View All
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </NavLink>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {hotAuctions.map(auction => (
                                <AuctionCard 
                                    key={auction.id} 
                                    auction={auction}
                                    onClick={() => {
                                        setSelectedItem(auction);
                                        setCurrentPage('item-detail');
                                    }}
                                />
                            ))}
                        </div>
                    </section>

                    {/* You May Also Like */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">You May Also Like</h2>
                            <button 
                                onClick={() => setCurrentPage('upcoming')}
                                className="text-purple-600 font-semibold hover:text-purple-700 flex items-center"
                            >
                                Explore More
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommended.map(auction => (
                                <AuctionCard 
                                    key={auction.id} 
                                    auction={auction}
                                    onClick={() => {
                                        setSelectedItem(auction);
                                        setCurrentPage('item-detail');
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            );

}

export default Home