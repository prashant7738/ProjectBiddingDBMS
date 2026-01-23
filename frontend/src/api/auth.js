import axios from 'axios';

// 1. Create an instance so settings are shared across all calls
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true // THIS IS THE GLOBAL FIX
});
export const logoutUser = () =>
  axios.post(`${API_URL}/logout/`, {}, { withCredentials: true });
export const loginUser = (data) => api.post('/login/', data);
export const registerUser = (data) => api.post('/register/', data);
// THIS is what you call in your AuthContext useEffect
export const checkAuth = () => api.get('/login/');
export const getProfile = () =>
  axios.get(`${API_URL}/profile/`, { withCredentials: true });