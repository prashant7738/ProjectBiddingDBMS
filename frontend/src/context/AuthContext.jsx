import { createContext, useState, useEffect } from 'react';
import { getProfile, logoutUser, refreshToken } from '../api/auth.js';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const refreshProfile = async () => {
    try {
      console.log('Attempting to fetch profile...');
      console.log('Current cookies:', document.cookie);
      const res = await getProfile();
      console.log('Profile fetched successfully:', res.data);
      setUser(res.data);
      return true;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        try {
          await refreshToken();
          const retry = await getProfile();
          setUser(retry.data);
          return true;
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr.response?.status, refreshErr.message);
          setUser(null);
          return false;
        }
      }
      console.error('Failed to fetch profile:', status, err.message);
      console.error('Error details:', err.response?.data);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);


  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors - user will be logged out locally anyway
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshProfile, logout, message, setMessage }}>
      {children}
    </AuthContext.Provider>
  );
}
