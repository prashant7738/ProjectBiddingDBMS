
import { useContext, useState, useEffect, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuctions, getAuctionById, getMediaUrl, placeBid, registerForAuction } from "../api/auth";
import AuctionCard from "./AuctionCard";

const normalizeAuction = (raw) => {
    const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000);
    const currentBid = raw?.current_bid ?? raw?.starting_price ?? 0;
    const startingBid = raw?.starting_price ?? 0;
    const name = raw?.title ?? 'Untitled Auction';
    const category = raw?.category_name ?? raw?.category ?? 'general';
    const country = raw?.country ?? 'Unknown';
    const isLive = raw?.is_live ?? (endTime > new Date());
    const bidCount = raw?.bid_count ?? 0;
    const image = getMediaUrl(raw?.image_url ?? raw?.image ?? '');
    const description = raw?.description ?? '';
    const registered = raw?.registered ?? false;
    const id = raw?.id ?? raw?.auction_id;

    return {
        id,
        name,
        category,
        image,
        currentBid,
        startingBid,
        isLive,
        endTime,
        country,
        description,
        bidCount,
        registered,
    };
};

const AuctionPage = () => {
    const { selectedItem, setSelectedItem, userBid, setUserBid } = useContext(AppContext);
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [currentBid, setCurrentBid] = useState(0);
    const [bidHistory, setBidHistory] = useState([]);
    const [bidError, setBidError] = useState('');
    const [registering, setRegistering] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadAuctions = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const res = await getAuctions();
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : [];
                const normalized = list.map(normalizeAuction);
                if (isMounted) {
                    setAuctions(normalized);
                    if (id) {
                        const match = normalized.find((a) => String(a.id) === String(id));
                        if (match) {
                            setSelectedItem(match);
                        }
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setLoadError(err.response?.data?.error || 'Failed to load auctions.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        loadAuctions();
        return () => {
            isMounted = false;
        };
    }, [id, setSelectedItem]);

    useEffect(() => {
        if (!id) return;
        const hasMatch = auctions.some((a) => String(a.id) === String(id));
        if (hasMatch) return;
        let isMounted = true;
        const loadAuctionById = async () => {
            try {
                const res = await getAuctionById(id);
                const normalized = normalizeAuction(res.data);
                if (isMounted) {
                    setSelectedItem(normalized);
                }
            } catch (err) {
                if (isMounted) {
                    setLoadError(err.response?.data?.error || 'Auction not found.');
                }
            }
        };
        loadAuctionById();
        return () => {
            isMounted = false;
        };
    }, [id, auctions, setSelectedItem]);

    const activeAuction = useMemo(() => {
        if (id && auctions.length) {
            return auctions.find((a) => String(a.id) === String(id)) || selectedItem;
        }
        return selectedItem;
    }, [id, auctions, selectedItem]);

    useEffect(() => {
        if (!activeAuction) return;
        setIsRegistered(activeAuction.registered || false);
        const starting = activeAuction.currentBid || activeAuction.startingBid || 0;
        setCurrentBid(starting);
        const history = Array.isArray(activeAuction.bids)
            ? activeAuction.bids.map((bid) => ({
                bidder: bid.bidder_name || bid.bidder || (bid.bidder_id ? `Bidder #${bid.bidder_id}` : 'Bidder'),
                amount: bid.amount ?? 0,
                time: bid.time || bid.created_at || 'Just now',
            }))
            : [];
        setBidHistory(history);
    }, [activeAuction]);

    const handleRegister = async () => {
        // Only logged-in users can register
        if (!user?.id) {
            setBidError('Please login to register for this auction.');
            navigate('/login');
            return;
        }
        
        setRegistering(true);
        setBidError('');
        try {
            await registerForAuction(activeAuction.id, user.id);
            setIsRegistered(true);
        } catch (err) {
            setBidError(err.response?.data?.error || 'Failed to register for auction.');
        } finally {
            setRegistering(false);
        }
    };

    const handlePlaceBid = async () => {
        setBidError('');
        
        // Only validate input format, backend handles all business logic
        if (!userBid || userBid.trim() === '') {
            setBidError('Please enter a bid amount.');
            return;
        }
        
        const bidAmount = parseFloat(userBid);
        if (isNaN(bidAmount) || bidAmount <= 0) {
            setBidError('Please enter a valid bid amount.');
            return;
        }
        
        try {
            const res = await placeBid({
                bidder_id: user.id,
                auction_id: activeAuction.id,
                amount: bidAmount,
            });
            const updatedBid = res.data?.amount ?? bidAmount;
            const updatedCurrent = res.data?.current_bid ?? updatedBid;
            setCurrentBid(updatedCurrent);
            setBidHistory((prev) => [
                {
                    bidder: user.name || 'You',
                    amount: updatedBid,
                    time: 'Just now',
                },
                ...prev,
            ]);
            setUserBid('');

            const bidElement = document.getElementById('current-bid');
            if (bidElement) {
                bidElement.classList.add('bid-animation');
                setTimeout(() => bidElement.classList.remove('bid-animation'), 500);
            }
        } catch (err) {
            // Backend handles all validation errors (auth, registration, bid amount, etc.)
            setBidError(err.response?.data?.error || 'Failed to place bid.');
        }
    };

    if (loading && !auctions.length && !activeAuction) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-gray-600">Loading auctions…</p>
            </div>
        );
    }

    if (!activeAuction && loadError && !auctions.length) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="text-gray-600">{loadError}</p>
                    <button
                        onClick={() => navigate('/upcoming')}
                        className="mt-4 gradient-bg text-white px-6 py-2 rounded-lg"
                    >
                        Go to Auctions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                to={'/upcoming'}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Auctions
            </Link>

            {activeAuction && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Image Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="relative h-96 lg:h-full">
                            <img
                                src={activeAuction.image}
                                alt={activeAuction.name}
                                className="item-image"
                            />
                            {activeAuction.isLive && (
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
                                    {activeAuction.category}
                                </span>
                                <span className="text-sm text-gray-600">{activeAuction.country}</span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{activeAuction.name}</h1>
                            <p className="text-gray-600 mb-6">{activeAuction.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Starting Bid</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        ${activeAuction.startingBid.toLocaleString()}
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
                                        disabled={registering}
                                        className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {registering ? 'Registering...' : 'Register for Auction'}
                                    </button>
                                    {bidError && (
                                        <p className="text-sm text-red-600 mt-2">{bidError}</p>
                                    )}
                                </div>
                            ) : activeAuction.isLive ? (
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
                                            disabled={!userBid || parseFloat(userBid) <= 0}
                                            className="gradient-bg text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Place Bid
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Minimum bid increment: $500
                                    </p>
                                    {bidError && (
                                        <p className="text-sm text-red-600">{bidError}</p>
                                    )}
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
                        {activeAuction.isLive && isRegistered && (
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
            )}

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">All Auctions</h2>
                    <span className="text-sm text-gray-500">{auctions.length} items</span>
                </div>

                {loadError && auctions.length === 0 ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                        {loadError}
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="text-gray-600">No auctions available.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((auction) => (
                            <AuctionCard
                                key={auction.id}
                                auction={auction}
                                onClick={() => setSelectedItem(auction)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
export default AuctionPage