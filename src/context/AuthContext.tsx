import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string, deviceId: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  verifyOtp: (otp: string, phone: string) => Promise<boolean>;
  forgotPassword: (phone: string) => Promise<boolean>;
  resetPassword: (data: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
  try {
    const res = await api.getProfile();
    const userData = res?.data?.user || res?.data || res;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // ✅ cache update bhi karo
  } catch (error) {
    localStorage.clear();
    toast.error("Session expired. Please login again.");
  } finally {
    setIsLoading(false);
  }
};

  const refreshUser = async () => {
  try {
    const res = await api.getProfile();
    const userData = res?.data?.user || res?.data || res;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  } catch (error) {
    console.error("Failed to refresh user:", error);
  }
};

  const login = async (phone: string, password: string, deviceId: string): Promise<boolean> => {
  try {
    // backend ko 3 fields bhejni hai
    const res = await api.login({ phone, password, deviceId });


    const accessToken = res?.accessToken;
    const refreshToken = res?.refreshToken;
    const userData = res?.user;

    if (!accessToken || !userData) {
      throw new Error("Invalid login response");
    }

    // save tokens + user in localStorage
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    toast.success("Login successful!");
    return true;
  } catch (error: any) {
    toast.error(error.message || "Login failed");
    return false;
  }
};

  const register = async (userData: any): Promise<boolean> => {
  try {
    const res = await api.register(userData);

    const accessToken = res?.data?.accessToken;
    const refreshToken = res?.data?.refreshToken;
    const newUser = res?.data?.user;

    if (accessToken && newUser) {
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }

    toast.success('Registration successful!');
    return true;
  } catch (error: any) {
    toast.error(error.message || 'Registration failed');
    return false;
  }
};

  const verifyOtp = async (otp: string, phone: string): Promise<boolean> => {
    try {
      await api.verifyOtp({ otp, phone });
      toast.success('OTP verified successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
      return false;
    }
  };

  const forgotPassword = async (phone: string): Promise<boolean> => {
    try {
      await api.forgotPassword(phone);
      toast.success('OTP sent to your phone!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
      return false;
    }
  };

  const resetPassword = async (data: any): Promise<boolean> => {
    try {
      await api.resetPassword(data);
      toast.success('Password reset successful!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Password reset failed');
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    await api.changePassword({ currentPassword, newPassword });
    toast.success("Password changed successfully!");
    return true;
  } catch (error: any) {
    toast.error(error.message || "Failed to change password");
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        verifyOtp,
        forgotPassword,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
