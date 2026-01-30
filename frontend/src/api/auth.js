import axios from 'axios';

// Shared HTTP client for all API calls
// Uses HttpOnly cookies for JWT auth - no token storage in JS
const client = axios.create({
    baseURL: 'http://localhost:8000/api',
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

// Protected endpoints (cookies sent automatically)
export const getProfile = () => client.get('/profile/');

// Auction endpoints (public)
export const getAuctions = () => client.get('/auctions/');
export const getAuctionById = (id) => client.get(`/auctions/${id}/`);

// Bid endpoints (protected - requires login)
export const placeBid = (data) => client.post('/bids/place/', data);    // { bidder_id, auction_id, amount }

// Auction Registration endpoints
export const registerForAuction = (auctionId, userId) => client.post(`/auctions/${auctionId}/register/`, { user_id: userId });
export const getRegisteredUsers = (auctionId) => client.get(`/auctions/${auctionId}/registered-users/`);





// Media URL helper
const apiRoot = client.defaults.baseURL?.replace(/\/?api\/?$/, '') || 'http://127.0.0.1:8000';

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiRoot}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Export client for use in other API modules
export default client;