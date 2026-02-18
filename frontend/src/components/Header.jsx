import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        searchQuery, setSearchQuery,
        showNotifications, setShowNotifications,
        notifications, setNotifications,
        unreadCount
    } = useContext(AppContext);
    const { user, logout } = useContext(AuthContext);
    const [showOptions, setShowOptions] = useState(false);

    const handlelogOut = async () => {
        await logout();
        navigate('/');
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-purple-100 font-prata font-bold ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Nav Row */}
                <div className="flex items-center justify-between h-20 md:h-25 gap-2">
                    
                    {/* Logo */}
                    <div className="shrink-0 cursor-pointer flex items-center">
                        <Link to={'/'} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                            <img src={assets.hero_img} className='h-20  md:h-27 w-auto logo-img' alt="Logo" />
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className={`hidden md:flex flex-1 max-w-5xl mx-4 ${location.pathname === "/upcoming" ? 'md:block' : 'md:hidden'}`}>
                        <div className="left-10 relative w-1/2">
                            <input
                                type="text"
                                placeholder="Search auctions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input w-full px-6 py-2.5 pl-12 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <svg className="absolute left-4 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Side Menu */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {user && (
                            <div className='flex items-center space-x-1 md:space-x-3'>
                                <Link to={'/wonitems'}
                                    className={`nav-link icon-btn p-2.5 rounded-xl transition-all flex items-center space-x-1 ${location.pathname.includes('wonitems') ? 'bg-purple-100 text-purple-600' : 'text-gray-700'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span className="hidden lg:inline font-semibold text-sm md:text-base">Won Items</span>
                                </Link>

                                <Link to={'/myitems'}
                                    className="nav-link icon-btn p-2.5 rounded-xl transition-all flex items-center space-x-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <span className="hidden lg:inline font-semibold text-sm md:text-base">My Items</span>
                                </Link>
                            </div>
                        )}

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="icon-btn relative p-2.5 rounded-xl transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="notification-panel absolute right-0 mt-3 w-72 sm:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
                                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
                                            <h3 className="font-bold text-sm sm:text-lg text-gray-900">Notifications</h3>
                                            <button onClick={markAllRead} className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors px-3 py-1 rounded-lg hover:bg-purple-100">
                                                Mark all read
                                            </button>
                                        </div>
                                        <div className="max-h-60 sm:max-h-96 overflow-y-auto">
                                            {notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => {
                                                        if (notif.auctionId) {
                                                            setShowNotifications(false);
                                                            navigate(`/auctionPage/${notif.auctionId}`);
                                                        }
                                                        // Mark as read on click
                                                        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                                    }}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all ${notif.auctionId ? 'cursor-pointer' : 'cursor-default'} ${!notif.read ? 'bg-blue-50 border-l-4 border-l-purple-500' : ''}`}
                                                >
                                                    <p className="text-xs sm:text-sm text-gray-800 font-medium">{notif.message}</p>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <p className="text-[10px] text-gray-500 font-medium">{notif.time}</p>
                                                        {notif.auctionId && (
                                                            <span className="text-[10px] text-purple-500 font-semibold flex items-center gap-0.5">
                                                                View auction
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <div className="relative">
                                <button className="flex items-center space-x-2 p-1 md:px-3 md:py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300" onClick={() => setShowOptions(!showOptions)}>
                                    <div className="w-9 h-9 md:w-11 md:h-11 avatar-gradient rounded-full flex items-center justify-center text-white text-sm md:text-base font-bold shadow-lg ">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="hidden md:inline font-bold text-gray-800">{user?.name}</span>
                                    <svg className="hidden md:block w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showOptions && (
                                    <div className="dropdown-menu absolute right-0 top-14 w-48 bg-white shadow-2xl border border-purple-100 py-2 rounded-2xl overflow-hidden">
                                        <button className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all font-semibold text-gray-700 flex items-center space-x-2" onClick={() => { setShowOptions(false); navigate('/profile'); }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Profile</span>
                                        </button>
                                        <button className="w-full px-5 py-3 text-left hover:bg-red-50 transition-all text-red-600 font-semibold flex items-center space-x-2" onClick={async () => { setShowOptions(false); await handlelogOut(); }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-base rounded-xl border-2 border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 font-bold transition-all duration-300">
                                    Sign in
                                </Link>
                                <Link to="/register" className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-base rounded-xl btn-gradient-blue text-white font-bold shadow-lg">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;