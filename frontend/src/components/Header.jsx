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
        <header className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Nav Row */}
                <div className="flex items-center justify-between h-16 md:h-23 gap-2">
                    
                    {/* Logo: Shrinks slightly on mobile */}
                    <div className="flex-shrink-0 cursor-pointer">
                        <Link to={'/'} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                            <img src={assets.logo} className='w-32 md:w-45' alt="Logo" />
                        </Link>
                    </div>

                    {/* Search Bar: Hidden on very small screens, or adjust width */}
                    <div className={`hidden md:flex flex-1 max-w-5xl mx-4 ${location.pathname === "/upcoming" ? 'md:block' : 'md:hidden'}`}>
                        <div className="left-10 relative w-1/2">
                            <input
                                type="text"
                                placeholder="Search auctions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-2 pl-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                            <svg className="absolute left-4 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Side Menu */}
                    <div className="flex items-center space-x-2 md:space-x-6">
                        {user && (
                            <div className='flex items-center space-x-1 md:space-x-4'>
                                <Link to={'/wonitems'}
                                    className={`p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-1 ${location.pathname.includes('wonitems') ? 'text-red-500' : 'text-black'}`}
                                >
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span className="hidden lg:inline font-medium text-gray-700">Won Items</span>
                                </Link>

                                <Link to={'/myitems'}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-1"
                                >
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <span className="hidden lg:inline font-medium text-gray-700">My Items</span>
                                </Link>
                            </div>
                        )}

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="font-semibold text-sm sm:text-lg">Notifications</h3>
                                            <button onClick={markAllRead} className="text-xs text-purple-600 hover:text-purple-700">Mark all read</button>
                                        </div>
                                        <div className="max-h-60 sm:max-h-96 overflow-y-auto">
                                            {notifications.map(notif => (
                                                <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notif.read ? 'bg-purple-50' : ''}`}>
                                                    <p className="text-xs sm:text-sm text-gray-800">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">{notif.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <div className="relative">
                                <button className="flex items-center space-x-2 p-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-100 transition-all" onClick={() => setShowOptions(!showOptions)}>
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs md:text-base font-semibold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="hidden md:inline font-medium text-gray-700">{user?.name}</span>
                                </button>
                                {showOptions && (
                                    <div className="absolute right-0 top-12 w-32 bg-white shadow-xl border border-gray-100 py-2 rounded-xl flex flex-col">
                                        <button className="px-4 py-2 text-left hover:bg-gray-50" onClick={() => { setShowOptions(false); navigate('/profile'); }}>Profile</button>
                                        <button className="px-4 py-2 text-left hover:bg-gray-50 text-red-600" onClick={async () => { setShowOptions(false); await handlelogOut(); }}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100">Sign in</Link>
                                <Link to="/register" className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;