import { useState } from 'react';
import { database, dmMode } from '../utils/database';
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
  CrownIcon,
  ActivityIcon,
  AnchorIcon,
  ScrollIcon,
  DiceIcon,
  GlobeIcon,
  ShieldIcon,
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
  { id: 'conditions', name: 'Conditions', icon: ActivityIcon, color: 'var(--app-color-1)' },
  { id: 'touchstones', name: 'Touchstones', icon: AnchorIcon, color: 'var(--app-color-5)' },
  { id: 'chronicle', name: 'Chronicle', icon: ScrollIcon, color: 'var(--app-color-6)' },
  { id: 'dice', name: 'Dice Roller', icon: DiceIcon, color: 'var(--app-color-4)' },
  { id: 'edges', name: 'Edges', icon: ShieldIcon, color: 'var(--app-color-7)' },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, color: 'var(--app-color-8)' }
];

// DM-only apps
const DM_APPS = [
  { id: 'rewards', name: 'Rewards', icon: CrownIcon, color: 'linear-gradient(135deg, var(--color-warning) 0%, var(--color-primary) 100%)', dmOnly: true },
  { id: 'campaign', name: 'Campaign', icon: GlobeIcon, color: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-primary) 100%)', dmOnly: true }
];

// Helper to get greeting based on time
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function HomeScreen({ onAppOpen }) {
  // Initialize state from localStorage synchronously to avoid useEffect setState
  const [character] = useState(() => database.getCurrentCharacter());
  const [greeting] = useState(() => getTimeGreeting());
  const [isDM] = useState(() => dmMode.isDM());

  // Combine regular apps with DM apps if in DM mode
  const visibleApps = isDM ? [...APPS.slice(0, -1), ...DM_APPS, APPS[APPS.length - 1]] : APPS;

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
            {isDM && (
              <div className="dm-badge">
                <CrownIcon size={14} />
                <span>DM</span>
              </div>
            )}
          </div>
        )}

        {/* App Grid */}
        <div className="app-grid">
          {visibleApps.map(app => {
            const IconComponent = app.icon;
            return (
              <button
                key={app.id}
                className={`app-icon ${app.dmOnly ? 'dm-only' : ''}`}
                style={{ background: app.color }}
                onClick={() => onAppOpen(app.id)}
              >
                <div className="app-icon-graphic">
                  <IconComponent size={32} />
                </div>
                <div className="app-icon-name">{app.name}</div>
                {app.dmOnly && <div className="app-dm-badge">DM</div>}
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
