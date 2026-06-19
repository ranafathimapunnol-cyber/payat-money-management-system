import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile/');
      console.log('✅ User profile fetched:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      console.log('✅ Login response:', response.data);
      
      const { access, refresh, user } = response.data;
      
      if (!access) {
        throw new Error('No access token received');
      }
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Fetch full user profile
      try {
        const profileResponse = await api.get('/auth/profile/');
        setUser(profileResponse.data);
      } catch (profileError) {
        // If profile fetch fails, use the user data from login
        setUser(user);
      }
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      console.log('✅ Registration response:', response.data);
      toast.success('Registration successful! Please verify your email.');
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out');
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp/', { email, otp });
      console.log('✅ Verification response:', response.data);
      
      const { access, refresh, user } = response.data;
      
      if (access) {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Fetch full profile
        try {
          const profileResponse = await api.get('/auth/profile/');
          setUser(profileResponse.data);
        } catch (profileError) {
          setUser(user);
        }
        
        toast.success('Email verified!');
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid OTP');
      throw error;
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp/', { email });
      toast.success('OTP resent!');
      return response.data;
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    verifyOTP,
    resendOTP,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
