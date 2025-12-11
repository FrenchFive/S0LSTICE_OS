import { useState, useEffect } from 'react';
import PhoneLayout from './PhoneLayout';
import HomeScreen from '../apps/HomeScreen';
import { ArrowLeftIcon } from '../components/icons/Icons';
import './DesktopLayout.css';

// Import all apps
import FriendsApp from '../apps/FriendsApp';
import CodexApp from '../apps/CodexApp';
import MapApp from '../apps/MapApp';
import IdentityApp from '../apps/IDCardApp';
import ContactsApp from '../apps/ContactsApp';
import QuestApp from '../apps/QuestApp';
import InventoryApp from '../apps/InventoryApp';
import PetsApp from '../apps/PetsApp';
import NotesApp from '../apps/NotesApp';
import CombatApp from '../apps/CombatApp';
import BankPage from '../pages/BankPage';
import Settings from '../pages/Settings';

// App registry with metadata
const APPS = {
  friends: { component: FriendsApp, title: 'Friends', expandable: true },
  codex: { component: CodexApp, title: 'Codex', expandable: true },
  map: { component: MapApp, title: 'Map', expandable: true },
  identity: { component: IdentityApp, title: 'Identity', expandable: true, needsCharacter: true },
  contacts: { component: ContactsApp, title: 'Contacts', expandable: true },
  quest: { component: QuestApp, title: 'Quests', expandable: true },
  inventory: { component: InventoryApp, title: 'Inventory', expandable: true },
  pets: { component: PetsApp, title: 'Pets', expandable: true },
  notes: { component: NotesApp, title: 'Notes', expandable: true },
  combat: { component: CombatApp, title: 'Combat', expandable: true },
  bank: { component: BankPage, title: 'Bank', expandable: true, needsCharacter: true },
  settings: { component: Settings, title: 'Settings', expandable: true },
};

function DesktopLayout({ character, onCharacterUpdate, onSwitchCharacter, onClearCharacter, onDeleteCharacter }) {
  const [currentApp, setCurrentApp] = useState('home');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth >= 1200;
      setIsLargeScreen(large);
      // Collapse if screen becomes small
      if (!large && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const handleAppOpen = (appId) => {
    setCurrentApp(appId);
    
    // Auto-expand on large screens for expandable apps
    if (isLargeScreen && appId !== 'home' && APPS[appId]?.expandable) {
      setIsExpanded(true);
    }
  };

  const handleCloseApp = () => {
    setCurrentApp('home');
    setIsExpanded(false);
  };

  const handleBackToHome = () => {
    setCurrentApp('home');
    setIsExpanded(false);
  };

  // Render the current app content for the expanded view
  const renderExpandedApp = () => {
    if (currentApp === 'home' || !APPS[currentApp]) {
      return null;
    }

    const appConfig = APPS[currentApp];
    const AppComponent = appConfig.component;

    // Check if app needs character
    if (appConfig.needsCharacter && !character) {
      return (
        <div className="expanded-app-placeholder">
          <p>Please select a character first</p>
          <button className="btn btn-primary" onClick={() => handleAppOpen('home')}>
            Go to Home
          </button>
        </div>
      );
    }

    // Render the app with appropriate props
    const props = {};
    if (currentApp === 'settings') {
      props.currentCharacter = character;
      props.onClose = handleBackToHome;
      props.onSwitchCharacter = onSwitchCharacter;
      props.onClearCharacter = onClearCharacter;
      props.onDeleteCharacter = onDeleteCharacter;
    } else if (currentApp === 'identity' || currentApp === 'bank') {
      props.character = character;
      props.onUpdate = onCharacterUpdate;
    }

    return <AppComponent {...props} />;
  };

  // Render the phone content
  const renderPhoneContent = () => {
    if (currentApp === 'home') {
      return <HomeScreen onAppOpen={handleAppOpen} />;
    }

    // On small screens or when not expanded, show the app in the phone
    if (!isLargeScreen || !isExpanded) {
      const appConfig = APPS[currentApp];
      if (!appConfig) {
        return <HomeScreen onAppOpen={handleAppOpen} />;
      }

      const AppComponent = appConfig.component;

      // Check if app needs character
      if (appConfig.needsCharacter && !character) {
        return (
          <div className="app-content">
            <div className="section" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ marginBottom: 'var(--spacing-4)' }}>Please select a character first</p>
              <button className="btn btn-primary" onClick={() => handleAppOpen('home')}>
                Go to Home
              </button>
            </div>
          </div>
        );
      }

      const props = {};
      if (currentApp === 'settings') {
        props.currentCharacter = character;
        props.onClose = handleBackToHome;
        props.onSwitchCharacter = onSwitchCharacter;
        props.onClearCharacter = onClearCharacter;
        props.onDeleteCharacter = onDeleteCharacter;
      } else if (currentApp === 'identity' || currentApp === 'bank') {
        props.character = character;
        props.onUpdate = onCharacterUpdate;
      }

      return <AppComponent {...props} />;
    }

    // On large screens when expanded, show home in phone
    return <HomeScreen onAppOpen={handleAppOpen} currentApp={currentApp} />;
  };

  return (
    <div className={`desktop-layout ${isExpanded ? 'expanded' : ''} ${isLargeScreen ? 'large-screen' : ''}`}>
      {/* Phone Frame */}
      <div className="phone-frame-container">
        <div className="phone-frame">
          <div className="phone-notch" />
          <PhoneLayout 
            currentApp={isExpanded ? 'home' : currentApp} 
            onAppChange={handleAppOpen}
          >
            {renderPhoneContent()}
          </PhoneLayout>
        </div>
      </div>

      {/* Expanded App Panel */}
      {isLargeScreen && isExpanded && currentApp !== 'home' && (
        <div className="expanded-panel">
          <div className="expanded-header">
            <button className="btn btn-outline btn-sm" onClick={handleCloseApp}>
              <ArrowLeftIcon size={16} /> Close
            </button>
            <h2 className="expanded-title">{APPS[currentApp]?.title || 'App'}</h2>
            <div style={{ width: '80px' }} /> {/* Spacer for centering */}
          </div>
          <div className="expanded-content">
            {renderExpandedApp()}
          </div>
        </div>
      )}
    </div>
  );
}

export default DesktopLayout;
