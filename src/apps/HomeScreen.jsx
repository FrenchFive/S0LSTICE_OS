import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import {
  UserIcon,
  UsersIcon,
  BookIcon,
  IdCardIcon,
  PhoneIcon,
  ChartIcon,
  ChecklistIcon,
  MapIcon,
  BackpackIcon,
  SwordsIcon,
  PawIcon,
  WalletIcon,
  NotesIcon,
  SettingsIcon,
} from '../components/icons/Icons';
import './HomeScreen.css';

// App definitions with harmonious color assignments
const APPS = [
  { id: 'character', name: 'Character', icon: UserIcon, color: 'var(--app-color-1)' },
  { id: 'friends', name: 'Friends', icon: UsersIcon, color: 'var(--app-color-3)' },
  { id: 'codex', name: 'Codex', icon: BookIcon, color: 'var(--app-color-5)' },
  { id: 'id', name: 'ID Card', icon: IdCardIcon, color: 'var(--app-color-4)' },
  { id: 'contacts', name: 'Contacts', icon: PhoneIcon, color: 'var(--app-color-7)' },
  { id: 'stats', name: 'Stats', icon: ChartIcon, color: 'var(--app-color-2)' },
  { id: 'quest', name: 'Quests', icon: ChecklistIcon, color: 'var(--app-color-3)' },
  { id: 'map', name: 'Map', icon: MapIcon, color: 'var(--app-color-4)' },
  { id: 'inventory', name: 'Inventory', icon: BackpackIcon, color: 'var(--app-color-2)' },
  { id: 'combat', name: 'Combat', icon: SwordsIcon, color: 'var(--app-color-1)' },
  { id: 'pets', name: 'Pets', icon: PawIcon, color: 'var(--app-color-6)' },
  { id: 'bank', name: 'Bank', icon: WalletIcon, color: 'var(--app-color-3)' },
  { id: 'notes', name: 'Notes', icon: NotesIcon, color: 'var(--app-color-2)' },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, color: 'var(--app-color-8)' }
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
          {APPS.map(app => {
            const IconComponent = app.icon;
            return (
              <button
                key={app.id}
                className="app-icon"
                style={{ backgroundColor: app.color }}
                onClick={() => onAppOpen(app.id)}
              >
                <div className="app-icon-graphic">
                  <IconComponent size={32} />
                </div>
                <div className="app-icon-name">{app.name}</div>
              </button>
            );
          })}
        </div>

        {/* No Character Prompt */}
        {!character && (
          <div className="no-character-prompt">
            <div className="prompt-icon">
              <UserIcon size={64} />
            </div>
            <p>No character selected</p>
            <button 
              className="btn btn-primary"
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
