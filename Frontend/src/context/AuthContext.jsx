import { createContext, useContext, useState } from "react";

// Central place for "is someone logged in, who are they, and what's their token."
// Everything auth-related reads from here, so swapping storage later (e.g. to an
// httpOnly cookie) only touches this file — components keep calling login()/logout().
const AuthContext = createContext();

const USER_KEY = "pythonpal-user";
const TOKEN_KEY = "pythonpal-token";

export const AuthProvider = ({ children }) => {
  // Re-hydrate on refresh so a logged-in user stays logged in.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);

  // Called by SignIn / SignUp on a successful response, with the user object and
  // the JWT the backend handed back. The token is what every later request sends.
  const login = (userData, authToken) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  // The token is what actually gates the protected API, so it decides auth state.
  const value = { user, token, isAuthenticated: !!token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
