"use client";
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminSessionConfig {
  maxInactiveTime: number; // in milliseconds (default: 30 minutes)
  warningTime: number; // in milliseconds (default: 5 minutes before expiry)
  checkInterval: number; // in milliseconds (default: 1 minute)
}

const DEFAULT_CONFIG: AdminSessionConfig = {
  maxInactiveTime: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes
  checkInterval: 60 * 1000, // 1 minute
};

export const useAdminSession = (config: Partial<AdminSessionConfig> = {}) => {
  const { logout, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  // Check session validity
  const checkSession = useCallback(() => {
    if (!isAdmin || !isAuthenticated) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const timeUntilExpiry = finalConfig.maxInactiveTime - timeSinceLastActivity;

    // If session has expired
    if (timeSinceLastActivity >= finalConfig.maxInactiveTime) {
      console.log('Admin session expired due to inactivity');
      logout();
      router.push('/login');
      return;
    }

    // If we're in the warning period and haven't shown warning yet
    if (timeUntilExpiry <= finalConfig.warningTime && !warningShownRef.current) {
      warningShownRef.current = true;
      const remainingMinutes = Math.ceil(timeUntilExpiry / (60 * 1000));
      
      // Show warning modal or notification
      if (window.confirm(`Your admin session will expire in ${remainingMinutes} minute(s) due to inactivity. Click OK to extend your session, or Cancel to continue.`)) {
        updateActivity();
      }
    }
  }, [isAdmin, isAuthenticated, logout, router, finalConfig, updateActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAdmin || !isAuthenticated) {
      return;
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start session checking interval
    intervalRef.current = setInterval(checkSession, finalConfig.checkInterval);

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAdmin, isAuthenticated, checkSession, updateActivity, finalConfig.checkInterval]);

  // Reset activity on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAdmin && isAuthenticated) {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdmin, isAuthenticated, updateActivity]);

  return {
    updateActivity,
    getTimeUntilExpiry: () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      return Math.max(0, finalConfig.maxInactiveTime - timeSinceLastActivity);
    },
    getTimeSinceLastActivity: () => Date.now() - lastActivityRef.current,
  };
};
