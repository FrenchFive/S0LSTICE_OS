import { useState, useCallback, useEffect } from 'react';
import PhoneLayout from './layouts/PhoneLayout';
import HomeScreen from './apps/HomeScreen';

// Pages
import CharacterSelect from './pages/CharacterSelect';
import CharacterCreator from './pages/CharacterCreator';
import CharacterMain from './pages/CharacterMain';
import BankPage from './pages/BankPage';
import Settings from './pages/Settings';

// Apps
import FriendsApp from './apps/FriendsApp';
import CodexApp from './apps/CodexApp';
import MapApp from './apps/MapApp';
import IDCardApp from './apps/IDCardApp';
import ContactsApp from './apps/ContactsApp';
import StatsApp from './apps/StatsApp';
import QuestApp from './apps/QuestApp';
import InventoryApp from './apps/InventoryApp';
import PetsApp from './apps/PetsApp';
import NotesApp from './apps/NotesApp';
import CombatApp from './apps/CombatApp';
import DMRewardsApp from './apps/DMRewardsApp';

// Utils
import { database, dmMode } from './utils/database';
import { wsClient } from './utils/websocket';

// Icons
import { UserIcon, WalletIcon } from './components/icons/Icons';

// Simple app components mapping
const SIMPLE_APPS = {
  friends: FriendsApp,
  codex: CodexApp,
  map: MapApp,
  id: IDCardApp,
  contacts: ContactsApp,
  stats: StatsApp,
  quest: QuestApp,
  inventory: InventoryApp,
  pets: PetsApp,
  notes: NotesApp,
  combat: CombatApp,
  rewards: DMRewardsApp,
};

// Placeholder for requiring character selection
function RequireCharacter({ icon, title, onSelectCharacter }) {
  const Icon = icon;
  return (
    <div className="app-content">
      <div className="section" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-muted)' }}>
          <Icon size={48} />
        </div>
        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-5)' }}>
          Please select a character first
        </p>
        <button className="btn btn-primary" onClick={onSelectCharacter}>
          <UserIcon size={16} /> Select Character
        </button>
      </div>
    </div>
  );
}

function PhoneApp() {
  const [currentApp, setCurrentApp] = useState('home');
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [isEditingCharacter, setIsEditingCharacter] = useState(false);
  const [isDMMode, setIsDMMode] = useState(() => dmMode.isDM());
  const [xpNotification, setXpNotification] = useState(null);

  // Listen for XP awards from DM
  useEffect(() => {
    const handleXPAward = (data) => {
      if (currentCharacter) {
        // Award XP to local character
        const updated = database.awardXP(currentCharacter.id, data.amount, data.reason);
        if (updated) {
          setCurrentCharacter(updated);
          // Show notification
          setXpNotification({
            amount: data.amount,
            reason: data.reason,
            from: data.fromDM
          });
          // Clear notification after 5 seconds
          setTimeout(() => setXpNotification(null), 5000);
        }
      }
    };

    wsClient.on('xp_award', handleXPAward);
    return () => wsClient.off('xp_award', handleXPAward);
  }, [currentCharacter]);

  const handleAppOpen = useCallback((appId) => {
    setCurrentApp(appId);
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentApp('home');
  }, []);

  const handleCharacterSelect = useCallback((char) => {
    setCurrentCharacter(char);
    setIsDMMode(false);
    handleBackToHome();
  }, [handleBackToHome]);

  const handleDMSelect = useCallback(() => {
    setIsDMMode(true);
    setCurrentCharacter(null); // DM doesn't need a character
    dmMode.setDM(true);
    wsClient.setDMMode(true);
    handleBackToHome();
  }, [handleBackToHome]);

  const handleCreateCharacter = useCallback(() => {
    setIsCreatingCharacter(true);
  }, []);

  const handleCharacterCreated = useCallback((char) => {
    if (char) setCurrentCharacter(char);
    setIsCreatingCharacter(false);
    setIsEditingCharacter(false);
    handleBackToHome();
  }, [handleBackToHome]);

  const renderApp = () => {
    // Home screen
    if (currentApp === 'home') {
      return <HomeScreen onAppOpen={handleAppOpen} />;
    }

    // Character app with special flow
    if (currentApp === 'character') {
      if (isCreatingCharacter) {
        return (
          <CharacterCreator
            editCharacter={isEditingCharacter ? currentCharacter : null}
            onComplete={handleCharacterCreated}
          />
        );
      }
      if (!currentCharacter && !isDMMode) {
        return (
          <CharacterSelect
            onSelectCharacter={handleCharacterSelect}
            onCreateNew={handleCreateCharacter}
            onSelectDM={handleDMSelect}
          />
        );
      }
      if (currentCharacter) {
        return (
          <CharacterMain
            character={currentCharacter}
            onUpdate={setCurrentCharacter}
          />
        );
      }
      // DM mode without character - go to home
      return <HomeScreen onAppOpen={handleAppOpen} />;
    }

    // Bank requires character
    if (currentApp === 'bank') {
      if (!currentCharacter) {
        return (
          <RequireCharacter
            icon={WalletIcon}
            title="Bank"
            onSelectCharacter={() => handleAppOpen('character')}
          />
        );
      }
      return <BankPage character={currentCharacter} />;
    }

    // Settings
    if (currentApp === 'settings') {
      return (
        <Settings
          currentCharacter={currentCharacter}
          onClose={handleBackToHome}
        />
      );
    }

    // Simple apps that don't require special handling
    const SimpleApp = SIMPLE_APPS[currentApp];
    if (SimpleApp) {
      return <SimpleApp />;
    }

    // Fallback to home
    return <HomeScreen onAppOpen={handleAppOpen} />;
  };

  return (
    <PhoneLayout currentApp={currentApp} onAppChange={setCurrentApp}>
      {renderApp()}
      
      {/* XP Award Notification */}
      {xpNotification && (
        <div className="xp-notification">
          <div className="xp-notification-content">
            <div className="xp-notification-icon">⭐</div>
            <div className="xp-notification-text">
              <span className="xp-amount">+{xpNotification.amount} XP</span>
              <span className="xp-reason">{xpNotification.reason}</span>
              <span className="xp-from">from {xpNotification.from}</span>
            </div>
          </div>
        </div>
      )}
    </PhoneLayout>
  );
}

export default PhoneApp;
