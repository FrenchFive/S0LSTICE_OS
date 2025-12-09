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
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.clientId = null;
    }
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
        this.emit('pong');
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
        image: null // Don't send image to reduce bandwidth
      }
    });
  }

  sendDiceRoll(roll) {
    if (!this.connected) return;
    
    this.send({
      type: 'dice_roll',
      roll: roll
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
}

// Export singleton instance
export const wsClient = new WebSocketClient();
