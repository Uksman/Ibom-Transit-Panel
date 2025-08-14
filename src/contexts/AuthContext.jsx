import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  axios.defaults.baseURL = API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get("/auth/me");
      if (response.data.role !== "admin") {
        throw new Error("Not an admin user");
      }
      setUser(response.data);
    } catch (error) {
      console.error(
        "Token verification failed:",
        error.response?.data || error.message
      );
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone, role = "admin") => {
    try {
      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
        phone,
        role,
      });
      const { token, user } = response.data;

      if (user.role !== "admin") {
        throw new Error("Only admin users can access this panel");
      }

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      setLoading(false);

      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      setLoading(false);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (user.role !== "admin") {
        throw new Error("Only admin users can access this panel");
      }

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post("/auth/forgot-password", { email });
      return { success: true };
    } catch (error) {
      console.error("Forgot password failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to send reset link",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    forgotPassword,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
