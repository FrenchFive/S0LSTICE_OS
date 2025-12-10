import { useState } from 'react';
import PhoneLayout from './layouts/PhoneLayout';
import HomeScreen from './apps/HomeScreen';

// Import existing pages
import CharacterSelect from './pages/CharacterSelect';
import CharacterCreator from './pages/CharacterCreator';
import CharacterMain from './pages/CharacterMain';
import BankPage from './pages/BankPage';
import Settings from './pages/Settings';

// Import new apps
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

// Placeholder for new apps (to be implemented)
const PlaceholderApp = ({ appName, onBack }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>📱 {appName}</h2>
    <p>This app is coming soon!</p>
    <button className="btn btn-secondary" onClick={onBack}>
      ← Back to Home
    </button>
  </div>
);

function PhoneApp() {
  const [currentApp, setCurrentApp] = useState('home');
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [appState, setAppState] = useState({ creatingCharacter: false, editingCharacter: false });

  const handleAppOpen = (appId) => {
    setCurrentApp(appId);
  };

  const handleBackToHome = () => {
    setCurrentApp('home');
  };

  const renderApp = () => {
    switch (currentApp) {
      case 'home':
        return <HomeScreen onAppOpen={handleAppOpen} />;

      case 'character':
        if (!currentCharacter) {
          return (
            <CharacterSelect
              onSelectCharacter={(char) => {
                setCurrentCharacter(char);
                handleBackToHome();
              }}
              onCreateNew={() => setAppState({ ...appState, creatingCharacter: true })}
            />
          );
        } else if (appState.creatingCharacter) {
          return (
            <CharacterCreator
              editCharacter={appState.editingCharacter ? currentCharacter : null}
              onComplete={(char) => {
                if (char) setCurrentCharacter(char);
                setAppState({ ...appState, creatingCharacter: false, editingCharacter: false });
                handleBackToHome();
              }}
            />
          );
        } else {
          return (
            <CharacterMain
              character={currentCharacter}
              onUpdate={setCurrentCharacter}
            />
          );
        }

      case 'bank':
        if (!currentCharacter) {
          return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>💰 Bank</h2>
              <p>Please select a character first</p>
              <button className="btn btn-primary" onClick={() => handleAppOpen('character')}>
                Select Character
              </button>
            </div>
          );
        }
        return <BankPage character={currentCharacter} />;

      case 'settings':
        return (
          <Settings
            currentCharacter={currentCharacter}
            onClose={handleBackToHome}
          />
        );

      case 'friends':
        return <FriendsApp />;

      case 'codex':
        return <CodexApp />;

      case 'map':
        return <MapApp />;

      case 'id':
        return <IDCardApp />;
      
      case 'contacts':
        return <ContactsApp />;
      
      case 'stats':
        return <StatsApp />;
      
      case 'quest':
        return <QuestApp />;
      
      case 'inventory':
        return <InventoryApp />;
      
      case 'combat':
        return <CombatApp />;
      
      case 'pets':
        return <PetsApp />;
      
      case 'notes':
        return <NotesApp />;

      default:
        return <HomeScreen onAppOpen={handleAppOpen} />;
    }
  };

  return (
    <PhoneLayout currentApp={currentApp} onAppChange={setCurrentApp}>
      {renderApp()}
    </PhoneLayout>
  );
}

export default PhoneApp;
