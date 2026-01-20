import { useEffect,useState } from "react";
import { useNavigate,Link } from "react-router-dom";
const AuctionCard = ({ auction, onClick }) => {
            const [timeLeft, setTimeLeft] = useState('');
            const navigate = useNavigate()
            useEffect(() => {
                const timer = setInterval(() => {
                    const now = new Date();
                    const diff = auction.endTime - now;
                    
                    if (diff > 0) {
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                    } else {
                        setTimeLeft('Ended');
                    }
                }, 1000);

                return () => clearInterval(timer);
            }, [auction.endTime]);

            return (
                <div  onClick={onClick}
                    className="bg-white rounded-xl shadow-md overflow-hidden card-hover cursor-pointer ">
                    <div className="relative h-64 overflow-hidden">
                        <img 
                            src={auction.image} 
                            alt={auction.name}
                            className="item-image"
                        />
                        {auction.isLive && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center live-badge">
                                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                                LIVE
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                            {auction.country}
                        </div>
                    </div>
                    <div className="p-6 mt-2  h-65 flex flex-col justify-between">
                     <div className="">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide font-bold">
                                {auction.category}
                            </span>
                            <span className="text-xs text-gray-500">
                                {auction.bidCount} bids
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{auction.name}</h3>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Current Bid</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    ${auction.currentBid.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Time Left</p>
                                <p className="text-sm font-semibold text-gray-700 countdown">{timeLeft}</p>
                            </div>
                        </div></div>
                        <Link className=" flex justify-center items-center w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all border  "  to={`/auctionPage/${auction.id}`}>
                           {auction.isLive ? 'Join Live Auction' : 'View Details'}
                        </Link>
                    </div>
                </div>
            );
        };

export default AuctionCard