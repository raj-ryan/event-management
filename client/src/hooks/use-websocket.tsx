import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';

// Define notification type
interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// Define WebSocket message types
interface WebSocketAuthMessage {
  type: 'auth';
  userId: number;
}

interface WebSocketNotificationMessage {
  type: 'notification' | 'notifications';
  data: Notification | Notification[];
}

interface WebSocketEventUpdateMessage {
  type: 'eventUpdate';
  eventId: number;
  data: any;
}

type WebSocketMessage = WebSocketAuthMessage | WebSocketNotificationMessage | WebSocketEventUpdateMessage;

export function useWebSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Connect to the WebSocket
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create WebSocket connection
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Different WebSocket URL depending on environment
      let wsUrl;
      if (import.meta.env.PROD && window.location.host.includes('netlify.app')) {
        // For Netlify, we need to use their WebSocket service
        // This requires Netlify Functions + WebSocket support
        wsUrl = `${protocol}//${window.location.host}/.netlify/functions/ws`;
      } else {
        // Local development
        wsUrl = `${protocol}//${window.location.host}/ws`;
      }
      
      console.log('Connecting to WebSocket at:', wsUrl);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        
        // Send authentication message
        const authMessage: WebSocketAuthMessage = {
          type: 'auth',
          userId: user.id
        };
        socket.send(JSON.stringify(authMessage));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          // Handle different message types
          if (data.type === 'notification' || data.type === 'notifications') {
            // For single notification or array of notifications
            const newNotifications = Array.isArray(data.data) 
              ? data.data 
              : [data.data];
            
            setNotifications(prev => [...newNotifications, ...prev]);
          } else if (data.type === 'eventUpdate') {
            // Implement event updates handling here if needed
            console.log('Event update received:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Failed to connect to notification service');
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };

      // Clean up on unmount
      return () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
        socketRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setError('Failed to set up WebSocket connection');
    }
  }, [user]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    try {
      // Import our environment utility for API URL formatting
      const { getApiUrl } = await import('../lib/environment');
      
      const response = await fetch(getApiUrl(`/api/notifications/${notificationId}/read`), {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  return {
    isConnected,
    notifications,
    error,
    markNotificationAsRead
  };
}
