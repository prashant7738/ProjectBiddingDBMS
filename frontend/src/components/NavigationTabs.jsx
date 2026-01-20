import { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Link, NavLink } from "react-router-dom";
const NavigationTabs = () => {
    const tabs = [
        { id: '', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'upcoming', label: 'Upcoming Auctions', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'price-results', label: 'Price Results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
    ];

    return (
        <div className="bg-white shadow-md font-Roboto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8">
                    {tabs.map(tab => (
                        <NavLink to={`/${tab.id}`}
                            className={({ isActive }) =>
                                isActive
                                    ? "flex items-center space-x-2 py-4 px-2 border-b-2 transition-all border-purple-600 text-purple-600"
                                    : "flex items-center space-x-2 py-4 px-2 border-b-2 transition-all border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                            }>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                            </svg>
                            <span className="font-medium">{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavigationTabs