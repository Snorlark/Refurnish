"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface SwapItem {
  _id: string;
  productId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  product?: { id: string; title: string; image: string } | null;
}

export function useSwap() {
  const { token, user } = useAuth();
  const [swaps, setSwaps] = useState<SwapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMySwaps = useCallback(async () => {
    if (!token || !user) {
      setSwaps([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/swaps/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch swaps: ${res.statusText}`);
      const data = await res.json();
      setSwaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch swaps');
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  const createSwap = useCallback(async (productId: string, message: string = '') => {
    if (!token || !user) throw new Error('User not authenticated');
    const res = await fetch(`${API_BASE_URL}/api/swaps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, message }),
    });
    if (!res.ok) throw new Error(`Failed to create swap: ${res.statusText}`);
    const result = await res.json();
    await fetchMySwaps();
    return result.swap as SwapItem;
  }, [token, user, fetchMySwaps]);

  const deleteSwapAsSeller = useCallback(async (swapId: string) => {
    if (!token || !user) throw new Error('User not authenticated');
    const res = await fetch(`${API_BASE_URL}/api/swaps/seller/${swapId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to delete swap: ${res.statusText}`);
    // Refresh local list if seller is viewing own swaps page; for buyer's page, we also update because it might reflect deletion
    await fetchMySwaps();
    return true;
  }, [token, user, fetchMySwaps]);

  useEffect(() => {
    if (user && token) fetchMySwaps();
  }, [user, token, fetchMySwaps]);

  return { swaps, isLoading, error, fetchMySwaps, createSwap, deleteSwapAsSeller };
}


