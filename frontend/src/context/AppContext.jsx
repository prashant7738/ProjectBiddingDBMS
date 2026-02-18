import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getNotifications } from "../api/auth";

export  const AppContext = createContext();

export const AppProvider = ({ children }) => {
            const { user } = useContext(AuthContext);
            const [selectedCategory, setSelectedCategory] = useState(0); // 0 means all
            const [liveFilter, setLiveFilter] = useState('all');
            const [searchQuery, setSearchQuery] = useState('');
            const [selectedItem, setSelectedItem] = useState(null);
            const [userBid, setUserBid] = useState('');
            const [notifications, setNotifications] = useState([]);
            const [wonItems, setWonItems] = useState([]);
            const [myItems, setMyItems] = useState([]);
            const [showNotifications, setShowNotifications] = useState(false);
            const pollRef = useRef(null);
            const lastCheckedRef = useRef(null);

            const unreadCount = notifications.filter(n => !n.read).length;

            useEffect(() => {
                if (!user?.id) {
                    setNotifications([]);
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                    return;
                }

                const storageKey = `notif_last_checked_${user.id}`;
                const initialSince = localStorage.getItem(storageKey);
                lastCheckedRef.current = initialSince ? new Date(initialSince) : null;

                const fetchNotifications = async () => {
                    try {
                        const since = lastCheckedRef.current ? lastCheckedRef.current.toISOString() : null;
                        const res = await getNotifications(user.id, since);
                        const list = Array.isArray(res.data) ? res.data : [];
                        if (list.length) {
                            setNotifications((prev) => {
                                const existing = new Set(prev.map((n) => n.id));
                                const incoming = list
                                    .filter((n) => !existing.has(n.id))
                                    .filter((n) => {
                                        // Suppress outbid notifications sent to the auction's own seller.
                                        // The backend incorrectly notifies the creator when someone bids.
                                        const isOutbid =
                                            n.type === 'outbid' ||
                                            n.notification_type === 'outbid' ||
                                            (typeof n.message === 'string' &&
                                                /outbid|you('ve| have) been outbid/i.test(n.message));
                                        const userIsSeller =
                                            // backend may send seller_id directly on the notification
                                            (n.seller_id && String(n.seller_id) === String(user.id)) ||
                                            (n.auction_seller_id && String(n.auction_seller_id) === String(user.id));
                                        // Drop it if it looks like an outbid notice AND we can confirm
                                        // the user is the seller. If seller info is absent we keep it
                                        // so we don't accidentally hide real alerts for actual bidders.
                                        return !(isOutbid && userIsSeller);
                                    });
                                return [...incoming, ...prev];
                            });
                        }
                        const now = new Date();
                        lastCheckedRef.current = now;
                        localStorage.setItem(storageKey, now.toISOString());
                    } catch {
                        // Ignore polling errors
                    }
                };

                fetchNotifications();
                pollRef.current = setInterval(fetchNotifications, 3000);

                return () => {
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                };
            }, [user?.id]);

            return (
                <AppContext.Provider value={{
                    selectedCategory, setSelectedCategory,
                    liveFilter, setLiveFilter,
                    searchQuery, setSearchQuery,
                    selectedItem, setSelectedItem,
                    userBid, setUserBid,
                    notifications, setNotifications,
                    wonItems, setWonItems,
                    myItems, setMyItems,
                    showNotifications, setShowNotifications,
                    unreadCount
                }}>
                    {children}
                </AppContext.Provider>
            );
        };