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
  contactNumber?: string;
  address?: string;
  birthday?: string; // ISO date
  gender?: 'male' | 'female' | 'other';
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
  refreshProfile: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  updateActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRestoredFromStorage, setHasRestoredFromStorage] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  // Sync NextAuth session with AuthContext
  useEffect(() => {
    console.log('AuthContext: Session status changed', { 
      status, 
      hasSession: !!session, 
      hasBackendUser: !!session?.backendUser,
      hasRestoredFromStorage,
      currentUser: user?.email,
      currentToken: !!token
    });
    
    if (status === 'loading') {
      console.log('AuthContext: NextAuth is loading, setting isLoading to true');
      setIsLoading(true);
      return;
    }

    // If we've already restored from localStorage, don't override unless NextAuth has a valid session
    if (hasRestoredFromStorage && !session?.backendUser) {
      console.log('AuthContext: Already restored from localStorage, skipping NextAuth override');
      setIsLoading(false);
      return;
    }

    if (session?.backendUser && session?.backendToken) {
      console.log('AuthContext: Setting user from NextAuth session', session.backendUser);
      console.log('AuthContext: Profile picture URL:', session.backendUser.profilePicture);
      setUser(session.backendUser as User);
      setToken(session.backendToken);
      localStorage.setItem('token', session.backendToken);
      localStorage.setItem('user', JSON.stringify(session.backendUser));
      // Hydrate with full profile from backend so extended fields are present
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.backendToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const fullUser: User = {
              id: data.id,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              role: data.role,
              profilePicture: data.profilePicture,
              contactNumber: data.contactNumber,
              address: data.address,
              birthday: data.birthday,
              gender: data.gender,
            };
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
          }
        } catch {}
      })();
    } else if (status === 'unauthenticated' && !hasRestoredFromStorage) {
      console.log('AuthContext: User unauthenticated, clearing state');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    setIsLoading(false);
  }, [session, status, hasRestoredFromStorage]);

  // Initialize auth state from localStorage on mount (for page refresh)
  useEffect(() => {
    console.log('AuthContext: Running localStorage restoration useEffect');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthContext: Stored data check', { 
      hasToken: !!storedToken, 
      hasUser: !!storedUser,
      tokenPreview: storedToken?.substring(0, 20) + '...',
      userPreview: storedUser ? JSON.parse(storedUser).email : 'N/A'
    });
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Setting user and token from localStorage', { email: parsedUser.email, role: parsedUser.role });
        setToken(storedToken);
        setUser(parsedUser);
        setHasRestoredFromStorage(true);
        console.log('AuthContext: Successfully restored user from localStorage', parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing stored user', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('AuthContext: No stored auth data found');
    }
    
    // Set loading to false after checking localStorage
    console.log('AuthContext: Setting isLoading to false');
    setIsLoading(false);
  }, []); // Run only on mount

  // Clear localStorage when NextAuth session is unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated' && !user && !token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [status, user, token]);

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
    // Clear state immediately
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Use NextAuth signOut for Google OAuth users
    if (session) {
      nextAuthSignOut({ callbackUrl: '/' });
    } else {
      // For regular users, navigate to home
      router.push('/');
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
    refreshProfile: async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to refresh profile');
        const refreshed: User = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          profilePicture: data.profilePicture,
          contactNumber: data.contactNumber,
          address: data.address,
          birthday: data.birthday,
          gender: data.gender,
        };
        setUser(refreshed);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          profilePicture: data.profilePicture,
          contactNumber: data.contactNumber,
          address: data.address,
          birthday: data.birthday,
          gender: data.gender,
        }));
      } catch (e) {
        // swallow
      }
    },
    updateUser: (partial: Partial<User>) => {
      setUser((prev) => {
        const merged = { ...(prev || ({} as User)), ...partial } as User;
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      });
    },
    updateActivity: async () => {
      try {
        if (!token) return;
        await fetch(`${API_BASE_URL}/api/users/activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        // swallow errors for activity tracking
      }
    },
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

