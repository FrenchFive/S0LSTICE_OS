import { useState, useEffect, useCallback, useRef } from 'react';
import { database, dmMode } from '../utils/database';
import {
  UserIcon,
  UsersIcon,
  BookIcon,
  IdCardIcon,
  PhoneIcon,
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
import DicePopup from '../components/DicePopup';
import DiceOverlay from '../components/DiceOverlay';
import './HomeScreen.css';

// Storage key for icon positions
const ICON_POSITIONS_KEY = 'hunters_icon_positions';

// App definitions with harmonious color assignments
const APPS = [
  { id: 'identity', name: 'Identity', icon: IdCardIcon, color: 'var(--app-color-1)' },
  { id: 'friends', name: 'Friends', icon: UsersIcon, color: 'var(--app-color-3)' },
  { id: 'codex', name: 'Codex', icon: BookIcon, color: 'var(--app-color-5)' },
  { id: 'contacts', name: 'Contacts', icon: PhoneIcon, color: 'var(--app-color-7)' },
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

// Load saved positions from localStorage
function loadIconPositions() {
  try {
    const saved = localStorage.getItem(ICON_POSITIONS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Save positions to localStorage
function saveIconPositions(positions) {
  try {
    localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage errors
  }
}

function HomeScreen({ onAppOpen }) {
  // Initialize state from localStorage synchronously to avoid useEffect setState
  const [character] = useState(() => database.getCurrentCharacter());
  const [greeting] = useState(() => getTimeGreeting());
  const [isDM] = useState(() => dmMode.isDM());
  
  // Dice state
  const [showDicePopup, setShowDicePopup] = useState(false);
  const [diceToRoll, setDiceToRoll] = useState(null);
  
  // Draggable state
  const [appOrder, setAppOrder] = useState(() => {
    const saved = loadIconPositions();
    if (saved) return saved;
    // Default order
    return [...APPS, ...DM_APPS].map(app => app.id);
  });
  const [draggedApp, setDraggedApp] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragRef = useRef(null);

  // Save order when it changes
  useEffect(() => {
    saveIconPositions(appOrder);
  }, [appOrder]);

  // Combine and filter apps based on order and DM mode
  const getVisibleApps = useCallback(() => {
    const allApps = [...APPS, ...DM_APPS];
    const orderedApps = appOrder
      .map(id => allApps.find(app => app.id === id))
      .filter(Boolean);
    
    // Add any new apps not in the saved order
    allApps.forEach(app => {
      if (!orderedApps.find(a => a.id === app.id)) {
        orderedApps.push(app);
      }
    });
    
    // Filter out DM apps if not in DM mode
    return orderedApps.filter(app => !app.dmOnly || isDM);
  }, [appOrder, isDM]);

  const visibleApps = getVisibleApps();

  // Drag handlers
  const handleDragStart = (e, app, index) => {
    setDraggedApp({ app, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', app.id);
    
    // Add dragging class after a short delay for visual feedback
    setTimeout(() => {
      if (dragRef.current) {
        dragRef.current.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedApp(null);
    setDragOverIndex(null);
    if (dragRef.current) {
      dragRef.current.classList.remove('dragging');
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedApp && draggedApp.index !== targetIndex) {
      const newOrder = [...appOrder];
      const draggedId = draggedApp.app.id;
      
      // Remove from old position
      const oldIndex = newOrder.indexOf(draggedId);
      if (oldIndex > -1) {
        newOrder.splice(oldIndex, 1);
      }
      
      // Find the target app's position in the full order
      const targetApp = visibleApps[targetIndex];
      const targetOrderIndex = newOrder.indexOf(targetApp.id);
      
      // Insert at new position
      newOrder.splice(targetOrderIndex, 0, draggedId);
      
      setAppOrder(newOrder);
    }
    
    setDraggedApp(null);
    setDragOverIndex(null);
  };

  // Touch drag handlers for mobile
  const touchStartRef = useRef(null);
  const [touchDragging, setTouchDragging] = useState(false);

  const handleTouchStart = (e, app, index) => {
    touchStartRef.current = {
      app,
      index,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      moved: false,
    };
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.startX;
    const dy = touch.clientY - touchStartRef.current.startY;
    
    // Only start dragging after moving a minimum distance
    if (!touchStartRef.current.moved && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      touchStartRef.current.moved = true;
      setTouchDragging(true);
      setDraggedApp({ app: touchStartRef.current.app, index: touchStartRef.current.index });
    }
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current && !touchStartRef.current.moved) {
      // It was a tap, not a drag - open the app
      onAppOpen(touchStartRef.current.app.id);
    }
    touchStartRef.current = null;
    setTouchDragging(false);
    setDraggedApp(null);
    setDragOverIndex(null);
  };

  // Dice handlers
  const handleDiceClick = () => {
    setShowDicePopup(true);
  };

  const handleDiceRoll = (diceConfig) => {
    setShowDicePopup(false);
    setDiceToRoll(diceConfig);
  };

  const handleDiceComplete = (results) => {
    // Could save to history or show notification
    console.log('Dice results:', results);
  };

  const handleDiceOverlayClose = () => {
    setDiceToRoll(null);
  };

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

        {/* DM Mode Widget (when no character) */}
        {!character && isDM && (
          <div className="character-widget dm-widget">
            <div className="widget-avatar dm-avatar">
              <CrownIcon size={32} />
            </div>
            <div className="widget-info">
              <div className="widget-greeting">{greeting},</div>
              <div className="widget-name">Game Master</div>
              <div className="widget-level">Running the Session</div>
            </div>
            <div className="dm-badge">
              <CrownIcon size={14} />
              <span>DM</span>
            </div>
          </div>
        )}

        {/* Dice Widget - Large */}
        <button 
          className="dice-widget"
          onClick={handleDiceClick}
        >
          <div className="dice-widget-icon">
            <DiceIcon size={48} />
          </div>
          <div className="dice-widget-label">Roll Dice</div>
          <div className="dice-widget-hint">Tap to roll</div>
        </button>

        {/* App Grid - Draggable */}
        <div 
          className={`app-grid ${touchDragging ? 'touch-dragging' : ''}`}
          ref={dragRef}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {visibleApps.map((app, index) => {
            const IconComponent = app.icon;
            const isDragging = draggedApp?.app.id === app.id;
            const isDragOver = dragOverIndex === index && draggedApp;
            
            return (
              <button
                key={app.id}
                className={`app-icon ${app.dmOnly ? 'dm-only' : ''} ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                style={{ background: app.color }}
                onClick={() => !touchDragging && onAppOpen(app.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, app, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onTouchStart={(e) => handleTouchStart(e, app, index)}
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

        {/* Drag hint */}
        <div className="drag-hint">
          Hold and drag icons to rearrange
        </div>

        {/* No Character Prompt (only when not in DM mode) */}
        {!character && !isDM && (
          <div className="no-character-prompt">
            <div className="prompt-icon">
              <UserIcon size={64} />
            </div>
            <p>No character selected</p>
            <button 
              className="btn btn-primary"
              onClick={() => onAppOpen('identity')}
            >
              Select Character
            </button>
          </div>
        )}
      </div>

      {/* Dice Popup */}
      {showDicePopup && (
        <DicePopup
          onRoll={handleDiceRoll}
          onClose={() => setShowDicePopup(false)}
        />
      )}

      {/* Dice Overlay - 3D Rolling */}
      {diceToRoll && (
        <DiceOverlay
          diceConfig={diceToRoll}
          onComplete={handleDiceComplete}
          onClose={handleDiceOverlayClose}
        />
      )}
    </div>
  );
}

export default HomeScreen;
