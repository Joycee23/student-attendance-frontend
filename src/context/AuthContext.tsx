import React, { createContext, useState, useContext, useEffect } from "react";
import {
  authAPI,
  setAuthToken,
  setRefreshToken,
  getAuthToken,
  getRefreshToken,
} from "../services/api";

interface User {
  _id: string;
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  studentCode?: string;
  lecturerCode?: string;
  avatarUrl?: string;
  classId?: string;
  courseIds?: any[];
  dateOfBirth?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  hasFaceRegistered: boolean;
  faceEncodingId?: string;
  lastLogin?: string;
  loginAttempts: number;
  resetPasswordToken?: string;
  resetPasswordExpire?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  classes?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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
              await logout();
            }
          } else {
            await logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Login attempt:", { email, password: "***" });
      const response = await authAPI.login({ email, password });
      console.log("Login API response:", response.data);

      const { user: userData, token, refreshToken } = response.data.data;

      setAuthToken(token);
      setRefreshToken(refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, message: "Login successful", user: userData };
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.response?.data);

      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || error.message || "Login failed",
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      return {
        success: true,
        message:
          response.data?.message ||
          "Registration successful! Please verify your email.",
      };
    } catch (error: any) {
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

  const updateProfile = async (profileData: any) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true, message: "Profile updated successfully" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      return { success: true, message: "Password changed successfully" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Password change failed",
      };
    }
  };

  const value: AuthContextType = {
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