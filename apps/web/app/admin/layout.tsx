"use client";
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NotFound from '../not-found';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  // Only redirect authenticated non-admins to home
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#636B2F]"></div>
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
