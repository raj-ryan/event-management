import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { WebSocketServer, WebSocket } from 'ws';

// Store connected clients
const clients = new Map<number, WebSocket>();

// Session secret for secure communications (optional)
const SESSION_SECRET = process.env.SESSION_SECRET || 'eventzen-session-secret';

// Configure WebSocket server based on environment
const wsConfig = {
  clientTracking: true,
  noServer: true 
};

// For Docker deployment, we might need to specify the port
if (process.env.NODE_ENV === 'production' && process.env.WS_PORT) {
  const port = parseInt(process.env.WS_PORT);
  Object.assign(wsConfig, { port });
}

// Setup WebSocket server
const wss = new WebSocketServer(wsConfig);

// Setup ping interval to keep connections alive
const pingInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  });
}, 30000); // Send ping every 30 seconds

// Setup WebSocket events
wss.on('connection', (ws, request) => {
  console.log('Client connected to WebSocket');
  
  // Set up a ping timeout to detect dead connections
  let isAlive = true;
  ws.on('pong', () => {
    isAlive = true;
  });
  
  const pingTimer = setInterval(() => {
    if (!isAlive) {
      clearInterval(pingTimer);
      ws.terminate();
      return;
    }
    isAlive = false;
  }, 40000);
  
  // Listen for messages from the client
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      
      // Handle authentication message
      if (data.type === 'auth' && data.userId) {
        const userId = data.userId;
        clients.set(userId, ws);
        console.log(`User ${userId} authenticated on WebSocket (${process.env.NODE_ENV} mode)`);
        
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
        clearInterval(pingTimer);
        break;
      }
    }
  });
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing WebSocket server');
  clearInterval(pingInterval);
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

// Function to send notification to a specific user
export const sendNotificationToUser = (userId: number, notification: any) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'notification',
      data: notification
    }));
    return true;
  }
  return false;
};

// WebSocket handler for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Check if it's a health check
  if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/ws/health') {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: 'ok', 
        connections: wss.clients.size,
        environment: process.env.NODE_ENV || 'development'
      })
    };
  }
  
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