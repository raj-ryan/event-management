import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';

export function useWebSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      
      // Send authentication message
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
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
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [user]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
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
