import axios from 'axios';

// Shared HTTP client for all API calls
// Uses HttpOnly cookies for JWT auth - no token storage in JS
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,  // Essential for sending cookies automatically
    headers: {
        'Content-Type': 'application/json',
    },
});

// Centralized 401 handling - treat as "not logged in"
// Can be extended later to retry with /refresh/ endpoint
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // User is not authenticated - let calling code handle redirect
            console.warn('Authentication required - user not logged in');
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const registerUser = (data) => client.post('/register/', data);  // { name, email, password }
export const loginUser = (data) => client.post('/login/', data);        // { email, password }
export const logoutUser = () => client.post('/logout/');                 // Clears cookies
export const loginAdmin = (data) => client.post('/admin/login/', data);

// Protected endpoints (cookies sent automatically)
export const getProfile = () => client.get('/profile/');

// Auction endpoints (public)
export const getAuctions = () => client.get('/auctions/');
export const getAuctionById = (id) => client.get(`/auctions/${id}/`);
export const getEndedAuctions = () => client.get('/auctions/ended/');

// Admin auction endpoints (protected)
export const getAdminAuctions = () => client.get('/admin/auctions/');
export const deleteAdminAuction = (id) => client.delete(`/admin/auctions/${id}/`);

// Admin user endpoints (protected)
export const getAdminUsers = () => client.get('/admin/users/?page_size=100');
export const updateAdminUserBalance = (userId, balance) => client.patch(`/admin/users/${userId}/`, { balance });

// Bid endpoints (protected - requires login)
export const placeBid = (data) => client.post('/bids/place/', data);    // { bidder_id, auction_id, amount }

// Auction Registration endpoints
export const registerForAuction = (auctionId, userId) => client.post(`/auctions/${auctionId}/register/`, { user_id: userId });
export const getRegisteredUsers = (auctionId) => client.get(`/auctions/${auctionId}/registered-users/`);

// User's bid for specific auction
export const getUserBidForAuction = (auctionId, userId) => client.get(`/auctions/${auctionId}/users/${userId}/`);

// Auction bid history
export const getAuctionBidHistory = (auctionId) => client.get(`/auctions/${auctionId}/bids/`);

// Auction creation endpoint
export const createAuction = (formData) => client.post('/create-auction/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

// MyBids
export const myBids = (id) => client.get(`/my-bids/${id}/`);

// My Auctions (seller's auctions)
export const myAuctions = (id) => client.get(`/my-auctions/${id}/`);
export const deleteMyAuction = (userId, auctionId) => client.delete(`/my-auctions/${userId}/`, { data: { auction_id: auctionId } });
export const updateMyAuction = (userId, auctionId, data) => client.patch(`/my-auctions/${userId}/`, { auction_id: auctionId, ...data });

// Won Items
export const winItems = (id) => client.get(`/win-items/${id}/`);

// Notifications
export const getNotifications = (id, since) => {
    const params = since ? { since } : {};
    return client.get(`/notifications/${id}/`, { params });
};





// Media URL helper
const apiRoot = client.defaults.baseURL?.replace(/\/?api\/?$/, '') || import.meta.env.VITE_API_URL;

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiRoot}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Export client for use in other API modules
export default client;