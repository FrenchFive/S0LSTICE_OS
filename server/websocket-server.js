// WebSocket server for Hunters RPG multiplayer dice rolling
// Run with: node websocket-server.js

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', connections: wss.clients.size }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Store connected clients with their info
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  const clientIp = req.socket.remoteAddress;
  
  console.log(`Client connected: ${clientId} from ${clientIp}`);
  
  clients.set(ws, {
    id: clientId,
    ip: clientIp,
    character: null,
    isDM: false,
    ping: null,
    connectedAt: new Date()
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId: clientId,
    connectedUsers: Array.from(clients.values()).map(c => ({
      id: c.id,
      character: c.character
    }))
  }));

  // Broadcast new connection to all clients
  broadcast({
    type: 'user_joined',
    clientId: clientId
  }, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    console.log(`Client disconnected: ${client?.id}`);
    clients.delete(ws);
    
    // Broadcast disconnect to all clients
    broadcast({
      type: 'user_left',
      clientId: client?.id
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(ws, data) {
  const client = clients.get(ws);
  
  switch (data.type) {
    case 'set_character':
      client.character = data.character;
      broadcast({
        type: 'user_updated',
        clientId: client.id,
        character: data.character
      }, ws);
      break;

    case 'dice_roll':
      // Broadcast dice roll to all connected clients
      broadcast({
        type: 'dice_roll',
        clientId: client.id,
        character: client.character,
        roll: data.roll,
        timestamp: new Date().toISOString()
      });
      console.log(`Dice roll from ${client.character?.name || client.id}:`, data.roll);
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: data.timestamp }));
      break;

    case 'set_dm_mode':
      client.isDM = data.isDM;
      broadcast({
        type: 'user_updated',
        clientId: client.id,
        character: client.character,
        isDM: client.isDM
      }, ws);
      break;

    case 'codex_sync':
      broadcast({
        type: 'codex_sync',
        clientId: client.id,
        pages: data.pages,
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'bestiary_sync':
      broadcast({
        type: 'bestiary_sync',
        clientId: client.id,
        creatures: data.creatures,
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'quest_update':
    case 'quest_sync':
      broadcast({
        type: 'quest_sync',
        clientId: client.id,
        quest: data.quest,
        action: data.action || 'update',
        timestamp: new Date().toISOString()
      });
      break;

    case 'map_sync':
      broadcast({
        type: 'map_sync',
        clientId: client.id,
        pins: data.pins,
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'map_update':
      broadcast({
        type: 'map_update',
        clientId: client.id,
        pin: data.pin,
        timestamp: new Date().toISOString()
      });
      break;

    case 'message':
      // Send message to DM or specific player
      if (data.message.toDM) {
        broadcastToDM({
          type: 'message',
          from: client.character,
          message: data.message,
          timestamp: new Date().toISOString()
        });
      } else {
        broadcast({
          type: 'message',
          from: client.character,
          message: data.message,
          timestamp: new Date().toISOString()
        });
      }
      break;

    case 'contact_sync':
      broadcast({
        type: 'contact_sync',
        clientId: client.id,
        contact: data.contact,
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'message_sync':
      broadcast({
        type: 'message_sync',
        clientId: client.id,
        message: data.message,
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'combat_update':
      broadcast({
        type: 'combat_update',
        clientId: client.id,
        state: data.state,
        timestamp: new Date().toISOString()
      });
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
}

function broadcast(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function broadcastToDM(message) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((client) => {
    const clientInfo = clients.get(client);
    if (clientInfo && clientInfo.isDM && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function generateClientId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
