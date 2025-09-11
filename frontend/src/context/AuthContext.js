import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {

    setAuthReady(true);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
