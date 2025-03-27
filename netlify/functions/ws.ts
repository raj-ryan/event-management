import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { WebSocketServer, WebSocket } from 'ws';

// Store connected clients
const clients = new Map<number, WebSocket>();

// Setup WebSocket server
const wss = new WebSocketServer({ 
  clientTracking: true,
  noServer: true 
});

wss.on('connection', (ws, request) => {
  console.log('Client connected to WebSocket');
  
  // Listen for messages from the client
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      
      // Handle authentication message
      if (data.type === 'auth' && data.userId) {
        const userId = data.userId;
        clients.set(userId, ws);
        console.log(`User ${userId} authenticated on WebSocket`);
        
        // Send confirmation
        ws.send(JSON.stringify({
          type: 'notification',
          data: {
            id: Date.now(),
            userId: userId,
            message: 'Connected to notifications service',
            type: 'info',
            read: false,
            createdAt: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    // Remove client from tracking
    for (const [userId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// WebSocket handler for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Check if it's a WebSocket connection
  if (event.headers['upgrade'] !== 'websocket') {
    return {
      statusCode: 426,
      body: 'Upgrade Required',
      headers: {
        'Upgrade': 'WebSocket'
      }
    };
  }
  
  // For Netlify to handle WebSockets, we need to maintain the connection
  // This would work with Netlify's proper WebSocket support
  return {
    statusCode: 200,
    body: 'WebSocket Connected'
  };
};