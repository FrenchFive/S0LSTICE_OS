/**
 * S0LSTICE_OS WebSocket Server
 * 
 * Real-time multiplayer server for the S0LSTICE_OS application.
 * Default port: 5055 (S0-55 for S0lstice)
 * 
 * Handles synchronization of:
 * - Dice rolls
 * - Combat encounters
 * - Codex/Bestiary pages
 * - Quest updates
 * - Map pins
 * - Messages between players and DM
 * - XP awards
 * - Character updates
 * 
 * Run with: node websocket-server.cjs
 * Or with PM2: pm2 start websocket-server.cjs --name s0lstice-ws
 */

const WebSocket = require('ws');
const http = require('http');

// Configuration
// Default port: 5055 (S0-55 for S0lstice)
const PORT = process.env.PORT || 5055;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const CLIENT_TIMEOUT = 35000; // 35 seconds

// Create HTTP server for health checks and API endpoints
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    const clients = Array.from(wss.clients).map(ws => {
      const info = clientsMap.get(ws);
      return info ? {
        id: info.id,
        character: info.character?.name || null,
        isDM: info.isDM,
        connectedAt: info.connectedAt
      } : null;
    }).filter(Boolean);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      connections: wss.clients.size,
      clients: clients,
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalConnections: stats.totalConnections,
      totalMessages: stats.totalMessages,
      totalDiceRolls: stats.totalDiceRolls,
      currentConnections: wss.clients.size,
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  // Verify origin in production
  verifyClient: (info, cb) => {
    // In production, you might want to verify the origin
    // const origin = info.origin;
    // if (allowedOrigins.includes(origin)) {
    //   cb(true);
    // } else {
    //   cb(false, 403, 'Forbidden');
    // }
    cb(true);
  }
});

// Store connected clients with their info
const clientsMap = new Map();

// Statistics tracking
const stats = {
  totalConnections: 0,
  totalMessages: 0,
  totalDiceRolls: 0
};

// Shared game state (optional - for persistent state during session)
const gameState = {
  currentEncounter: null,
  sharedNotes: [],
  initiativeOrder: []
};

// Heartbeat to detect disconnected clients
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    const client = clientsMap.get(ws);
    if (client && !client.isAlive) {
      console.log(`Client ${client.id} timed out, terminating...`);
      clientsMap.delete(ws);
      return ws.terminate();
    }
    
    if (client) {
      client.isAlive = false;
      ws.ping();
    }
  });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
  clearInterval(heartbeat);
});

wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  stats.totalConnections++;
  console.log(`[${new Date().toISOString()}] Client connected: ${clientId} from ${clientIp}`);
  
  const clientInfo = {
    id: clientId,
    ip: clientIp,
    character: null,
    isDM: false,
    isAlive: true,
    connectedAt: new Date().toISOString()
  };
  
  clientsMap.set(ws, clientInfo);

  // Handle pong responses for heartbeat
  ws.on('pong', () => {
    const client = clientsMap.get(ws);
    if (client) {
      client.isAlive = true;
    }
  });

  // Send welcome message with current state
  sendToClient(ws, {
    type: 'connected',
    clientId: clientId,
    connectedUsers: getConnectedUsers(),
    gameState: {
      hasActiveEncounter: !!gameState.currentEncounter
    }
  });

  // Broadcast new connection to all other clients
  broadcast({
    type: 'user_joined',
    clientId: clientId,
    timestamp: new Date().toISOString()
  }, ws);

  ws.on('message', (message) => {
    stats.totalMessages++;
    
    try {
      const data = JSON.parse(message.toString());
      handleMessage(ws, data);
    } catch (error) {
      console.error(`[${clientId}] Error parsing message:`, error.message);
      sendToClient(ws, { 
        type: 'error', 
        message: 'Invalid message format',
        code: 'PARSE_ERROR'
      });
    }
  });

  ws.on('close', (code, reason) => {
    const client = clientsMap.get(ws);
    console.log(`[${new Date().toISOString()}] Client disconnected: ${client?.id} (code: ${code})`);
    clientsMap.delete(ws);
    
    // Broadcast disconnect to all clients
    broadcast({
      type: 'user_left',
      clientId: client?.id,
      timestamp: new Date().toISOString()
    });
  });

  ws.on('error', (error) => {
    const client = clientsMap.get(ws);
    console.error(`[${client?.id}] WebSocket error:`, error.message);
  });
});

/**
 * Handle incoming messages based on type
 */
