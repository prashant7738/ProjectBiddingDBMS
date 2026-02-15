import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavigationTabs = () => {
    const { user } = useContext(AuthContext); 
    
    const tabs = [
        { id: '', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'all-auctions', label: 'All Auctions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'results', label: 'Results', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ...(user ? [
            { id: 'create-auction', label: 'Create', icon: 'M12 4v16m8-8H4' },
            { id: 'my-auctions', label: 'My Auctions', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
        ] : [])
    ];

    return (
        <div className="bg-white shadow-md font-Roboto sticky top-19 md:top-24 z-40 border-b-2 border-gray-100 font-orbitron font-bold ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Scrollable Container for Mobile */}
                <div className="flex space-x-2 md:space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap">
                    {tabs.map(tab => (
                        <NavLink 
                            key={tab.id} 
                            to={`/${tab.id}`}
                            className={({ isActive }) =>
                                `nav-tab ${isActive ? 'active' : ''} flex items-center space-x-2 py-4 md:py-4 px-3 md:px-4 transition-all flex-shrink-0`
                            }
                        >
                            <svg className="nav-icon w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                            </svg>
                            <span className="nav-label font-semibold text-sm md:text-base">{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavigationTabs;