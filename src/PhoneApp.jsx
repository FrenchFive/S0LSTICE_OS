import { useState, useCallback, useEffect } from 'react';
import PhoneLayout from './layouts/PhoneLayout';
import HomeScreen from './apps/HomeScreen';

// Pages
import CharacterSelect from './pages/CharacterSelect';
import CharacterCreator from './pages/CharacterCreator';
import BankPage from './pages/BankPage';
import Settings from './pages/Settings';

// Apps
import FriendsApp from './apps/FriendsApp';
import CodexApp from './apps/CodexApp';
import MapApp from './apps/MapApp';
import IdentityApp from './apps/IDCardApp';
import ContactsApp from './apps/ContactsApp';
import QuestApp from './apps/QuestApp';
import InventoryApp from './apps/InventoryApp';
import PetsApp from './apps/PetsApp';
import NotesApp from './apps/NotesApp';
import CombatApp from './apps/CombatApp';
import DMRewardsApp from './apps/DMRewardsApp';
import ConditionsApp from './apps/ConditionsApp';
import TouchstonesApp from './apps/TouchstonesApp';
import ChronicleApp from './apps/ChronicleApp';
import CampaignApp from './apps/CampaignApp';
import EdgesApp from './apps/EdgesApp';

// Utils
import { database, dmMode } from './utils/database';
import { wsClient } from './utils/websocket';

// Icons
import { UserIcon, WalletIcon } from './components/icons/Icons';

// Simple app components mapping (dice is handled on home screen)
const SIMPLE_APPS = {
  friends: FriendsApp,
  codex: CodexApp,
  map: MapApp,
  contacts: ContactsApp,
  quest: QuestApp,
  inventory: InventoryApp,
  pets: PetsApp,
  notes: NotesApp,
  combat: CombatApp,
  rewards: DMRewardsApp,
  conditions: ConditionsApp,
  touchstones: TouchstonesApp,
  chronicle: ChronicleApp,
  campaign: CampaignApp,
  edges: EdgesApp,
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

  const handleClearCharacter = useCallback(() => {
    // Clear current character and go to character select
    setCurrentCharacter(null);
    setIsDMMode(false);
    dmMode.setDM(false);
    setCurrentApp('identity');
  }, []);

  const handleDeleteCharacter = useCallback((charId) => {
    // Delete the character from database
    database.deleteCharacter(charId);
    // Clear current character
    setCurrentCharacter(null);
    // Go to character select
    setCurrentApp('identity');
  }, []);

  const renderApp = () => {
    // Home screen
    if (currentApp === 'home') {
      return <HomeScreen onAppOpen={handleAppOpen} />;
    }

    // Identity app - the main character hub (combines old ID Card, Character, and Stats)
    if (currentApp === 'identity') {
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
          <IdentityApp
            character={currentCharacter}
            onUpdate={setCurrentCharacter}
            onSelectCharacter={() => {
              setCurrentCharacter(null);
              // This will show the character select screen
            }}
          />
        );
      }
      // DM mode without character - show identity app anyway
      return <IdentityApp />;
    }

    // Bank requires character
    if (currentApp === 'bank') {
      if (!currentCharacter) {
        return (
          <RequireCharacter
            icon={WalletIcon}
            title="Bank"
            onSelectCharacter={() => handleAppOpen('identity')}
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
          onClearCharacter={handleClearCharacter}
          onDeleteCharacter={handleDeleteCharacter}
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
