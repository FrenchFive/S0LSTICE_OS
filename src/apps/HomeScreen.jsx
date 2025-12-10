import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import './HomeScreen.css';

const APPS = [
  { id: 'character', name: 'Character', icon: '👤', color: '#FFB3BA' },
  { id: 'friends', name: 'Friends', icon: '👥', color: '#BAFFC9' },
  { id: 'codex', name: 'Codex', icon: '📖', color: '#D4BAFF' },
  { id: 'id', name: 'ID Card', icon: '🪪', color: '#BAE1FF' },
  { id: 'contacts', name: 'Contacts', icon: '📞', color: '#C9E4DE' },
  { id: 'stats', name: 'Stats', icon: '📊', color: '#E0BBE4' },
  { id: 'quest', name: 'Quests', icon: '✅', color: '#FFFFBA' },
  { id: 'map', name: 'Map', icon: '🗺️', color: '#FFB3E6' },
  { id: 'inventory', name: 'Inventory', icon: '🎒', color: '#FFDFBA' },
  { id: 'combat', name: 'Combat', icon: '⚔️', color: '#FF9AA2' },
  { id: 'pets', name: 'Pets', icon: '🐾', color: '#A2D5F2' },
  { id: 'bank', name: 'Bank', icon: '💰', color: '#BAE1FF' },
  { id: 'notes', name: 'Notes', icon: '📝', color: '#FFFFBA' },
  { id: 'settings', name: 'Settings', icon: '⚙️', color: '#D4BAFF' }
];

function HomeScreen({ onAppOpen }) {
  const [character, setCharacter] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const char = database.getCurrentCharacter();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCharacter(char);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="home-screen">
      {/* Wallpaper/Background */}
      <div className="home-wallpaper">
        {/* Character Widget */}
        {character && (
          <div className="character-widget">
            <div className="widget-avatar">
              {character.image ? (
                <img src={character.image} alt={character.name} />
              ) : (
                <div className="widget-avatar-placeholder">
                  {character.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="widget-info">
              <div className="widget-greeting">{greeting},</div>
              <div className="widget-name">{character.name}</div>
              <div className="widget-level">Level {character.level} Hunter</div>
            </div>
          </div>
        )}

        {/* App Grid */}
        <div className="app-grid">
          {APPS.map(app => (
            <button
              key={app.id}
              className="app-icon"
              style={{ backgroundColor: app.color }}
              onClick={() => onAppOpen(app.id)}
            >
              <div className="app-icon-emoji">{app.icon}</div>
              <div className="app-icon-name">{app.name}</div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        {!character && (
          <div className="no-character-prompt">
            <div className="prompt-icon">👤</div>
            <p>No character selected</p>
            <button 
              className="btn btn-success"
              onClick={() => onAppOpen('character')}
            >
              Select Character
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
