import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavigationTabs = () => {
    const { user } = useContext(AuthContext); 
    
    const tabs = [
        { id: '', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'all-auctions', label: 'All Auctions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'upcoming', label: 'Upcoming', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'ended-auctions', label: 'Ended', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        ...(user ? [{ id: 'create-auction', label: 'Create', icon: 'M12 4v16m8-8H4' }] : [])
    ];

    return (
        <div className="bg-white shadow-md font-Roboto sticky top-16 md:top-20 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Scrollable Container for Mobile */}
                <div className="flex space-x-4 md:space-x-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                    {tabs.map(tab => (
                        <NavLink 
                            key={tab.id} 
                            to={`/${tab.id}`}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 py-3 md:py-4 px-1 border-b-2 transition-all flex-shrink-0 ${
                                    isActive
                                        ? "border-purple-600 text-purple-600"
                                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                                }`
                            }
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                            </svg>
                            {/* Hide long text on very small screens, or keep it and allow scrolling */}
                            <span className="font-medium text-sm md:text-base">{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
            
            {/* Custom CSS to hide scrollbar but keep functionality */}
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default NavigationTabs;