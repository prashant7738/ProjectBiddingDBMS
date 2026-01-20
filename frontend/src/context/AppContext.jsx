import { createContext } from "react";
import { useState } from "react";

export  const AppContext = createContext();

export const AppProvider = ({ children }) => {
            const [selectedCategory, setSelectedCategory] = useState('all');
            const [selectedCountry, setSelectedCountry] = useState('all');
            const [liveFilter, setLiveFilter] = useState('all');
            const [searchQuery, setSearchQuery] = useState('');
            const [selectedItem, setSelectedItem] = useState(null);
            const [userBid, setUserBid] = useState('');
            const [notifications, setNotifications] = useState([
                { id: 1, message: "You've been outbid on Renaissance Oil Painting", time: "2 min ago", read: false },
                { id: 2, message: "New auction starting in 1 hour", time: "15 min ago", read: false }
            ]);
            const [wonItems, setWonItems] = useState([]);
            const [myItems, setMyItems] = useState([]);
            const [showNotifications, setShowNotifications] = useState(false);

            const unreadCount = notifications.filter(n => !n.read).length;

            return (
                <AppContext.Provider value={{
                    selectedCategory, setSelectedCategory,
                    selectedCountry, setSelectedCountry,
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

