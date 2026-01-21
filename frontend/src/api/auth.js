import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const registerUser = (data) => axios.post(`${API_URL}/register/`, data);
export const loginUser = (data) => axios.post(`${API_URL}/login/`, data);
export const getProfile = () => 
    axios.get(`${API_URL}/profile`, { withCredentials: true});
