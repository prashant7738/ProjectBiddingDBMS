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
        <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-purple-100">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 15px rgba(124, 58, 237, 0.5); }
                    50% { box-shadow: 0 0 25px rgba(124, 58, 237, 0.8); }
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes rotate-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .btn-gradient-blue {
                    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
                    background-size: 200% 200%;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    overflow: hidden;
                }
                .btn-gradient-blue::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }
                .btn-gradient-blue:hover::before {
                    width: 300px;
                    height: 300px;
                }
                .btn-gradient-blue:hover {
                    background-position: 100% 0;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
                }
                .btn-gradient-blue:active {
                    transform: translateY(0);
                }
                .avatar-gradient {
                    background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
                    background-size: 200% 200%;
                    transition: all 0.4s ease;
                    position: relative;
                    overflow: hidden;
                }
                .avatar-gradient::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    padding: 2px;
                    background: linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .avatar-gradient:hover::before {
                    opacity: 1;
                }
                .avatar-gradient:hover {
                    animation: pulse-glow 2s ease-in-out infinite;
                    transform: scale(1.05) rotate(5deg);
                    background-position: 100% 0;
                }
                .search-input {
                    transition: all 0.3s ease;
                }
                .search-input:focus {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
                }
                .icon-btn {
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .icon-btn:hover {
                    transform: translateY(-3px);
                    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
                }
                .icon-btn svg {
                    transition: all 0.3s ease;
                }
                .icon-btn:hover svg {
                    transform: scale(1.1);
                    color: #7c3aed;
                }
                .notification-badge {
                    animation: bounce-subtle 2s ease-in-out infinite;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                }
                .notification-panel {
                    animation: slideDown 0.3s ease-out;
                    transform-origin: top;
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .dropdown-menu {
                    animation: slideDown 0.2s ease-out;
                }
                .logo-img {
                    transition: transform 0.3s ease;
                }
                .logo-img:hover {
                    transform: scale(1.05);
                }
                .nav-link {
                    position: relative;
                    transition: all 0.3s ease;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #7c3aed, #6366f1);
                    transform: translateX(-50%);
                    transition: width 0.3s ease;
                }
                .nav-link:hover::after {
                    width: 100%;
                }
            `}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Nav Row */}
                <div className="flex items-center justify-between h-16 md:h-20 gap-2">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0 cursor-pointer">
                        <Link to={'/'} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                            <img src={assets.logo} className='w-32 md:w-45 logo-img' alt="Logo" />
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
                                    <span className="hidden lg:inline font-semibold text-sm">Won Items</span>
                                </Link>

                                <Link to={'/myitems'}
                                    className="nav-link icon-btn p-2.5 rounded-xl transition-all flex items-center space-x-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <span className="hidden lg:inline font-semibold text-sm">My Items</span>
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
                                        <span className="notification-badge absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
                                                <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all cursor-pointer ${!notif.read ? 'bg-blue-50 border-l-4 border-l-purple-500' : ''}`}>
                                                    <p className="text-xs sm:text-sm text-gray-800 font-medium">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1.5 font-medium">{notif.time}</p>
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
                                    <div className="w-9 h-9 md:w-11 md:h-11 avatar-gradient rounded-full flex items-center justify-center text-white text-sm md:text-base font-bold shadow-lg">
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
                                <Link to="/login" className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm rounded-xl border-2 border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 font-bold transition-all duration-300">
                                    Sign in
                                </Link>
                                <Link to="/register" className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm rounded-xl btn-gradient-blue text-white font-bold shadow-lg">
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