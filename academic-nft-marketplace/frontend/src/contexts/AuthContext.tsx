import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../lib/api';
import api from '../lib/api';
import { supabaseAuth, supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  session: Session | null;
  loading: boolean;
  pendingVerification: string | null; // Email pending verification
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: any) => Promise<{ needsVerification: boolean; email: string }>;
  logout: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session with improved error handling
    const getInitialSession = async () => {
      try {
        // First check localStorage for existing authentication
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          
          if (storedToken && storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              // Validate stored user data
              if (userData && userData.id && userData.email) {
                setToken(storedToken);
                setUser(userData);
                console.log('🔐 Restored session from localStorage:', userData.email);
                setLoading(false);
                return;
              } else {
                console.warn('⚠️ Invalid stored user data, clearing localStorage');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
            } catch (e) {
              console.error('❌ Error parsing stored user data:', e);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
          
          const storedPendingVerification = localStorage.getItem('pendingVerification');
          if (storedPendingVerification) {
            setPendingVerification(storedPendingVerification);
          }
        }

        // Then try Supabase session (with timeout)
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 5000)
          );
          
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          
          if (error) {
            console.warn('⚠️ Supabase session error:', error.message);
          } else if (session) {
            console.log('🔐 Found Supabase session:', session.user.email);
            setSession(session);
            setToken(session.access_token);
            setUser({
              id: session.user.id,
              email: session.user.email!,
              firstName: session.user.user_metadata?.first_name || '',
              lastName: session.user.user_metadata?.last_name || '',
              university: session.user.user_metadata?.university || '',
              role: session.user.user_metadata?.role || 'student',
              emailVerified: session.user.email_confirmed_at !== null
            });
          }
        } catch (sessionError) {
          console.warn('⚠️ Supabase session check failed:', sessionError);
          // Continue without session - user can still login
        }
      } catch (error) {
        console.error('❌ Error in initial session setup:', error);
      } finally {
        setLoading(false);
        console.log('✅ Authentication initialization complete');
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          setSession(session);
          setToken(session.access_token);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            university: session.user.user_metadata?.university || '',
            role: session.user.user_metadata?.role || 'student',
            emailVerified: session.user.email_confirmed_at !== null
          });
          setPendingVerification(null);
          
          // Clear pending verification from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pendingVerification');
          }
        } else {
          setSession(null);
          setToken(null);
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      // Handle demo user and test users (hardcoded for testing)
      if (email === 'demo@student.edu' || email.includes('test') || email.includes('demo') || email.includes('example')) {
        try {
          console.log('🎭 Using demo/test user authentication');
          // Use the API route for demo user
          const response = await authAPI.login({ email, password });
          const { token: newToken, user: newUser } = response.data;
          
          console.log('✅ Demo login successful:', newUser.email);
          
          setToken(newToken);
          setUser(newUser);
          setPendingVerification(null);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            localStorage.removeItem('pendingVerification');
            console.log('💾 Stored demo user session in localStorage');
          }
          return;
        } catch (error: any) {
          console.error('❌ Demo login error:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Demo login failed';
          throw new Error(errorMessage);
        }
      }

      // Use Supabase authentication for real users
      if (!password) {
        throw new Error('Password is required');
      }

      // Fallback to demo authentication system for all non-demo users
      console.log('🔄 Using API login for non-demo email:', email);
      const demoResponse = await api.post('/auth/login', { email, password });
      const { user: newUser, token: newToken } = demoResponse.data;
      
      setUser(newUser);
      setToken(newToken);
      setPendingVerification(null);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.removeItem('pendingVerification');
        console.log('💾 Stored user session in localStorage');
      }

      // Session will be set automatically by the auth state change listener
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      
      // Use API registration system
      console.log('📝 Using API registration for:', userData.email);
      const response = await api.post('/auth/register', userData);
      const result = response.data;
      
      if (result.needsVerification) {
        console.log('📧 Registration requires verification');
        setPendingVerification(userData.email);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingVerification', userData.email);
        }
        return result;
      }
      
      // If direct registration success (demo users)
      if (result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user:', user?.email);
      
      // Sign out from Supabase (unless it's a demo/test user)
      if (user?.email && !user.email.includes('demo') && !user.email.includes('test') && !user.email.includes('example')) {
        console.log('🔐 Signing out from Supabase');
        await supabaseAuth.signOut();
      }
      
      // Clear local state
      setUser(null);
      setToken(null);
      setSession(null);
      setPendingVerification(null);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingVerification');
        console.log('🧹 Cleared localStorage');
      }
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if Supabase signout fails, clear local state
      setUser(null);
      setToken(null);
      setSession(null);
      setPendingVerification(null);
      
      // Ensure localStorage is cleared
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingVerification');
      }
      console.log('⚠️ Logout completed with errors, but local state cleared');
    }
  };

  const verifyEmail = async (email: string, verificationToken: string) => {
    try {
      setLoading(true);
      console.log('📧 Attempting email verification for:', email);
      
      // Check if this is a demo/test user - they don't need OTP verification
      if (email.includes('test') || email.includes('demo') || email.includes('example')) {
        console.log('🎭 Demo user verification - auto-approving');
        
        // Create a demo user session
        const demoUser = {
          id: `demo-${Date.now()}`,
          email,
          firstName: 'Demo',
          lastName: 'User',
          university: 'Demo University',
          role: 'student',
          emailVerified: true
        };
        
        const demoToken = 'demo-token-12345'; // Use consistent demo token
        
        setUser(demoUser);
        setToken(demoToken);
        setPendingVerification(null);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(demoUser));
          localStorage.setItem('token', demoToken);
          localStorage.removeItem('pendingVerification');
          console.log('💾 Stored demo user session');
        }
        
        console.log('✅ Demo email verification successful');
        return;
      }

      // For real users, use Supabase OTP verification
      console.log('🔐 Using Supabase OTP verification');
      const response = await api.post('/auth/verify-otp', { 
        email, 
        token: verificationToken, 
        type: 'signup' 
      });
      const result = response.data;
      
      if (result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        setPendingVerification(null);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.removeItem('pendingVerification');
        }
        console.log('✅ API OTP verification successful');
      }



      console.log('🎉 Email verification complete - user ready for dashboard');
      
    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      throw new Error(error.message || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      console.log('📧 Resending verification for:', email);
      
      // Handle demo/test users
      if (email.includes('test') || email.includes('demo') || email.includes('example')) {
        console.log('🎭 Demo user - simulating resend success');
        // For demo users, just simulate success since they don't need real OTP
        return;
      }

      console.log('🔐 Using Supabase resend OTP');
      const response = await api.post('/auth/resend-otp', { email, type: 'signup' });
      const result = response.data;
      

      console.log('✅ Verification email resent successfully');
      
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    session,
    loading,
    pendingVerification,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    isAuthenticated: !!user && (!!token || !!session),
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};