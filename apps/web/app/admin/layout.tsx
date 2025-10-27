"use client";
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NotFound from '../not-found';
import { useAdminSession } from '../../hooks/useAdminSession';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading, user, token } = useAuth();
  const router = useRouter();
  
  // Debug logging
  const hasStoredAuth = typeof window !== 'undefined' && 
    localStorage.getItem('token') && 
    localStorage.getItem('user');
  console.log('AdminLayout: Auth state', { 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    user: user?.email, 
    hasToken: !!token,
    hasStoredAuth,
    storedToken: typeof window !== 'undefined' ? localStorage.getItem('token')?.substring(0, 20) + '...' : 'N/A'
  });
  
  // Initialize admin session handler
  useAdminSession({
    maxInactiveTime: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    checkInterval: 60 * 1000, // Check every minute
  });

  // Only redirect authenticated non-admins to home
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#636B2F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If we have stored auth data but no current auth state, show loading
  if (hasStoredAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#636B2F] mx-auto mb-4"></div>
          <p className="text-gray-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  // Show 404 page for unauthenticated users or non-admins
  // This hides the existence of admin routes for security
  if (!isAuthenticated || !isAdmin) {
    return <NotFound />;
  }

  return <>{children}</>;
}
