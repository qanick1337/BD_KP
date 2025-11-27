import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("authToken");
        const savedEmail = localStorage.getItem("authEmail");
        if (savedToken) setToken(savedToken);
        if (savedEmail) setEmail(savedEmail);
        setLoading(false);
    }, []);

    const login = (newToken, userEmail) => {
        localStorage.setItem("authToken", newToken);
        localStorage.setItem("authEmail", userEmail);
        setToken(newToken);
        setEmail(userEmail);
    }

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authEmail");
        setToken(null);
        setEmail(null);
    };

    const value = {
        token,
        email,
        isAuthenticated: Boolean(token),
        login,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
