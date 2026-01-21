
import { useContext, useEffect, useTransition } from 'react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProfile } from '../api/auth';
import { useState } from 'react';
import { getToken, setToken } from '../utils/auth';
import { AuthContext } from '../context/AuthContext';
const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    console.log(location.pathname)
    const {
        searchQuery, setSearchQuery,
        showNotifications, setShowNotifications,
        notifications, setNotifications,
        unreadCount
    } = useContext(AppContext)
    const { tokenState, setTokenState } = useContext(AuthContext)
    const [userData, setUserData] = useState(null)
    const [showOptions, setShowOptions] = useState(false)

    useEffect(() => {
        if (!tokenState) return;

        const fetchProfile = async () => {
            try {
                const response = await getProfile(tokenState)
                setUserData(response)
                console.log(response)
            } catch (err) {
                console.error("Error fetching profile:", err)
            }
        }

        fetchProfile()
    }, [tokenState])
    const handlelogOut = () => {
        setToken('')
        setTokenState('')
        navigate('/')
    }



    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    <div className="flex items-center cursor-pointer">
                        <Link to={'/'} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                            <img src={assets.logo} className='min-w-[160px] w-[180px]' alt="" />
                        </Link>

                    </div>

                    {/* Search Bar */}
                    <div className={` flex-1 max-w-2xl mx-8 ${location.pathname == "/upcoming" ? 'flex-1' : 'hidden'}`}>
                        <div className="relative">
                            <input

                                type="text"
                                placeholder="Search auctions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-3 pl-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <svg className='absolute right-4 top-3.5 w-5 h-5 text-gray-400 cursor-pointer' width="24" height="24" viewBox="0 0 24 24" fill="currentColor" onClick={() => { setSearchQuery('') }}>
                                <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.42L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z" />
                            </svg>

                        </div>
                    </div>

                    {/* Right Side Menu */}
                    <div className="flex items-center space-x-6">
                        <Link  to={'/wonitems'}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all ${location.pathname.includes('wonitems') ? 'text-red-500': 'text-black'}` }
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <button className="font-medium text-gray-700">Won Items</button>
                        </Link>

                        <Link to={'/myitems'}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="font-medium text-gray-700">My Items</span>
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center notification-badge">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Notifications</h3>
                                        <button
                                            onClick={markAllRead}
                                            className="text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${!notif.read ? 'bg-purple-50' : ''}`}
                                            >
                                                <p className="text-sm text-gray-800">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all hover " onClick={() => setShowOptions(!showOptions)}>
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                JD
                            </div>
                            <span className="font-medium text-gray-700">{userData?.data.name}</span>
                           
                        </button>
                        <div className={`absolute right-37 top-14 gap-3  flex-col items-center bg-gray-100 p-5 rounded-2xl max-w-[100px] ${showOptions ? 'flex' : 'hidden'}`}>
                                <button className='p-2 hover:font-bold  rounded-xl' >Logout</button>
                                <button className='p-2 hover:font-bold rounded-xl'>Logout</button>
                                <button className='p-2  hover:font-bold rounded-xl' onClick={handlelogOut}>Logout</button></div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header