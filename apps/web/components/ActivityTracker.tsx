"use client";
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ActivityTracker = () => {
  const { updateActivity, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Update activity on mount
    updateActivity();

    // Update activity every 2 minutes
    const interval = setInterval(updateActivity, 2 * 60 * 1000);

    // Update activity on user interaction
    const handleUserActivity = () => {
      updateActivity();
    };

    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [updateActivity, isAuthenticated]);

  return null; // This component doesn't render anything
};

export default ActivityTracker;
