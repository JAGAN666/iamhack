import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../lib/api';
import { supabaseAuth } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  university: string;
  role: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  pendingVerification: string | null; // Email pending verification
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: any) => Promise<{ needsVerification: boolean; email: string }>;
  logout: () => void;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);

  useEffect(() => {
    // Only access localStorage on client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      // Check for existing auth on mount
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedPendingVerification = localStorage.getItem('pendingVerification');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      if (storedPendingVerification) {
        setPendingVerification(storedPendingVerification);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: newUser, needsVerification } = response.data;

      if (needsVerification) {
        // User needs to verify email first
        setPendingVerification(email);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingVerification', email);
        }
        throw new Error('Email verification required. Please check your email and verify your account.');
      }

      setToken(newToken);
      setUser(newUser);
      setPendingVerification(null);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.removeItem('pendingVerification');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { needsVerification, email } = response.data;
      
      if (needsVerification) {
        setPendingVerification(email);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingVerification', email);
        }
      }

      return { needsVerification: needsVerification || false, email: email || userData.email };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPendingVerification(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('pendingVerification');
    }
  };

  const verifyEmail = async (email: string, verificationToken: string) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOtp({ email, token: verificationToken });
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      setPendingVerification(null);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.removeItem('pendingVerification');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.response?.data?.error || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await authAPI.resendOtp({ email });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.response?.data?.error || 'Failed to resend verification');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    pendingVerification,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};