import React, { createContext, useState, useContext, useEffect } from "react";
import {
  authAPI,
  setAuthToken,
  setRefreshToken,
  getAuthToken,
  getRefreshToken,
} from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      const refreshToken = getRefreshToken();
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Validate token by calling /me endpoint
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, try refresh
          if (refreshToken) {
            try {
              const refreshResponse = await authAPI.refreshToken(refreshToken);
              const { token: newToken, refreshToken: newRefreshToken } =
                refreshResponse.data.data;
              setAuthToken(newToken);
              setRefreshToken(newRefreshToken);
              // Retry profile fetch
              const profileResponse = await authAPI.getProfile();
              setUser(profileResponse.data.data.user);
              setIsAuthenticated(true);
            } catch (refreshError) {
              // Refresh failed, clear auth
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token, refreshToken } = response.data.data;

      setAuthToken(token);
      setRefreshToken(refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return {
        success: true,
        message:
          response.data?.message ||
          "Registration successful! Please verify your email.",
      };
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }

    setAuthToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password change failed",
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
