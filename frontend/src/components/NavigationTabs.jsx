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
        <div className="bg-white shadow-md font-Roboto sticky top-16 md:top-20 z-40 border-b-2 border-gray-100">
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
                @keyframes bounce-icon {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }
                .nav-tab {
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .nav-tab::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%);
                    transform: scaleX(0);
                    transform-origin: center;
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border-radius: 2px 2px 0 0;
                }
                .nav-tab.active::before {
                    transform: scaleX(1);
                    animation: slideIn 0.4s ease-out;
                }
                .nav-tab:hover::before {
                    transform: scaleX(0.7);
                    background: linear-gradient(90deg, #c4b5fd 0%, #a5b4fc 50%, #ddd6fe 100%);
                }
                .nav-tab:hover {
                    transform: translateY(-2px);
                }
                .nav-tab.active {
                    background: linear-gradient(to bottom, transparent, rgba(124, 58, 237, 0.05));
                }
                .nav-tab:hover .nav-icon {
                    animation: bounce-icon 0.6s ease;
                }
                .nav-tab.active .nav-icon {
                    color: #7c3aed;
                    filter: drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3));
                }
                .nav-tab .nav-label {
                    transition: all 0.3s ease;
                }
                .nav-tab.active .nav-label {
                    font-weight: 700;
                    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .nav-tab:hover .nav-label {
                    color: #7c3aed;
                }
                .no-scrollbar::-webkit-scrollbar { 
                    display: none; 
                }
                .no-scrollbar { 
                    -ms-overflow-style: none; 
                    scrollbar-width: none; 
                }
            `}</style>
            
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