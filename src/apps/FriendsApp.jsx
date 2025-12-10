import { useState, useEffect } from 'react';
import { wsClient } from '../utils/websocket';
import { dmMode } from '../utils/database';
import './FriendsApp.css';

function FriendsApp() {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isDM, setIsDM] = useState(false);
  const [myPing, setMyPing] = useState(null);

  useEffect(() => {
    // Load DM mode
    setIsDM(dmMode.isDM());

    // Listen for user list updates
    const handleUserList = (users) => {
      setConnectedUsers(users || []);
    };

    const handleUserJoined = (data) => {
      setConnectedUsers(prev => [...prev, { id: data.clientId, character: null }]);
    };

    const handleUserLeft = (data) => {
      setConnectedUsers(prev => prev.filter(u => u.id !== data.clientId));
    };

    const handleUserUpdated = (data) => {
      setConnectedUsers(prev => 
        prev.map(u => u.id === data.clientId ? { ...u, character: data.character, isDM: data.isDM } : u)
      );
    };

    const handlePingUpdate = (ping) => {
      setMyPing(ping);
    };

    wsClient.on('user_list', handleUserList);
    wsClient.on('user_joined', handleUserJoined);
    wsClient.on('user_left', handleUserLeft);
    wsClient.on('user_updated', handleUserUpdated);
    wsClient.on('ping_update', handlePingUpdate);

    return () => {
      wsClient.off('user_list', handleUserList);
      wsClient.off('user_joined', handleUserJoined);
      wsClient.off('user_left', handleUserLeft);
      wsClient.off('user_updated', handleUserUpdated);
      wsClient.off('ping_update', handlePingUpdate);
    };
  }, []);

  const dmUsers = connectedUsers.filter(u => u.isDM);
  const playerUsers = connectedUsers.filter(u => !u.isDM);

  const getPingColor = (ping) => {
    if (!ping) return '#gray';
    if (ping < 50) return '#90EE90';
    if (ping < 150) return '#FFD700';
    return '#FF6B6B';
  };

  return (
    <div className="friends-app">
      <div className="friends-header">
        <h2>👥 Party & Friends</h2>
        {wsClient.isConnected() && myPing !== null && (
          <div className="my-ping">
            Ping: <span style={{ color: getPingColor(myPing) }}>{myPing}ms</span>
          </div>
        )}
      </div>

      {!wsClient.isConnected() && (
        <div className="offline-message">
          <p>🔌 Not connected to server</p>
          <p>Go to Settings to connect</p>
        </div>
      )}

      {wsClient.isConnected() && (
        <>
          {/* Dungeon Master Section */}
          {dmUsers.length > 0 && (
            <div className="friends-section">
              <h3>🎲 Dungeon Master</h3>
              <div className="friends-list">
                {dmUsers.map(user => (
                  <div key={user.id} className="friend-card dm-card">
                    <div className="friend-avatar">
                      <div className="avatar-icon">👑</div>
                      <div className="status-indicator online"></div>
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">
                        {user.character?.name || 'Dungeon Master'}
                      </div>
                      <div className="friend-role">DM • Level {user.character?.level || '?'}</div>
                    </div>
                    <div className="friend-ping">
                      🌐 <span style={{ color: getPingColor(user.ping) }}>Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Party Members Section */}
          <div className="friends-section">
            <h3>⚔️ Party Members</h3>
            {playerUsers.length === 0 ? (
              <div className="no-friends">
                <p>No party members online</p>
                <p>😢</p>
              </div>
            ) : (
              <div className="friends-list">
                {playerUsers.map(user => {
                  const isMe = user.id === wsClient.getClientId();
                  return (
                    <div key={user.id} className={`friend-card ${isMe ? 'me-card' : ''}`}>
                      <div className="friend-avatar">
                        <div className="avatar-icon">
                          {user.character?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="status-indicator online"></div>
                      </div>
                      <div className="friend-info">
                        <div className="friend-name">
                          {user.character?.name || 'Unknown Hunter'}
                          {isMe && ' (You)'}
                        </div>
                        <div className="friend-role">
                          Level {user.character?.level || '?'} Hunter
                        </div>
                      </div>
                      <div className="friend-ping">
                        🌐 <span style={{ color: getPingColor(user.ping) }}>
                          {user.ping ? `${user.ping}ms` : 'Connected'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="friends-stats">
            <div className="stat-card">
              <div className="stat-value">{connectedUsers.length}</div>
              <div className="stat-label">Total Online</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{playerUsers.length}</div>
              <div className="stat-label">Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dmUsers.length}</div>
              <div className="stat-label">DM</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FriendsApp;
