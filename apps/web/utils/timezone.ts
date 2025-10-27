/**
 * Utility functions for handling Philippines timezone (UTC+8)
 */

export const getPhilippinesTime = (): Date => {
  const now = new Date();
  // Convert to Philippines time (UTC+8)
  const philippinesTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return philippinesTime;
};

export const getPhilippinesTimeISO = (): string => {
  return getPhilippinesTime().toISOString();
};

export const formatPhilippinesTime = (date: Date): string => {
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};





