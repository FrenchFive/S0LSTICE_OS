import { useState, useEffect } from 'react';
import { database, dmMode } from '../utils/database';
import { wsClient } from '../utils/websocket';
import { SERVER_CONFIG } from '../utils/serverConfig';
import {
  SettingsIcon,
  WifiIcon,
  UsersIcon,
  ArrowLeftIcon,
  CrownIcon,
} from '../components/icons/Icons';
import './Settings.css';

// Download icon component
const DownloadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Refresh icon component
const RefreshIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// User icon component
const UserSwitchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

// Trash icon component
const TrashIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Log out icon component
const LogOutIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

function Settings({ currentCharacter, onClose, onSwitchCharacter, onClearCharacter, onDeleteCharacter }) {
  // Initialize server URL from localStorage
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('server_url') || '');
  // Initialize connection status from wsClient
  const [isConnected, setIsConnected] = useState(() => wsClient.isConnected());
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  // DM Mode state - initialize from localStorage
  const [isDM, setIsDM] = useState(() => dmMode.isDM());
  
  // Update states
  const [appVersion, setAppVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, not-available, downloading, downloaded, error
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

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
      
      // Get app version
      window.electronAPI.getAppVersion().then(version => {
        setAppVersion(version);
      });
      
      // Listen for update status events
      const cleanup = window.electronAPI.onUpdateStatus((data) => {
        setUpdateStatus(data.status);
        setUpdateMessage(data.message);
        
        if (data.status === 'available' || data.status === 'not-available' || data.status === 'downloaded') {
          setUpdateInfo(data);
        }
        
        if (data.status === 'downloading' && data.percent !== undefined) {
          setDownloadProgress(data.percent);
        }
      });
      
      return () => {
        if (cleanup) cleanup();
      };
    }
    // Web version localStorage URL is already initialized in useState
    // Connection status is already initialized in useState

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

  // Update handlers
  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    
    setUpdateStatus('checking');
    setUpdateMessage('Checking for updates...');
    
    const result = await window.electronAPI.checkForUpdates();
    
    if (!result.success) {
      if (result.isDev) {
        setUpdateStatus('error');
        setUpdateMessage('Updates are only available in the installed app');
      } else {
        setUpdateStatus('error');
        setUpdateMessage(result.error || 'Failed to check for updates');
      }
    }
  };

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI) return;
    
    setUpdateStatus('downloading');
    setDownloadProgress(0);
    
    const result = await window.electronAPI.downloadUpdate();
    
    if (!result.success) {
      setUpdateStatus('error');
      setUpdateMessage(result.error || 'Failed to download update');
    }
  };

  const handleInstallUpdate = async () => {
    if (!window.electronAPI) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      'The app will close and restart to install the update. Continue?'
    );
    
    if (confirmed) {
      await window.electronAPI.installUpdate();
    }
  };

  const handleToggleDMMode = () => {
    const newValue = !isDM;
    dmMode.setDM(newValue);
    setIsDM(newValue);
    // Update WebSocket connection with DM status
    wsClient.setDMMode(newValue);
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

  const getUpdateStatusColor = () => {
    switch (updateStatus) {
      case 'available':
      case 'downloaded':
        return 'var(--color-success-light)';
      case 'error':
        return 'var(--color-danger-light)';
      case 'downloading':
        return 'var(--color-info-light)';
      default:
        return 'var(--color-bg-sunken)';
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1><SettingsIcon size={32} /> Settings</h1>
        <button className="btn btn-secondary" onClick={onClose}>
          <ArrowLeftIcon size={16} /> Back
        </button>
      </div>

      <div className="settings-content">
        {/* App Updates - Only show in Electron */}
        {window.electronAPI && (
          <div className="card card-static">
            <div className="card-header"><DownloadIcon size={24} /> App Updates</div>
            
            <div className="update-section">
              <div className="update-info">
                <p><strong>Current Version:</strong> {appVersion || 'Loading...'}</p>
                
                {updateStatus !== 'idle' && (
                  <div 
                    className="update-status-box"
                    style={{ backgroundColor: getUpdateStatusColor() }}
                  >
                    <p className="update-message">{updateMessage}</p>
                    
                    {updateStatus === 'downloading' && (
                      <div className="download-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                        <span className="progress-text">{Math.round(downloadProgress)}%</span>
                      </div>
                    )}
                    
                    {updateInfo?.version && updateStatus === 'available' && (
                      <p className="update-version">New version: {updateInfo.version}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="update-actions">
                {(updateStatus === 'idle' || updateStatus === 'not-available' || updateStatus === 'error') && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCheckForUpdates}
                  >
                    <RefreshIcon size={16} /> Check for Updates
                  </button>
                )}
                
                {updateStatus === 'checking' && (
                  <button className="btn btn-outline" disabled>
                    <span className="spinner" /> Checking...
                  </button>
                )}
                
                {updateStatus === 'available' && (
                  <button 
                    className="btn btn-success" 
                    onClick={handleDownloadUpdate}
                  >
                    <DownloadIcon size={16} /> Download Update
                  </button>
                )}
                
                {updateStatus === 'downloading' && (
                  <button className="btn btn-outline" disabled>
                    Downloading...
                  </button>
                )}
                
                {updateStatus === 'downloaded' && (
                  <button 
                    className="btn btn-success" 
                    onClick={handleInstallUpdate}
                  >
                    Install & Restart
                  </button>
                )}
              </div>
            </div>
            
            <p className="help-text">
              Updates are downloaded from GitHub releases automatically.
            </p>
          </div>
        )}

        {/* Character Management */}
        <div className="card card-static">
          <div className="card-header"><UserSwitchIcon size={24} /> Character</div>
          
          {currentCharacter ? (
            <div className="current-character-info">
              <div className="character-preview">
                <div className="character-preview-avatar">
                  {currentCharacter.image ? (
                    <img src={currentCharacter.image} alt={currentCharacter.name} />
                  ) : (
                    <span>{currentCharacter.name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="character-preview-info">
                  <h4>{currentCharacter.name}</h4>
                  <p>Level {currentCharacter.level} Hunter</p>
                </div>
              </div>
              
              <div className="character-actions">
                {onSwitchCharacter && (
                  <button className="btn btn-outline" onClick={onSwitchCharacter}>
                    <UserSwitchIcon size={16} /> Switch Character
                  </button>
                )}
                
                {onClearCharacter && (
                  <button className="btn btn-secondary" onClick={onClearCharacter}>
                    <LogOutIcon size={16} /> Clear / Change Character
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="help-text">No character selected</p>
          )}
        </div>

        {/* Danger Zone - Delete Character */}
        {currentCharacter && onDeleteCharacter && (
          <div className="card card-static card-danger">
            <div className="card-header"><TrashIcon size={24} /> Danger Zone</div>
            
            <div className="danger-zone-content">
              <p className="danger-warning">
                Permanently delete your character. This action cannot be undone.
              </p>
              
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  const confirmed = window.confirm(
                    `Are you sure you want to delete "${currentCharacter.name}"? This cannot be undone!`
                  );
                  if (confirmed) {
                    const doubleConfirm = window.confirm(
                      `This is your LAST CHANCE. "${currentCharacter.name}" will be permanently deleted. Continue?`
                    );
                    if (doubleConfirm) {
                      onDeleteCharacter(currentCharacter.id);
                    }
                  }
                }}
              >
                <TrashIcon size={16} /> Delete Character
              </button>
            </div>
          </div>
        )}

        {/* DM Mode */}
        <div className="card card-static dm-mode-card">
          <div className="card-header"><CrownIcon size={24} /> Game Master Mode</div>
          
          <div className="dm-mode-section">
            <div className="dm-mode-info">
              <p className="dm-mode-description">
                Enable DM Mode to access the <strong>Rewards</strong> panel and award XP to players.
              </p>
              {isDM && (
                <div className="dm-mode-badge">
                  <CrownIcon size={16} />
                  <span>DM Mode Active</span>
                </div>
              )}
            </div>
            
            <div className="dm-mode-toggle">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isDM} 
                  onChange={handleToggleDMMode}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">{isDM ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          
          <p className="help-text">
            Only one person should have DM Mode enabled per game session.
          </p>
        </div>

        {/* Server Connection */}
        <div className="card card-static">
          <div className="card-header"><WifiIcon size={24} /> Multiplayer Server</div>
          
          <div className="form-group">
            <label>Server URL (WebSocket)</label>
            <input
              type="text"
              className="input"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder={SERVER_CONFIG.getLocalUrl()}
              disabled={isConnected}
            />
            <p className="help-text">
              Local: {SERVER_CONFIG.getLocalUrl()} • Remote: wss://your-server.com/ws
            </p>
          </div>

          <div className="connection-actions">
            {!isConnected ? (
              <button className="btn btn-success" onClick={handleConnect}>
                Connect to Server
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleDisconnect}>
                Disconnect
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
              <h4><UsersIcon size={18} /> Connected Players:</h4>
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
        <div className="card card-static">
          <div className="card-header">Import / Export Characters</div>
          
          <div className="import-export-actions">
            <button className="btn btn-primary" onClick={handleImportCharacter}>
              Import Character(s)
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={handleExportCharacter}
              disabled={!currentCharacter}
            >
              Export Current Character
            </button>
            
            <button className="btn btn-outline" onClick={handleExportAllCharacters}>
              Export All Characters
            </button>
          </div>

          <p className="help-text">
            Import and export characters as JSON files to backup or share with others.
          </p>
        </div>

        {/* About */}
        <div className="card card-static">
          <div className="card-header">About</div>
          <p><strong>S0LSTICE_OS</strong> - Your Hunter&apos;s Digital Companion</p>
          <p>Version: {appVersion || '1.0.0'}</p>
          {window.electronAPI && (
            <p>Platform: {window.electronAPI.platform}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
