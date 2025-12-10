/**
 * Server Configuration for S0LSTICE_OS
 * 
 * Default port: 5055 (S0-55 for S0lstice)
 * This port is not commonly used by other services
 */

export const SERVER_CONFIG = {
  // Default WebSocket port - "5055" represents "S0-55" (S0lstice)
  DEFAULT_PORT: 5055,
  
  // Default WebSocket path
  WS_PATH: '/ws',
  
  // Health check path
  HEALTH_PATH: '/health',
  
  // Get default local WebSocket URL
  getLocalUrl() {
    return `ws://localhost:${this.DEFAULT_PORT}${this.WS_PATH}`;
  },
  
  // Get default secure WebSocket URL for a domain
  getSecureUrl(domain) {
    return `wss://${domain}${this.WS_PATH}`;
  },
  
  // Get default insecure WebSocket URL for an IP
  getInsecureUrl(host) {
    return `ws://${host}:${this.DEFAULT_PORT}${this.WS_PATH}`;
  },
  
  // Validate a WebSocket URL
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
      return false;
    }
  }
};

export default SERVER_CONFIG;
