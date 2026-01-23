import { createContext, useState, useEffect } from 'react';
import { getProfile, logoutUser } from '../api/auth.js';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const refreshProfile = async () => {
    try {
      const res = await getProfile();
      console.log('Profile fetched successfully:', res.data);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err.response?.status, err.message);
      setUser(null);
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
