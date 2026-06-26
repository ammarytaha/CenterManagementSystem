import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/resources.js';
import { setToken, getToken } from '../api/client.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On boot, restore the session from a stored token.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const d = await authApi.login({ email, password });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
