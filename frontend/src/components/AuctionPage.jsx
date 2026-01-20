
        import { useContext,useState,useEffect } from "react";
        import { AppContext } from "../context/AppContext";
        import { Link } from "react-router-dom";
        const AuctionPage = () => {
            const { selectedItem, userBid, setUserBid } = useContext(AppContext);
            const [isRegistered, setIsRegistered] = useState(selectedItem?.registered || false);
            const [currentBid, setCurrentBid] = useState(selectedItem?.currentBid || 0);
            const [bidHistory, setBidHistory] = useState([
                { bidder: 'Bidder #2345', amount: selectedItem?.currentBid || 0, time: '2 min ago' },
                { bidder: 'Bidder #8901', amount: (selectedItem?.currentBid || 0) - 500, time: '5 min ago' },
                { bidder: 'Bidder #3456', amount: (selectedItem?.currentBid || 0) - 1000, time: '8 min ago' }
            ]);
            useState(()=>{
                    window.scrollTo({top:0, behavior:'instant'})
            },[])

            if (!selectedItem) {
                return (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <p className="text-gray-600">Item not found</p>
                            <button 
                                onClick={() => setCurrentPage('home')}
                                className="mt-4 gradient-bg text-white px-6 py-2 rounded-lg"
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                );
            }

            const handleRegister = () => {
                setIsRegistered(true);
            };

            const handlePlaceBid = () => {
                const bidAmount = parseFloat(userBid);
                if (bidAmount > currentBid) {
                    setCurrentBid(bidAmount);
                    setBidHistory([
                        { bidder: 'You', amount: bidAmount, time: 'Just now' },
                        ...bidHistory
                    ]);
                    setUserBid('');
                    
                    // Add animation
                    const bidElement = document.getElementById('current-bid');
                    bidElement.classList.add('bid-animation');
                    setTimeout(() => bidElement.classList.remove('bid-animation'), 500);
                }
            };

            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link to={'/upcoming'}
                        
                        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Auctions
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Section */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="relative h-96 lg:h-full">
                                <img 
                                    src={selectedItem.image} 
                                    alt={selectedItem.name}
                                    className="item-image"
                                />
                                {selectedItem.isLive && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center live-badge">
                                        <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                                        LIVE AUCTION
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                                        {selectedItem.category}
                                    </span>
                                    <span className="text-sm text-gray-600">{selectedItem.country}</span>
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedItem.name}</h1>
                                <p className="text-gray-600 mb-6">{selectedItem.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 mb-1">Starting Bid</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            ${selectedItem.startingBid.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 mb-1">Current Bid</p>
                                        <p id="current-bid" className="text-xl font-bold text-purple-600">
                                            ${currentBid.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {!isRegistered ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-2">Registration Required</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            You need to register for this auction to place bids.
                                        </p>
                                        <button 
                                            onClick={handleRegister}
                                            className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                                        >
                                            Register for Auction
                                        </button>
                                    </div>
                                ) : selectedItem.isLive ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder={`Min bid: $${(currentBid + 500).toLocaleString()}`}
                                                value={userBid}
                                                onChange={(e) => setUserBid(e.target.value)}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                            <button 
                                                onClick={handlePlaceBid}
                                                disabled={!userBid || parseFloat(userBid) <= currentBid}
                                                className="gradient-bg text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Place Bid
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Minimum bid increment: $500
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-900 mb-2">Auction Starting Soon</h3>
                                        <p className="text-sm text-gray-600">
                                            You are registered. The auction will begin shortly.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Bid History */}
                            {selectedItem.isLive && isRegistered && (
                                <div className="bg-white rounded-xl shadow-lg p-8">
                                    <h3 className="text-xl font-semibold mb-4">Bid History</h3>
                                    <div className="space-y-3">
                                        {bidHistory.map((bid, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-900">{bid.bidder}</p>
                                                    <p className="text-sm text-gray-500">{bid.time}</p>
                                                </div>
                                                <p className="text-lg font-bold text-purple-600">
                                                    ${bid.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };
export default AuctionPage