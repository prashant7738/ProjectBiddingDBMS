import { createContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/auth.js';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [tokenState, setTokenState] = useState( localStorage.getItem('token') || getToken());
   const [message, setMessage] = useState('');
  useEffect(() => {
    if (tokenState) {
      localStorage.setItem('token', tokenState);
    } else {
      localStorage.removeItem('token');
    }
  }, [tokenState]);

  return (
    <AuthContext.Provider value={{ tokenState, setTokenState,message,setMessage }}>
      {children}
    </AuthContext.Provider>
  );
}
