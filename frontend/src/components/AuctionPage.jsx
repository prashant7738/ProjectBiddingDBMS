
import { useContext, useState, useEffect, useMemo, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient, { getAuctions, getAuctionById, getMediaUrl, getRegisteredUsers, placeBid, registerForAuction } from "../api/auth";
import AuctionCard from "./AuctionCard";

const normalizeAuction = (raw) => {
    const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000);
    const currentBid = raw?.current_highest_bid ?? raw?.current_bid ?? raw?.highest_bid ?? raw?.currentBid ?? raw?.starting_price ?? 0;
    const startingBid = raw?.starting_price ?? raw?.startingPrice ?? 0;
    const name = raw?.title ?? raw?.name ?? 'Untitled Auction';
    const category = raw?.category_name ?? raw?.category ?? 'general';
    const country = raw?.country ?? 'Unknown';
    const isLive = raw?.is_live ?? raw?.isLive ?? (endTime > new Date());
    const bidCount = raw?.bid_count ?? raw?.bidCount ?? 0;
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
    const [bidAlert, setBidAlert] = useState('');
    const wsRef = useRef(null);
    const reconnectRef = useRef(null);
    const alertTimeoutRef = useRef(null);
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
        setIsRegistered((prev) => prev || activeAuction.registered || false);
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

    useEffect(() => {
        if (!activeAuction?.id || !user?.id) return;
        let isMounted = true;
        const checkRegistration = async () => {
            try {
                const res = await getRegisteredUsers(activeAuction.id);
                if (res.data?.registered === true || res.data?.is_registered === true) {
                    if (isMounted) {
                        setIsRegistered(true);
                    }
                    return;
                }
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : Array.isArray(res.data?.users)
                            ? res.data.users
                            : Array.isArray(res.data?.registered_users)
                                ? res.data.registered_users
                                : Array.isArray(res.data?.user_ids)
                                    ? res.data.user_ids
                                    : [];
                const registered = list.some((u) => {
                    const id = typeof u === 'object' ? (u.id ?? u.user_id) : u;
                    return String(id) === String(user.id);
                });
                if (isMounted) {
                    setIsRegistered(registered);
                    if (registered) {
                        setSelectedItem((prev) => (prev && prev.id === activeAuction.id ? { ...prev, registered: true } : prev));
                        setAuctions((prev) => prev.map((a) => (a.id === activeAuction.id ? { ...a, registered: true } : a)));
                    }
                }
            } catch {
                // If lookup fails, keep current registration state
            }
        };
        checkRegistration();
        return () => {
            isMounted = false;
        };
    }, [activeAuction?.id, user?.id]);

    const getWsUrl = (auctionId) => {
        const httpBase = apiClient?.defaults?.baseURL || '';
        const apiRoot = httpBase.replace(/\/?api\/?$/, '');
        if (apiRoot) {
            const wsBase = apiRoot.replace(/^https?/, (match) => (match === 'https' ? 'wss' : 'ws'));
            return `${wsBase}/ws/auctions/${auctionId}/`;
        }
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        return `${protocol}://${window.location.host}/ws/auctions/${auctionId}/`;
    };

    useEffect(() => {
        if (!activeAuction?.id || !user?.id || !isRegistered) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
            return;
        }

        console.log('[WS] Attempting connection for user:', user.id, 'auction:', activeAuction.id);
        let didUnmount = false;

        const handleBidUpdate = (payload, options = {}) => {
            const rawAmount = payload?.current_highest_bid
                ?? payload?.current_bid
                ?? payload?.currentBid
                ?? payload?.amount
                ?? payload?.bid?.amount
                ?? payload?.data?.amount
                ?? payload?.data?.bid?.amount
                ?? payload?.auction?.current_bid
                ?? payload?.auction?.currentBid
                ?? payload?.data?.current_bid
                ?? payload?.data?.currentBid;
            const amount = Number.parseFloat(rawAmount);
            if (Number.isFinite(amount)) {
                setCurrentBid(amount);
                setSelectedItem((prev) =>
                    prev && prev.id === activeAuction.id ? { ...prev, currentBid: amount } : prev
                );
                setAuctions((prev) =>
                    prev.map((a) => (a.id === activeAuction.id ? { ...a, currentBid: amount } : a))
                );
            }

            if (Array.isArray(payload?.bids)) {
                const history = payload.bids.map((bid) => ({
                    bidder: bid.bidder_name || bid.bidder || (bid.bidder_id ? `Bidder #${bid.bidder_id}` : 'Bidder'),
                    amount: bid.amount ?? 0,
                    time: bid.time || bid.created_at || 'Just now',
                }));
                setBidHistory(history);
                return;
            }

            if (payload?.amount || payload?.bid?.amount || payload?.data?.bid?.amount) {
                const bidAmount = payload?.amount ?? payload?.bid?.amount ?? payload?.data?.bid?.amount;
                const bidderName =
                    payload?.bidder_name
                    || payload?.bidder
                    || payload?.bidder_id
                    || payload?.bid?.bidder_name
                    || payload?.bid?.bidder
                    || payload?.bid?.bidder_id
                    || 'Bidder';
                const bidTime = payload?.time || payload?.created_at || payload?.bid?.time || payload?.bid?.created_at || 'Just now';
                setBidHistory((prev) => [
                    {
                        bidder: bidderName,
                        amount: bidAmount ?? 0,
                        time: bidTime,
                    },
                    ...prev,
                ]);
            }

            if (options.showAlert && Number.isFinite(amount)) {
                const bidderName =
                    payload?.bidder_name
                    || payload?.bidder
                    || payload?.bidder_id
                    || payload?.bid?.bidder_name
                    || payload?.bid?.bidder
                    || payload?.bid?.bidder_id
                    || 'Someone';
                setBidAlert(`${bidderName} placed a new bid: $${amount.toLocaleString()}`);
                if (alertTimeoutRef.current) {
                    clearTimeout(alertTimeoutRef.current);
                }
                alertTimeoutRef.current = setTimeout(() => {
                    setBidAlert('');
                }, 3000);
            }
        };

        const connect = () => {
            const wsUrl = getWsUrl(activeAuction.id);
            console.log('[WS] Connecting to:', wsUrl);
            const socket = new WebSocket(wsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                console.info('[WS] Connected to auction channel', activeAuction.id);
                setBidError('');
            };

            socket.onmessage = (event) => {
                console.log('[WS] Message received:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    const type = data?.type || data?.event || data?.action;

                    if (type === 'auction_state' || type === 'state') {
                        handleBidUpdate(data, { showAlert: false });
                        return;
                    }

                    if (type === 'bid_update' || type === 'bid_placed' || type === 'BID_PLACED' || type === 'bid') {
                        handleBidUpdate(data, { showAlert: true });
                        return;
                    }

                    if (type === 'error' || data?.error) {
                        setBidError(data?.message || data?.error || 'Failed to place bid.');
                        return;
                    }

                    if (
                        data?.current_bid
                        || data?.currentBid
                        || data?.amount
                        || data?.bid?.amount
                        || data?.data?.bid?.amount
                    ) {
                        handleBidUpdate(data, { showAlert: true });
                    }
                } catch {
                    // Ignore non-JSON messages
                }
            };

            socket.onclose = (event) => {
                console.warn('[WS] Disconnected from auction channel', activeAuction.id, 'Code:', event.code, 'Reason:', event.reason);
                if (event.code === 1006) {
                    console.error('[WS] Abnormal closure - backend likely rejected connection (auth issue?)');
                    setBidError('Connection failed. Please ensure you are logged in.');
                }
                if (!didUnmount && event.code !== 1000) {
                    reconnectRef.current = setTimeout(connect, 3000);
                }
            };

            socket.onerror = (err) => {
                console.error('[WS] Connection error:', err);
                console.log('[WS] Check: 1) Backend WS server running, 2) User logged in with valid cookie, 3) CORS configured');
            };
        };

        connect();

        return () => {
            didUnmount = true;
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
            if (alertTimeoutRef.current) {
                clearTimeout(alertTimeoutRef.current);
                alertTimeoutRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [activeAuction?.id, user?.id, isRegistered]);

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
            setSelectedItem((prev) => (prev && prev.id === activeAuction.id ? { ...prev, registered: true } : prev));
            setAuctions((prev) => prev.map((a) => (a.id === activeAuction.id ? { ...a, registered: true } : a)));
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
        
        const socket = wsRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'place_bid', amount: bidAmount }));
            setCurrentBid(bidAmount);
            setBidHistory((prev) => [
                {
                    bidder: user.name || 'You',
                    amount: bidAmount,
                    time: 'Just now',
                },
                ...prev,
            ]);
            setUserBid('');
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
            {bidAlert && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
                    {bidAlert}
                </div>
            )}
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
                                            placeholder="Enter bid amount"
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