import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getPhilippinesTimeISO } from '../utils/timezone';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

interface VisitData {
  page: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
}

export const useSiteVisitTracking = () => {
  const pathname = usePathname();
  const { user, token } = useAuth();
  const lastTrackedPage = useRef<string | null>(null);
  const trackingTimeout = useRef<NodeJS.Timeout | null>(null);

  const trackVisit = useCallback(async (visitData: VisitData) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/site-visits/track`, {
        method: 'POST',
        headers,
        body: JSON.stringify(visitData),
      });

      if (!response.ok) {
        console.warn('Failed to track site visit:', response.statusText);
      }
    } catch (error) {
      console.warn('Error tracking site visit:', error);
      // Don't throw error to avoid breaking the user experience
    }
  }, [token]);

  const trackPageVisit = useCallback((page: string, referrer?: string) => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;

    // Define pages to track (exclude admin pages)
    const pagesToTrack = [
      '/',
      '/landing',
      '/shop',
      '/about-us',
      '/about-page',
      '/help',
      '/contact',
      '/product-catalog-sale',
      '/product-catalog-swap',
      '/item-view-sale',
      '/item-view-swap',
      '/cart-details/cart',
      '/cart-details/track-orders',
      '/cart-details/wishlist',
      '/messages-section',
      '/user-profile',
      '/seller-dashboard'
    ];

    // Check if the current page should be tracked
    const shouldTrack = pagesToTrack.some(trackedPage => {
      if (trackedPage === '/' && page === '/') return true;
      return page.startsWith(trackedPage) && trackedPage !== '/';
    });

    // Don't track admin pages or other excluded pages
    if (!shouldTrack || page.startsWith('/admin')) {
      return;
    }

    // Debounce tracking to avoid too many requests
    if (lastTrackedPage.current === page) return;

    // Clear any existing timeout
    if (trackingTimeout.current) {
      clearTimeout(trackingTimeout.current);
    }

    // Set a timeout to track the visit
    trackingTimeout.current = setTimeout(() => {
      // Get referrer from document if not provided
      const pageReferrer = referrer || document.referrer || undefined;

      trackVisit({
        page,
        referrer: pageReferrer,
        userAgent: navigator.userAgent,
        timestamp: getPhilippinesTimeISO(),
      });

      lastTrackedPage.current = page;
    }, 1000); // 1 second debounce
  }, [trackVisit]);

  // Track page visits on route changes
  useEffect(() => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;

    // Track the current page if pathname is available
    if (pathname) {
      trackPageVisit(pathname);
    }

    return () => {
      if (trackingTimeout.current) {
        clearTimeout(trackingTimeout.current);
      }
    };
  }, [pathname, trackPageVisit]);

  // Fallback: Track initial page load if pathname is not available
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // If pathname is not available, use window.location.pathname as fallback
    if (!pathname && typeof window !== 'undefined') {
      trackPageVisit(window.location.pathname);
    }
  }, [pathname, trackPageVisit]);

  return {
    trackPageVisit,
    trackVisit,
  };
};
