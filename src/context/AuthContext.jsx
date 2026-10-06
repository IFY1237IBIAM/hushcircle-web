"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api, { setToken, getToken, clearToken } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStoredAuth(); }, []);

  const loadStoredAuth = async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get("/auth/refresh");
      setUser(res.data.user);
    } catch { clearToken(); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password, deviceName: "Web Browser", deviceOS: "Web" });
    const { token, user: newUser, twoStep, twoStepHint } = res.data;
    if (newUser.isVerified === false) return { unverified: true, email };
    if (twoStep) return { twoStep: true, twoStepHint: twoStepHint || "", pendingToken: token, pendingUser: newUser };
    setToken(token); setUser(newUser);
    return res.data;
  };

  const signup = async (pseudonym, email, password) => {
    const res = await api.post("/auth/signup", { pseudonym, email, password });
    return { user: res.data.user, unverified: true, email };
  };

  const setAuth = (token, newUser) => { setToken(token); setUser(newUser); };

  const logout = async () => {
    try { await api.put("/auth/offline"); } catch {}
    clearToken(); setUser(null);
  };

  const updateUser = updates => setUser(prev => {
    const updated = { ...prev, ...updates };
    return updated;
  });

  const refreshUser = async () => {
    try { const res = await api.get("/auth/refresh"); setUser(res.data.user); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, setAuth, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
