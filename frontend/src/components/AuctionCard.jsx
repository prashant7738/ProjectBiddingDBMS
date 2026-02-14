import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CATEGORIES } from "../pages/AllAuctions";
import { getMediaUrl } from "../api/auth";

const AuctionCard = ({ auction, onClick }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const navigate = useNavigate();
    const startTimeValue = auction.startTime ?? auction.start_time;
    const endTimeValue = auction.endTime ?? auction.end_time;
    const endDate = endTimeValue ? new Date(endTimeValue) : null;
    const startDate = startTimeValue ? new Date(startTimeValue) : null;
    const isLiveValue = auction.isLive ?? (startDate && endDate ? startDate <= new Date() && endDate > new Date() : false);
    const currentBidValue = Number(auction.currentBid ?? auction.current_highest_bid ?? auction.starting_price ?? 0);
    const imageValue = getMediaUrl(auction.image ?? auction.image_url ?? '');
    const nameValue = auction.name ?? auction.title ?? 'Auction';
    const categoryId = auction.categoryId ?? auction.category_id ?? 0;
    const categoryValue = CATEGORIES[categoryId] ?? 'Unknown';
    const bidCountValue = auction.bidCount ?? auction.bid_count ?? 0;
    const sellerNameValue = auction.sellerName ?? auction.seller_name ?? auction.seller?.name ?? '';
    
    
    const handleCardClick = (e) => {
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        // Execute the passed onClick prop if it exists
        if (onClick) onClick(e);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = endDate ? endDate - now : 0;
            
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                if (days > 0) {
                    setTimeLeft(`${days}d ${hours}h ${minutes}m`);
                } else {
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                }
            } else {
                setTimeLeft('Ended');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div 
            onClick={onClick}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-purple-200"
        >
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img 
                    src={imageValue} 
                    alt={nameValue}
                    className="item-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Status Badge - Top Left */}
                {(() => {
                    if (isLiveValue) {
                        return (
                            <div className="absolute top-4 left-4 live-badge text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-white rounded-full live-dot"></span>
                                LIVE
                            </div>
                        );
                    } else if (startDate > new Date()) {
                        return (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        );
                    }
                    return null;
                })()}
            
                {/* Seller/Country Badge - Bottom Left */}
                <div className="absolute bottom-4 left-4 seller-badge px-4 py-2 rounded-full text-sm font-semibold text-gray-800 shadow-md flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {sellerNameValue || 'Unknown'}
                </div>
            </div>
            
            <div className="p-6 mt-2 h-65 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="category-badge text-xs font-bold text-purple-700 uppercase tracking-wider px-3 py-1.5 rounded-lg">
                            {categoryValue}
                        </span>
                        {/* Additional bid count indicator in card body */}
                        <span className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                            </svg>
                            {bidCountValue} {bidCountValue === 1 ? 'bid' : 'bids'}
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                        {nameValue}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-5">
                        <div className="price-tag">
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Current Bid</p>
                            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                ₹{currentBidValue.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Time Left</p>
                            <p className="text-sm countdown">{timeLeft}</p>
                        </div>
                    </div>
                </div>
                <div onClick={handleCardClick}>
                    <Link 
                        className="flex justify-center items-center w-full gradient-bg text-white py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-md"  
                        to={`/auctionPage/${auction.id}`}
                    >
                        {isLiveValue ? (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Join Live Auction
                            </>
                        ) : 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuctionCard;