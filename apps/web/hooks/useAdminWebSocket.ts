import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface AdminNotificationData {
  newSellerRequests: number;
  pendingProducts: number;
  pendingShopApprovals: number;
  totalNotifications: number;
}

interface UseAdminWebSocketProps {
  onNotificationUpdate?: (data: AdminNotificationData) => void;
  onProductModerationUpdate?: (data: any) => void;
}

export const useAdminWebSocket = ({ 
  onNotificationUpdate, 
  onProductModerationUpdate 
}: UseAdminWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef({ onNotificationUpdate, onProductModerationUpdate });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onNotificationUpdate, onProductModerationUpdate };
  }, [onNotificationUpdate, onProductModerationUpdate]);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    console.log('Attempting Admin WebSocket connection to:', API_BASE_URL);
    
    // Initialize socket connection
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Admin WebSocket connected');
      setIsConnected(true);
      
      // Join admin dashboard room
      newSocket.emit('join_admin_dashboard');
    });

    newSocket.on('disconnect', () => {
      console.log('Admin WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Admin WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Admin notification update handler
    newSocket.on('admin_notification_update', (data: AdminNotificationData) => {
      console.log('Admin notification update received:', data);
      if (callbacksRef.current.onNotificationUpdate) {
        callbacksRef.current.onNotificationUpdate(data);
      }
    });

    // Product moderation update handler
    newSocket.on('product_moderation_update', (data: any) => {
      console.log('Product moderation update received:', data);
      if (callbacksRef.current.onProductModerationUpdate) {
        callbacksRef.current.onProductModerationUpdate(data);
      }
    });

    return () => {
      console.log('Cleaning up Admin WebSocket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return {
    socket,
    isConnected
  };
};
