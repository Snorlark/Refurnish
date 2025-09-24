"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, adminSecret?: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  googleLogin: (googleData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  // Sync NextAuth session with AuthContext
  useEffect(() => {
    console.log('AuthContext: Session status changed', { status, session });
    
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.backendUser && session?.backendToken) {
      console.log('AuthContext: Setting user from NextAuth session', session.backendUser);
      console.log('AuthContext: Profile picture URL:', session.backendUser.profilePicture);
      setUser(session.backendUser as User);
      setToken(session.backendToken);
      localStorage.setItem('token', session.backendToken);
      localStorage.setItem('user', JSON.stringify(session.backendUser));
    } else if (status === 'unauthenticated') {
      console.log('AuthContext: User unauthenticated, clearing state');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    setIsLoading(false);
  }, [session, status]);

  // Initialize auth state from localStorage (only if not using NextAuth)
  useEffect(() => {
    if (status === 'unauthenticated') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
  }, [status]);

  const login = async (email: string, password: string, adminSecret?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, adminSecret }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/shop');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/shop');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleData: any) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/shop');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Use NextAuth signOut for Google OAuth users
    if (session) {
      nextAuthSignOut({ callbackUrl: '/' });
    } else {
      // For regular users, just clear local state
      router.push('/');
      setTimeout(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }, 100);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    googleLogin,
    logout,
    isLoading,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
