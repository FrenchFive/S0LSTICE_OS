import { useState, useCallback } from 'react';
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

  const handleAppOpen = useCallback((appId) => {
    setCurrentApp(appId);
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentApp('home');
  }, []);

  const handleCharacterSelect = useCallback((char) => {
    setCurrentCharacter(char);
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
      if (!currentCharacter) {
        return (
          <CharacterSelect
            onSelectCharacter={handleCharacterSelect}
            onCreateNew={handleCreateCharacter}
          />
        );
      }
      return (
        <CharacterMain
          character={currentCharacter}
          onUpdate={setCurrentCharacter}
        />
      );
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
    </PhoneLayout>
  );
}

export default PhoneApp;
