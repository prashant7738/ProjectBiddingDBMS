import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user,setUser] = useState()
  const [loading, setLoading] = useState(true);
    useEffect(() => {
    axios
      .get("/api/login")
      .then(res => {
        if(res.data.user){
        setUser(res.data.user);
      }})
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <AuthContext.Provider value={{ user,setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
