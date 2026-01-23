import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { logoutUser } from "../api/auth";

export const AuthContext = createContext();

// Create a dedicated axios instance for Auth so we don't repeat settings
const authApi = axios.create({
  baseURL: 'http://localhost:8000/api', // Force the backend port
  withCredentials: true,                // Force cookies to be sent
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    // This function runs every time the page is refreshed
    const checkAuthStatus = async () => {
      try {
        // We call the GET method on /login/ to check if the cookie is valid
        const res = await authApi.get("/login/");
        
        if (res.data && res.data.user) {
          setUser(res.data.user);
          console.log("Auth Check: User logged in", res.data.user);
        }
      } catch (err) {
        // If the cookie is expired, missing, or domain is wrong, this will trigger
        console.warn("Auth Check: No valid session found");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {/* We only show the children once loading is finished. 
         This prevents the "flicker" where the login page shows for a split second.
      */}
      {!loading ? children : <div className="loading-spinner">Loading...</div>}
    </AuthContext.Provider>
  );
}