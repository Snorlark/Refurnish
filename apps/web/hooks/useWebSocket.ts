import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketProps {
  userId?: string;
  onProductStatusUpdate?: (data: any) => void;
  onProductSoldUpdate?: (data: any) => void;
}

export const useWebSocket = ({ 
  userId, 
  onProductStatusUpdate, 
  onProductSoldUpdate 
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<any | null>(null);
  const socketRef = useRef<any | null>(null);
  const callbacksRef = useRef({ onProductStatusUpdate, onProductSoldUpdate });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onProductStatusUpdate, onProductSoldUpdate };
  }, [onProductStatusUpdate, onProductSoldUpdate]);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    console.log('Attempting WebSocket connection to:', API_BASE_URL);
    
    // Initialize socket connection
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join seller dashboard room if userId is provided
      if (userId) {
        newSocket.emit('join_seller_dashboard', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      setIsConnected(false);
    });

    // Product status update handler
    newSocket.on('product_status_update', (data: any) => {
      console.log('Product status update received:', data);
      if (callbacksRef.current.onProductStatusUpdate) {
        callbacksRef.current.onProductStatusUpdate(data);
      }
    });

    // Product sold update handler
    newSocket.on('product_sold_update', (data: any) => {
      console.log('Product sold update received:', data);
      if (callbacksRef.current.onProductSoldUpdate) {
        callbacksRef.current.onProductSoldUpdate(data);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]); // Only depend on userId, not the callback functions

  const joinSellerDashboard = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_seller_dashboard', userId);
    }
  };

  const joinAdminDashboard = () => {
    if (socketRef.current) {
      socketRef.current.emit('join_admin_dashboard');
    }
  };

  return {
    socket,
    isConnected,
    joinSellerDashboard,
    joinAdminDashboard,
  };
};
