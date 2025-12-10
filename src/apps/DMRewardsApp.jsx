/**
 * DM Rewards App
 * Allows the DM to award XP to players in the game
 */
import { useState, useEffect } from 'react';
import './DMRewardsApp.css';
import { database as db, dmMode } from '../utils/database';
import { wsClient } from '../utils/websocket';
import {
  calculateLevel,
  getAvailableXP,
  XP_AWARDS,
  awardXP
} from '../utils/levelUp';
import { CrownIcon, StarIcon, UserIcon, CheckIcon, UsersIcon } from '../components/icons/Icons';

// Gift icon
const GiftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

// Sparkles icon
const SparklesIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
  </svg>
);

// Quick reward presets
const REWARD_PRESETS = [
  { id: 'session-base', amount: XP_AWARDS.sessionBase, label: 'Session Participation', description: 'Base XP for attending', icon: '🎮' },
  { id: 'session-good', amount: XP_AWARDS.sessionGood, label: 'Good Roleplay', description: 'Great character moments', icon: '🎭' },
  { id: 'session-great', amount: XP_AWARDS.sessionGreat, label: 'Outstanding Session', description: 'Exceptional play', icon: '⭐' },
  { id: 'ambition', amount: XP_AWARDS.achievedAmbition, label: 'Major Goal Achieved', description: 'Completed a character ambition', icon: '🏆' },
  { id: 'desire', amount: XP_AWARDS.achievedDesire, label: 'Minor Goal Achieved', description: 'Fulfilled a desire', icon: '✅' },
  { id: 'secret', amount: XP_AWARDS.learnedSecret, label: 'Discovered Secret', description: 'Learned important lore', icon: '🔍' },
  { id: 'danger', amount: XP_AWARDS.dangerSurvived, label: 'Survived Danger', description: 'Made it through peril', icon: '💀' },
  { id: 'sacrifice', amount: XP_AWARDS.heroicSacrifice, label: 'Heroic Sacrifice', description: 'Made a meaningful sacrifice', icon: '💔' },
];

/**
 * Player Card for XP rewards
 */
