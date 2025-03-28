import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface UserConnection {
  userId: number;
  connection: WebSocket;
}

export function setupWebSockets(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Store user connections
  const connections: UserConnection[] = [];
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth') {
          userId = data.userId;
          connections.push({ userId, connection: ws });
          console.log(`User ${userId} connected to WebSocket`);
          
          // Send any unread notifications on connect
          const notifications = await storage.getNotificationsByUser(userId);
          const unreadNotifications = notifications.filter(n => !n.read);
          
          if (unreadNotifications.length > 0) {
            ws.send(JSON.stringify({
              type: 'notifications',
              data: unreadNotifications
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        // Remove connection when closed
        const index = connections.findIndex(c => c.userId === userId && c.connection === ws);
        if (index !== -1) {
          connections.splice(index, 1);
          console.log(`User ${userId} disconnected from WebSocket`);
        }
      }
    });
  });
  
  // Function to send notification to a specific user
  return {
    sendNotification: (userId: number, notification: any) => {
      const userConnections = connections.filter(c => c.userId === userId);
      
      for (const { connection } of userConnections) {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));
        }
      }
    },
    
    broadcastEventUpdate: (eventId: number, data: any) => {
      for (const { connection } of connections) {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'eventUpdate',
            eventId,
            data
          }));
        }
      }
    }
  };
}
