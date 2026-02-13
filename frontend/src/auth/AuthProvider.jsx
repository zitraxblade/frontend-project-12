import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(localStorage.getItem(USERNAME_KEY));

  const logIn = ({ token: newToken, username: newUsername }) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USERNAME_KEY, newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const logOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  };

  const value = useMemo(() => ({
    token,
    username,
    isAuthenticated: Boolean(token),
    logIn,
    logOut,
  }), [token, username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);