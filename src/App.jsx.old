import { useState, useEffect } from 'react';
import { database } from './utils/database';
import { wsClient } from './utils/websocket';
import CharacterSelect from './pages/CharacterSelect';
import CharacterCreator from './pages/CharacterCreator';
import CharacterMain from './pages/CharacterMain';
import BankPage from './pages/BankPage';
import Settings from './pages/Settings';
import './styles/theme.css';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('loading');
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load last viewed character on app start
    const char = database.getCurrentCharacter();
    if (char) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentCharacter(char);
      setCurrentView('main');
    } else {
      // No character found, go to select screen
      setCurrentView('select');
    }

    // Set up connection status listener
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);

    return () => {
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
    };
  }, []);

  const handleSelectCharacter = (character) => {
    setCurrentCharacter(character);
    setCurrentView('main');
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleCreateComplete = (character) => {
    if (character) {
      setCurrentCharacter(character);
      setCurrentView('main');
    } else {
      setCurrentView('select');
    }
  };

  const handleCharacterUpdate = (updated) => {
    setCurrentCharacter(updated);
  };

  const handleChangeCharacter = () => {
    setCurrentView('select');
  };

  const handleEditCharacter = () => {
    setCurrentView('edit');
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      {currentCharacter && currentView !== 'select' && currentView !== 'create' && currentView !== 'edit' && currentView !== 'settings' && (
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-brand">
              🎯 Hunters RPG
              {isConnected && <span className="connection-indicator">🟢 Online</span>}
            </div>
            <div className="nav-buttons">
              <button
                className={`nav-button ${currentView === 'main' ? 'active' : ''}`}
                onClick={() => setCurrentView('main')}
              >
                🏠 Character
              </button>
              <button
                className={`nav-button ${currentView === 'bank' ? 'active' : ''}`}
                onClick={() => setCurrentView('bank')}
              >
                🏦 Bank
              </button>
              <button
                className="nav-button"
                onClick={handleEditCharacter}
              >
                ✏️ Edit
              </button>
              <button
                className="nav-button"
                onClick={() => setCurrentView('settings')}
              >
                ⚙️ Settings
              </button>
              <button
                className="nav-button"
                onClick={handleChangeCharacter}
              >
                🔄 Change Character
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'select' && (
          <CharacterSelect
            onSelectCharacter={handleSelectCharacter}
            onCreateNew={handleCreateNew}
          />
        )}
        {currentView === 'create' && (
          <CharacterCreator onComplete={handleCreateComplete} />
        )}
        {currentView === 'edit' && (
          <CharacterCreator
            editCharacter={currentCharacter}
            onComplete={(char) => {
              if (char) {
                setCurrentCharacter(char);
                setCurrentView('main');
              } else {
                setCurrentView('main');
              }
            }}
          />
        )}
        {currentView === 'main' && (
          <CharacterMain
            character={currentCharacter}
            onUpdate={handleCharacterUpdate}
          />
        )}
        {currentView === 'bank' && (
          <BankPage character={currentCharacter} />
        )}
        {currentView === 'settings' && (
          <Settings
            currentCharacter={currentCharacter}
            onClose={() => setCurrentView('main')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