function PlayerRewardCard({ player, onAward, recentAward }) {
  const [customAmount, setCustomAmount] = useState(1);
  const [customReason, setCustomReason] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  const character = player.character;
  if (!character) return null;
  
  // Get character info - handle both old and new formats
  const name = character.identity?.name || character.name || 'Unknown';
  const image = character.identity?.portraitUrl || character.image;
  const xpInfo = character.experience ? {
    level: calculateLevel(character.experience.total || 0),
    available: getAvailableXP(character),
    total: character.experience.total || 0
  } : { level: { level: 1, title: 'Fledgling Hunter' }, available: 0, total: 0 };
  
  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
  };
  
  const handleAwardPreset = () => {
    if (selectedPreset) {
      onAward(player, selectedPreset.amount, selectedPreset.label);
      setSelectedPreset(null);
    }
  };
  
  const handleAwardCustom = () => {
    if (customAmount > 0) {
      onAward(player, customAmount, customReason || 'Custom reward');
      setCustomAmount(1);
      setCustomReason('');
      setShowCustom(false);
    }
  };
  
  return (
    <div className={`player-reward-card ${recentAward ? 'just-awarded' : ''}`}>
      <div className="player-info">
        <div className="player-avatar">
          {image ? (
            <img src={image} alt={name} />
          ) : (
            <span>{name[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        <div className="player-details">
          <h3 className="player-name">{name}</h3>
          <div className="player-stats">
            <span className="player-level">Lvl {xpInfo.level.level}</span>
            <span className="player-xp">{xpInfo.total} XP total</span>
          </div>
        </div>
        {recentAward && (
          <div className="award-notification">
            <SparklesIcon size={20} />
            <span>+{recentAward.amount} XP</span>
          </div>
        )}
      </div>
      
      {/* Quick Award Presets */}
      <div className="preset-grid">
        {REWARD_PRESETS.slice(0, 4).map(preset => (
          <button
            key={preset.id}
            className={`preset-btn ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
            onClick={() => handlePresetClick(preset)}
            title={preset.description}
          >
            <span className="preset-icon">{preset.icon}</span>
            <span className="preset-amount">+{preset.amount}</span>
          </button>
        ))}
      </div>
      
      {/* Selected Preset Confirmation */}
      {selectedPreset && (
        <div className="preset-confirm">
          <div className="preset-info">
            <span className="preset-label">{selectedPreset.label}</span>
            <span className="preset-desc">{selectedPreset.description}</span>
          </div>
          <button className="btn btn-success btn-sm" onClick={handleAwardPreset}>
            <GiftIcon size={14} /> Award +{selectedPreset.amount} XP
          </button>
        </div>
      )}
      
      {/* Custom Amount Toggle */}
      <div className="custom-section">
        {!showCustom ? (
          <button className="btn-custom-toggle" onClick={() => setShowCustom(true)}>
            Custom Amount...
          </button>
        ) : (
          <div className="custom-form">
            <input
              type="number"
              className="input input-sm"
              value={customAmount}
              onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="50"
              placeholder="XP"
            />
            <input
              type="text"
              className="input input-sm"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Reason (optional)"
            />
            <button className="btn btn-success btn-sm" onClick={handleAwardCustom}>
              <GiftIcon size={14} /> Award
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowCustom(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bulk Reward Section
 */
function BulkRewardSection({ players, onBulkAward }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  // Track which players have been deselected to maintain across player list changes
  const [deselectedPlayers, setDeselectedPlayers] = useState(new Set());
  const [customAmount, setCustomAmount] = useState(1);
  const [customReason, setCustomReason] = useState('');
  
  // Compute selected players based on deselected set
  const selectedPlayers = players.filter(p => !deselectedPlayers.has(p.id)).map(p => p.id);
  
  const togglePlayer = (playerId) => {
    setDeselectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };
  
  const selectAll = () => setDeselectedPlayers(new Set());
  const selectNone = () => setDeselectedPlayers(new Set(players.map(p => p.id)));
  
  const handleBulkAward = () => {
    if (selectedPreset && selectedPlayers.length > 0) {
      const selectedPlayerObjects = players.filter(p => selectedPlayers.includes(p.id));
      onBulkAward(selectedPlayerObjects, selectedPreset.amount, selectedPreset.label);
      setSelectedPreset(null);
    } else if (customAmount > 0 && selectedPlayers.length > 0) {
      const selectedPlayerObjects = players.filter(p => selectedPlayers.includes(p.id));
      onBulkAward(selectedPlayerObjects, customAmount, customReason || 'Group reward');
    }
  };
  
  return (
    <div className="bulk-reward-section">
      <h3><SparklesIcon size={20} /> Reward All Players</h3>
      
      {/* Player Selection */}
      <div className="player-selection">
        <div className="selection-header">
          <span>Select Players:</span>
          <div className="selection-actions">
            <button className="btn-link" onClick={selectAll}>All</button>
            <button className="btn-link" onClick={selectNone}>None</button>
          </div>
        </div>
        <div className="player-checkboxes">
          {players.map(player => {
            const name = player.character?.identity?.name || player.character?.name || 'Unknown';
            return (
              <label key={player.id} className="player-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.id)}
                  onChange={() => togglePlayer(player.id)}
                />
                <span>{name}</span>
              </label>
            );
          })}
        </div>
      </div>
      
      {/* Preset Buttons */}
      <div className="bulk-presets">
        {REWARD_PRESETS.map(preset => (
          <button
            key={preset.id}
            className={`bulk-preset-btn ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
            onClick={() => setSelectedPreset(preset)}
          >
            <span className="preset-icon">{preset.icon}</span>
            <span className="preset-label">{preset.label}</span>
            <span className="preset-amount">+{preset.amount} XP</span>
          </button>
        ))}
      </div>
      
      {/* Custom Bulk Award */}
      <div className="bulk-custom">
        <span className="custom-label">Or custom:</span>
        <input
          type="number"
          className="input input-sm"
          value={customAmount}
          onChange={(e) => { setCustomAmount(Math.max(1, parseInt(e.target.value) || 1)); setSelectedPreset(null); }}
          min="1"
          max="50"
        />
        <input
          type="text"
          className="input input-sm"
          value={customReason}
          onChange={(e) => { setCustomReason(e.target.value); setSelectedPreset(null); }}
          placeholder="Reason"
        />
      </div>
      
      {/* Award Button */}
      <button 
        className="btn btn-success btn-lg bulk-award-btn"
        onClick={handleBulkAward}
        disabled={selectedPlayers.length === 0 || (!selectedPreset && customAmount <= 0)}
      >
        <GiftIcon size={20} />
        Award {selectedPreset?.amount || customAmount} XP to {selectedPlayers.length} Player{selectedPlayers.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}

/**
 * Local Characters Section (for offline play)
 */
function LocalCharactersSection() {
  const [characters, setCharacters] = useState([]);
  const [recentAwards, setRecentAwards] = useState({});
  
  useEffect(() => {
    const allChars = db.getAllCharacters();
    setCharacters(allChars);
  }, []);
  
  const handleLocalAward = (character, amount, reason) => {
    // Award XP to local character
    const { character: updated } = awardXP(character, amount, reason);
    db.saveCharacter(updated);
    
    // Update local state
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
    
    // Show award notification
    setRecentAwards(prev => ({ ...prev, [character.id]: { amount, reason } }));
    setTimeout(() => {
      setRecentAwards(prev => {
        const { [character.id]: _, ...rest } = prev;
        return rest;
      });
    }, 3000);
  };
  
  if (characters.length === 0) {
    return (
      <div className="empty-state">
        <UserIcon size={48} />
        <p>No local characters found</p>
      </div>
    );
  }
  
  return (
    <div className="local-characters-section">
      <h3>Local Characters</h3>
      <p className="section-hint">Award XP to characters stored on this device</p>
      
      <div className="local-chars-grid">
        {characters.map(char => {
          const name = char.identity?.name || char.name || 'Unknown';
          const image = char.identity?.portraitUrl || char.image;
          const xpInfo = char.experience ? {
            level: calculateLevel(char.experience.total || 0),
            total: char.experience.total || 0
          } : { level: { level: 1 }, total: 0 };
          
          return (
            <div key={char.id} className={`local-char-card ${recentAwards[char.id] ? 'just-awarded' : ''}`}>
              <div className="char-avatar">
                {image ? <img src={image} alt={name} /> : <span>{name[0]}</span>}
              </div>
              <div className="char-info">
                <span className="char-name">{name}</span>
                <span className="char-level">Lvl {xpInfo.level.level} • {xpInfo.total} XP</span>
              </div>
              {recentAwards[char.id] && (
                <div className="award-flash">+{recentAwards[char.id].amount}</div>
              )}
              <div className="char-quick-awards">
                {[1, 2, 3, 5].map(amt => (
                  <button
                    key={amt}
                    className="btn btn-sm btn-outline"
                    onClick={() => handleLocalAward(char, amt, 'Session reward')}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main DM Rewards App
 */
export default function DMRewardsApp() {
  const [isDM, setIsDM] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [recentAwards, setRecentAwards] = useState({});
  const [awardLog, setAwardLog] = useState([]);
  const [activeTab, setActiveTab] = useState('online'); // online, local, log
  
  useEffect(() => {
    setIsDM(dmMode.isDM());
    
    // Listen for connected users
    const handleUserList = (users) => {
      // Filter out DM, only show players with characters
      setConnectedPlayers(users.filter(u => u.character && !u.isDM));
    };
    
    const handleUserJoined = (data) => {
      if (data.character && !data.isDM) {
        setConnectedPlayers(prev => [...prev.filter(p => p.id !== data.clientId), {
          id: data.clientId,
          character: data.character
        }]);
      }
    };
    
    const handleUserLeft = (data) => {
      setConnectedPlayers(prev => prev.filter(p => p.id !== data.clientId));
    };
    
    const handleCharacterUpdate = (data) => {
      setConnectedPlayers(prev => prev.map(p => 
        p.id === data.clientId ? { ...p, character: data.character } : p
      ));
    };
    
    wsClient.on('user_list', handleUserList);
    wsClient.on('user_joined', handleUserJoined);
    wsClient.on('user_left', handleUserLeft);
    wsClient.on('character_update', handleCharacterUpdate);
    
    return () => {
      wsClient.off('user_list', handleUserList);
      wsClient.off('user_joined', handleUserJoined);
      wsClient.off('user_left', handleUserLeft);
      wsClient.off('character_update', handleCharacterUpdate);
    };
  }, []);
  
  const handleAwardXP = (player, amount, reason) => {
    // Send XP award to player via WebSocket
    wsClient.awardXPToPlayer(player.id, amount, reason);
    
    // Show local notification
    setRecentAwards(prev => ({ ...prev, [player.id]: { amount, reason } }));
    setTimeout(() => {
      setRecentAwards(prev => {
        const { [player.id]: _, ...rest } = prev;
        return rest;
      });
    }, 3000);
    
    // Add to log
    const playerName = player.character?.identity?.name || player.character?.name || 'Unknown';
    setAwardLog(prev => [{
      id: Date.now(),
      player: playerName,
      amount,
      reason,
      timestamp: new Date()
    }, ...prev.slice(0, 49)]);
  };
  
  const handleBulkAward = (players, amount, reason) => {
    players.forEach(player => {
      handleAwardXP(player, amount, reason);
    });
  };
  
  // Check if user is DM
  if (!isDM) {
    return (
      <div className="dm-rewards-app not-dm">
        <div className="access-denied">
          <CrownIcon size={64} />
          <h2>DM Access Only</h2>
          <p>This section is only available to the Game Master.</p>
          <p className="hint">Enable DM Mode in Settings to access rewards.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dm-rewards-app">
      {/* Header */}
      <div className="rewards-header">
        <div className="header-title">
          <CrownIcon size={32} />
          <div>
            <h1>REWARDS</h1>
            <span className="header-subtitle">Award XP to your players</span>
          </div>
        </div>
        <div className="header-badge">
          <GiftIcon size={20} />
          <span>DM Panel</span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="rewards-tabs">
        <button 
          className={`rewards-tab ${activeTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveTab('online')}
        >
          <UsersIcon size={16} />
          Online Players ({connectedPlayers.length})
        </button>
        <button 
          className={`rewards-tab ${activeTab === 'local' ? 'active' : ''}`}
          onClick={() => setActiveTab('local')}
        >
          <UserIcon size={16} />
          Local Characters
        </button>
        <button 
          className={`rewards-tab ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          <CheckIcon size={16} />
          Award Log
        </button>
      </div>
      
      {/* Content */}
      <div className="rewards-content">
        {/* Online Players Tab */}
        {activeTab === 'online' && (
          <>
            {connectedPlayers.length === 0 ? (
              <div className="empty-state">
                <UsersIcon size={48} />
                <h3>No Players Online</h3>
                <p>Connect to a multiplayer server to award XP to online players.</p>
                <p className="hint">Players will appear here when they connect.</p>
              </div>
            ) : (
              <>
                {/* Bulk Rewards */}
                {connectedPlayers.length > 1 && (
                  <BulkRewardSection 
                    players={connectedPlayers}
                    onBulkAward={handleBulkAward}
                  />
                )}
                
                {/* Individual Player Cards */}
                <div className="players-section">
                  <h3>Individual Rewards</h3>
                  <div className="players-grid">
                    {connectedPlayers.map(player => (
                      <PlayerRewardCard
                        key={player.id}
                        player={player}
                        onAward={handleAwardXP}
                        recentAward={recentAwards[player.id]}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Local Characters Tab */}
        {activeTab === 'local' && (
          <LocalCharactersSection onAward={() => {}} />
        )}
        
        {/* Award Log Tab */}
        {activeTab === 'log' && (
          <div className="award-log-section">
            <h3>Recent Awards</h3>
            {awardLog.length === 0 ? (
              <div className="empty-state">
                <GiftIcon size={48} />
                <p>No awards given yet this session</p>
              </div>
            ) : (
              <div className="award-log">
                {awardLog.map(entry => (
                  <div key={entry.id} className="log-entry">
                    <div className="log-icon">
                      <SparklesIcon size={16} />
                    </div>
                    <div className="log-details">
                      <span className="log-player">{entry.player}</span>
                      <span className="log-reason">{entry.reason}</span>
                    </div>
                    <div className="log-amount">+{entry.amount} XP</div>
                    <div className="log-time">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
