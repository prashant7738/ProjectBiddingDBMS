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

// Export client for use in other API modules
export default client;