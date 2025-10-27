"use client";
import { useEffect } from 'react';
import { useSiteVisitTracking } from '../hooks/useSiteVisitTracking';

const SiteVisitTracker = () => {
  // This component automatically tracks site visits using the hook
  useSiteVisitTracking();
  
  // This component doesn't render anything
  return null;
};

export default SiteVisitTracker;