function handleMessage(ws, data) {
  const client = clientsMap.get(ws);
  
  if (!client) {
    console.error('Message from unknown client');
    return;
  }

  // Log message type (not content for privacy)
  console.log(`[${client.id}] Message: ${data.type}`);
  
  switch (data.type) {
    // ==========================================
    // CHARACTER & USER MANAGEMENT
    // ==========================================
    case 'set_character':
      client.character = data.character;
      broadcast({
        type: 'user_updated',
        clientId: client.id,
        character: data.character,
        isDM: client.isDM,
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'set_dm_mode':
      client.isDM = data.isDM;
      broadcast({
        type: 'user_updated',
        clientId: client.id,
        character: client.character,
        isDM: client.isDM,
        timestamp: new Date().toISOString()
      }, ws);
      console.log(`[${client.id}] DM mode: ${data.isDM}`);
      break;

    case 'get_users':
      sendToClient(ws, {
        type: 'user_list',
        users: getConnectedUsers()
      });
      break;

    // ==========================================
    // DICE ROLLING
    // ==========================================
    case 'dice_roll':
      stats.totalDiceRolls++;
      const rollData = {
        type: 'dice_roll',
        clientId: client.id,
        character: client.character,
        roll: data.roll,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to all (including sender for confirmation)
      broadcast(rollData);
      console.log(`[${client.id}] Dice roll: ${client.character?.name || 'Unknown'} - ${JSON.stringify(data.roll)}`);
      break;

    // ==========================================
    // CODEX & BESTIARY
    // ==========================================
    case 'codex_sync':
      broadcast({
        type: 'codex_sync',
        clientId: client.id,
        pages: data.pages,
        action: data.action || 'sync',
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'codex_update':
      broadcast({
        type: 'codex_sync',
        clientId: client.id,
        page: data.page,
        action: 'update',
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'bestiary_sync':
      broadcast({
        type: 'bestiary_sync',
        clientId: client.id,
        creatures: data.creatures,
        action: data.action || 'sync',
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'bestiary_update':
      broadcast({
        type: 'bestiary_sync',
        clientId: client.id,
        creature: data.creature,
        action: 'update',
        timestamp: new Date().toISOString()
      }, ws);
      break;

    // ==========================================
    // QUESTS
    // ==========================================
    case 'quest_sync':
    case 'quest_update':
      broadcast({
        type: 'quest_sync',
        clientId: client.id,
        quest: data.quest,
        action: data.action || 'update',
        timestamp: new Date().toISOString()
      });
      break;

    // ==========================================
    // MAP
    // ==========================================
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
        action: data.action || 'update',
        timestamp: new Date().toISOString()
      });
      break;

    case 'map_pin_add':
      broadcast({
        type: 'map_update',
        clientId: client.id,
        pin: data.pin,
        action: 'add',
        timestamp: new Date().toISOString()
      });
      break;

    case 'map_pin_remove':
      broadcast({
        type: 'map_update',
        clientId: client.id,
        pinId: data.pinId,
        action: 'remove',
        timestamp: new Date().toISOString()
      });
      break;

    // ==========================================
    // MESSAGING
    // ==========================================
    case 'message':
      const messagePayload = {
        type: 'message',
        clientId: client.id,
        from: client.character,
        message: data.message,
        timestamp: new Date().toISOString()
      };

      if (data.message?.toDM) {
        // Private message to DM only
        broadcastToDM(messagePayload);
      } else if (data.message?.toClientId) {
        // Private message to specific player
        sendToClientById(data.message.toClientId, messagePayload);
        // Also send to sender for confirmation
        sendToClient(ws, messagePayload);
      } else {
        // Broadcast to all
        broadcast(messagePayload);
      }
      break;

    case 'contact_sync':
      broadcast({
        type: 'contact_sync',
        clientId: client.id,
        contact: data.contact,
        action: data.action || 'sync',
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

    // ==========================================
    // COMBAT & ENCOUNTERS
    // ==========================================
    case 'combat_update':
      broadcast({
        type: 'combat_update',
        clientId: client.id,
        state: data.state,
        action: data.action || 'update',
        timestamp: new Date().toISOString()
      });
      break;

    case 'encounter_sync':
      // DM syncing encounter to all players
      if (client.isDM) {
        gameState.currentEncounter = data.encounter;
        broadcast({
          type: 'encounter_sync',
          clientId: client.id,
          encounter: data.encounter,
          action: data.action || 'update',
          timestamp: new Date().toISOString()
        });
        console.log(`[${client.id}] Encounter ${data.action}: ${data.encounter?.name || 'unnamed'}`);
      } else {
        sendToClient(ws, {
          type: 'error',
          message: 'Only DM can sync encounters',
          code: 'PERMISSION_DENIED'
        });
      }
      break;

    case 'initiative_update':
      if (client.isDM) {
        gameState.initiativeOrder = data.order;
        broadcast({
          type: 'initiative_update',
          clientId: client.id,
          order: data.order,
          currentTurn: data.currentTurn,
          timestamp: new Date().toISOString()
        });
      }
      break;

    // ==========================================
    // XP & REWARDS
    // ==========================================
    case 'xp_award':
      if (client.isDM && data.targetClientId) {
        sendToClientById(data.targetClientId, {
          type: 'xp_award',
          fromDM: client.character?.name || 'Game Master',
          amount: data.amount,
          reason: data.reason,
          timestamp: new Date().toISOString()
        });
        console.log(`[${client.id}] XP Award: ${data.amount} to ${data.targetClientId} - ${data.reason}`);
        
        // Also notify all players of the award (optional)
        if (data.announce) {
          broadcast({
            type: 'xp_announcement',
            targetClientId: data.targetClientId,
            amount: data.amount,
            reason: data.reason,
            timestamp: new Date().toISOString()
          });
        }
      } else if (!client.isDM) {
        sendToClient(ws, {
          type: 'error',
          message: 'Only DM can award XP',
          code: 'PERMISSION_DENIED'
        });
      }
      break;

    // ==========================================
    // NOTES & SHARED STATE
    // ==========================================
    case 'note_sync':
      broadcast({
        type: 'note_sync',
        clientId: client.id,
        note: data.note,
        action: data.action || 'update',
        timestamp: new Date().toISOString()
      }, ws);
      break;

    case 'shared_note':
      // DM sharing a note with all players
      if (client.isDM) {
        gameState.sharedNotes.push({
          ...data.note,
          timestamp: new Date().toISOString()
        });
        broadcast({
          type: 'shared_note',
          note: data.note,
          timestamp: new Date().toISOString()
        });
      }
      break;

    // ==========================================
    // UTILITY
    // ==========================================
    case 'ping':
      sendToClient(ws, { 
        type: 'pong', 
        timestamp: data.timestamp,
        serverTime: Date.now()
      });
      break;

    case 'get_game_state':
      sendToClient(ws, {
        type: 'game_state',
        encounter: gameState.currentEncounter,
        initiative: gameState.initiativeOrder,
        sharedNotes: gameState.sharedNotes
      });
      break;

    default:
      console.log(`[${client.id}] Unknown message type: ${data.type}`);
      sendToClient(ws, {
        type: 'error',
        message: `Unknown message type: ${data.type}`,
        code: 'UNKNOWN_TYPE'
      });
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Send a message to a specific WebSocket client
 */
function sendToClient(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Send a message to a client by their ID
 */
function sendToClientById(targetClientId, message) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((ws) => {
    const clientInfo = clientsMap.get(ws);
    if (clientInfo && clientInfo.id === targetClientId && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Broadcast a message to all connected clients
 * @param {Object} message - The message to broadcast
 * @param {WebSocket} excludeWs - Optional WebSocket to exclude from broadcast
 */
function broadcast(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Broadcast a message to all DM clients
 */
function broadcastToDM(message) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((ws) => {
    const clientInfo = clientsMap.get(ws);
    if (clientInfo && clientInfo.isDM && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Broadcast a message to all player (non-DM) clients
 */
function broadcastToPlayers(message) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((ws) => {
    const clientInfo = clientsMap.get(ws);
    if (clientInfo && !clientInfo.isDM && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Get list of connected users
 */
function getConnectedUsers() {
  return Array.from(clientsMap.values()).map(c => ({
    id: c.id,
    character: c.character,
    isDM: c.isDM,
    connectedAt: c.connectedAt
  }));
}

/**
 * Generate a unique client ID
 */
function generateClientId() {
  return 'client_' + Math.random().toString(36).substring(2, 11) + 
         '_' + Date.now().toString(36);
}

// ==========================================
// SERVER STARTUP
// ==========================================

server.listen(PORT, '0.0.0.0', () => {
console.log('============================================');
console.log('  S0LSTICE_OS WebSocket Server');
console.log('============================================');
  console.log(`  Status:     Running`);
  console.log(`  Port:       ${PORT}`);
  console.log(`  Health:     http://localhost:${PORT}/health`);
  console.log(`  Stats:      http://localhost:${PORT}/stats`);
  console.log(`  WebSocket:  ws://localhost:${PORT}/ws`);
  console.log('============================================');
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log('============================================');
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Notify all clients
  broadcast({
    type: 'server_shutdown',
    message: 'Server is shutting down',
    timestamp: new Date().toISOString()
  });

  // Close all connections
  wss.clients.forEach((ws) => {
    ws.close(1001, 'Server shutting down');
  });

  // Close the server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.log('Forcing shutdown...');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - try to keep running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
