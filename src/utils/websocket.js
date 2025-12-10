// WebSocket client for multiplayer functionality

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.serverUrl = '';
    this.connected = false;
    this.clientId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.ping = null;
    this.pingInterval = null;
    this.isDM = false;
    this.connectedUsers = [];
  }

  connect(serverUrl, character) {
    if (this.ws) {
      this.disconnect();
    }

    this.serverUrl = serverUrl;
    
    try {
      this.ws = new WebSocket(serverUrl);
      
      this.ws.onopen = () => {
        console.log('Connected to server');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Set character info
        if (character) {
          this.setCharacter(character);
        }
        
        // Start ping monitoring
        this.startPing();
        
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from server');
        this.connected = false;
        this.emit('disconnected');
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          setTimeout(() => {
            this.connect(this.serverUrl, null);
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error('Error connecting to server:', error);
      this.emit('error', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
      this.stopPing();
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.clientId = null;
    }
  }

  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.connected) {
        const startTime = Date.now();
        this.send({ type: 'ping', timestamp: startTime });
        this.lastPingTime = startTime;
      }
    }, 5000); // Ping every 5 seconds
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  getPing() {
    return this.ping;
  }

  handleMessage(data) {
    switch (data.type) {
      case 'connected':
        this.clientId = data.clientId;
        this.emit('user_list', data.connectedUsers);
        break;
      
      case 'user_joined':
        this.emit('user_joined', data);
        break;
      
      case 'user_left':
        this.emit('user_left', data);
        break;
      
      case 'user_updated':
        this.emit('user_updated', data);
        break;
      
      case 'dice_roll':
        this.emit('dice_roll', data);
        break;
      
      case 'pong':
        if (this.lastPingTime) {
          this.ping = Date.now() - this.lastPingTime;
          this.emit('ping_update', this.ping);
        }
        this.emit('pong');
        break;
      
      case 'codex_update':
        this.emit('codex_update', data);
        break;
      
      case 'bestiary_update':
        this.emit('bestiary_update', data);
        break;
      
      case 'quest_update':
        this.emit('quest_update', data);
        break;
      
      case 'map_update':
        this.emit('map_update', data);
        break;
      
      case 'message':
        this.emit('message', data);
        break;
      
      case 'combat_update':
        this.emit('combat_update', data);
        break;
      
      case 'xp_award':
        // Player received XP from DM
        this.emit('xp_award', data);
        break;
      
      case 'encounter_sync':
        // DM synced encounter state
        this.emit('encounter_sync', data);
        break;
      
      case 'error':
        console.error('Server error:', data.message);
        this.emit('server_error', data);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  setCharacter(character) {
    if (!this.connected) return;
    
    this.send({
      type: 'set_character',
      character: {
        name: character.name,
        level: character.level,
        image: null, // Don't send image to reduce bandwidth
        isDM: this.isDM
      }
    });
  }

  setDMMode(isDM) {
    this.isDM = isDM;
    if (this.connected) {
      this.send({
        type: 'set_dm_mode',
        isDM: isDM
      });
    }
  }

  sendDiceRoll(roll) {
    if (!this.connected) return;
    
    this.send({
      type: 'dice_roll',
      roll: roll
    });
  }

  // Sync codex pages
  syncCodex(pages) {
    if (!this.connected) return;
    this.send({ type: 'codex_sync', pages });
  }

  // Sync bestiary entries
  syncBestiary(creatures) {
    if (!this.connected) return;
    this.send({ type: 'bestiary_sync', creatures });
  }

  // Sync quest
  syncQuest(quest, action = 'update') {
    if (!this.connected) return;
    this.send({ type: 'quest_sync', quest, action });
  }

  // Sync map pins
  syncMap(pins) {
    if (!this.connected) return;
    this.send({ type: 'map_sync', pins });
  }

  // Send message to NPC (goes to DM)
  sendMessage(message) {
    if (!this.connected) return;
    this.send({ type: 'message', message });
  }

  // Sync contact
  syncContact(contact) {
    if (!this.connected) return;
    this.send({ type: 'contact_sync', contact });
  }

  // Sync message
  syncMessage(message) {
    if (!this.connected) return;
    this.send({ type: 'message_sync', message });
  }

  // Sync combat state
  syncCombat(state) {
    if (!this.connected) return;
    this.send({ type: 'combat_update', state });
  }

  // Award XP to a specific player (DM only)
  awardXPToPlayer(targetClientId, amount, reason) {
    if (!this.connected || !this.isDM) return;
    this.send({
      type: 'xp_award',
      targetClientId,
      amount,
      reason
    });
  }

  // Sync encounter to all players (DM only)
  syncEncounter(encounter, action = 'update') {
    if (!this.connected || !this.isDM) return;
    this.send({
      type: 'encounter_sync',
      encounter,
      action
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  isConnected() {
    return this.connected;
  }

  getClientId() {
    return this.clientId;
  }

  getConnectedUsers() {
    return this.connectedUsers;
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
