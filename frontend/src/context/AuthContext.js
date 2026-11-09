import { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/sv";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = signed out

  useEffect(() => {
    if (!sessionStorage.getItem("sv_token")) {
      setUser(false);
      return;
    }
    http.get("/auth/me").then((r) => setUser(r.data)).catch(() => {
      sessionStorage.removeItem("sv_token");
      setUser(false);
    });
  }, []);

  const login = async (email, password) => {
    const { data } = await http.post("/auth/login", { email, password });
    sessionStorage.setItem("sv_token", data.token);
    setUser(data.user);
  };
  const logout = () => {
    sessionStorage.removeItem("sv_token");
    setUser(false);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
