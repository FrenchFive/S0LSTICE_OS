import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import { wsClient } from '../utils/websocket';
import './Settings.css';

function Settings({ currentCharacter, onClose }) {
  const [serverUrl, setServerUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);

  const handleConnected = () => {
    setIsConnected(true);
    setConnectionStatus('Connected successfully!');
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setConnectionStatus('Disconnected from server');
    setConnectedUsers([]);
  };

  const handleUserList = (users) => {
    setConnectedUsers(users.filter(u => u.character));
  };

  const handleUserJoined = (data) => {
    setConnectionStatus(`${data.character?.name || 'User'} joined`);
  };

  const handleUserLeft = (data) => {
    setConnectionStatus(`User left`);
    setConnectedUsers(prev => prev.filter(u => u.id !== data.clientId));
  };

  const handleError = (error) => {
    setConnectionStatus(`Error: ${error.message || 'Connection failed'}`);
  };

  useEffect(() => {
    // Load server config (check if running in Electron)
    if (window.electronAPI) {
      window.electronAPI.getServerConfig().then(config => {
        if (config.serverIp) {
          setServerUrl(config.serverIp);
        }
      });
    } else {
      // Web version - use localStorage
      const savedUrl = localStorage.getItem('server_url');
      if (savedUrl) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setServerUrl(savedUrl);
      }
    }

    // Check if already connected
    setIsConnected(wsClient.isConnected());

    // Set up WebSocket event listeners
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);
    wsClient.on('user_list', handleUserList);
    wsClient.on('user_joined', handleUserJoined);
    wsClient.on('user_left', handleUserLeft);
    wsClient.on('error', handleError);

    return () => {
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
      wsClient.off('user_list', handleUserList);
      wsClient.off('user_joined', handleUserJoined);
      wsClient.off('user_left', handleUserLeft);
      wsClient.off('error', handleError);
    };
  }, []);

  const handleConnect = () => {
    if (!serverUrl) {
      setConnectionStatus('Please enter a server URL');
      return;
    }

    setConnectionStatus('Connecting...');
    
    // Save server URL
    if (window.electronAPI) {
      window.electronAPI.setServerConfig({ serverIp: serverUrl });
    } else {
      localStorage.setItem('server_url', serverUrl);
    }

    // Connect to server
    wsClient.connect(serverUrl, currentCharacter);
  };

  const handleDisconnect = () => {
    wsClient.disconnect();
  };

  const handleExportCharacter = async () => {
    if (!currentCharacter) {
      alert('No character selected');
      return;
    }

    const data = JSON.stringify(currentCharacter, null, 2);
    const filename = `${currentCharacter.name.replace(/\s+/g, '_')}.json`;

    if (window.electronAPI) {
      // Electron version - use native file dialog
      const result = await window.electronAPI.saveFile(data, filename);
      if (result.success) {
        alert('Character exported successfully!');
      } else if (!result.canceled) {
        alert(`Export failed: ${result.error}`);
      }
    } else {
      // Web version - download as file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleExportAllCharacters = async () => {
    const characters = database.getAllCharacters();
    if (characters.length === 0) {
      alert('No characters to export');
      return;
    }

    const data = JSON.stringify(characters, null, 2);
    const filename = 'all_characters.json';

    if (window.electronAPI) {
      const result = await window.electronAPI.saveFile(data, filename);
      if (result.success) {
        alert('All characters exported successfully!');
      } else if (!result.canceled) {
        alert(`Export failed: ${result.error}`);
      }
    } else {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportCharacter = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile();
      if (result.success) {
        try {
          const character = JSON.parse(result.data);
          if (Array.isArray(character)) {
            // Import multiple characters
            character.forEach(char => {
              database.saveCharacter(char);
            });
            alert(`Imported ${character.length} character(s) successfully!`);
          } else {
            // Import single character
            database.saveCharacter(character);
            alert('Character imported successfully!');
          }
        } catch (error) {
          alert(`Import failed: ${error.message}`);
        }
      }
    } else {
      // Web version - use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const text = await file.text();
            const character = JSON.parse(text);
            if (Array.isArray(character)) {
              character.forEach(char => {
                database.saveCharacter(char);
              });
              alert(`Imported ${character.length} character(s) successfully!`);
            } else {
              database.saveCharacter(character);
              alert('Character imported successfully!');
            }
          } catch (error) {
            alert(`Import failed: ${error.message}`);
          }
        }
      };
      input.click();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <button className="btn btn-secondary" onClick={onClose}>
          ← Back
        </button>
      </div>

      <div className="settings-content">
        {/* Server Connection */}
        <div className="card">
          <div className="card-header">🌐 Multiplayer Server</div>
          
          <div className="form-group">
            <label>Server URL (WebSocket)</label>
            <input
              type="text"
              className="input"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="wss://your-server.com/ws"
              disabled={isConnected}
            />
            <p className="help-text">
              Example: wss://example.com/ws or ws://localhost:8080/ws
            </p>
          </div>

          <div className="connection-actions">
            {!isConnected ? (
              <button className="btn btn-success" onClick={handleConnect}>
                🔌 Connect to Server
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleDisconnect}>
                🔌 Disconnect
              </button>
            )}
          </div>

          {connectionStatus && (
            <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
              {connectionStatus}
            </div>
          )}

          {isConnected && connectedUsers.length > 0 && (
            <div className="connected-users">
              <h4>🎮 Connected Players:</h4>
              <ul>
                {connectedUsers.map(user => (
                  <li key={user.id}>
                    {user.character?.name || 'Unknown'} (Level {user.character?.level || '?'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div className="card">
          <div className="card-header">📦 Import / Export Characters</div>
          
          <div className="import-export-actions">
            <button className="btn btn-primary" onClick={handleImportCharacter}>
              📥 Import Character(s)
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={handleExportCharacter}
              disabled={!currentCharacter}
            >
              📤 Export Current Character
            </button>
            
            <button className="btn btn-accent" onClick={handleExportAllCharacters}>
              📤 Export All Characters
            </button>
          </div>

          <p className="help-text">
            Import and export characters as JSON files to backup or share with others.
          </p>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-header">ℹ️ About</div>
          <p><strong>Hunters RPG</strong> - Character Management App</p>
          <p>Version: 1.0.0</p>
          {window.electronAPI && (
            <p>Platform: {window.electronAPI.platform}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
