import { useState, useEffect, useCallback } from 'react';
import { database } from './utils/database';
import SplashScreen from './components/SplashScreen';
import CharacterOnboarding from './components/CharacterOnboarding';
import DesktopLayout from './layouts/DesktopLayout';
import './styles/theme.css';
import './App.css';

// App states
const APP_STATE = {
  SPLASH: 'splash',
  ONBOARDING: 'onboarding',
  MAIN: 'main'
};

function App() {
  const [appState, setAppState] = useState(APP_STATE.SPLASH);
  const [currentCharacter, setCurrentCharacter] = useState(null);

  // Check for existing character on load
  useEffect(() => {
    // Pre-load character data while splash is showing
    const loadCharacterData = () => {
      const savedCharacter = database.getCurrentCharacter();
      if (savedCharacter) {
        setCurrentCharacter(savedCharacter);
      }
    };
    loadCharacterData();
  }, []);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    if (currentCharacter) {
      // Character exists, go directly to main app
      setAppState(APP_STATE.MAIN);
    } else {
      // No character, show onboarding
      setAppState(APP_STATE.ONBOARDING);
    }
  }, [currentCharacter]);

  // Handle character selection/creation from onboarding
  const handleCharacterComplete = useCallback((character) => {
    setCurrentCharacter(character);
    setAppState(APP_STATE.MAIN);
  }, []);

  // Handle character update from main app
  const handleCharacterUpdate = useCallback((updatedCharacter) => {
    setCurrentCharacter(updatedCharacter);
    if (updatedCharacter) {
      database.saveCharacter(updatedCharacter);
    }
  }, []);

  // Handle switch character (go back to onboarding)
  const handleSwitchCharacter = useCallback(() => {
    setAppState(APP_STATE.ONBOARDING);
  }, []);

  // Render based on app state
  switch (appState) {
    case APP_STATE.SPLASH:
      return (
        <SplashScreen 
          onComplete={handleSplashComplete}
          minimumDuration={2500}
        />
      );

    case APP_STATE.ONBOARDING:
      return (
        <CharacterOnboarding 
          onComplete={handleCharacterComplete}
        />
      );

    case APP_STATE.MAIN:
      return (
        <DesktopLayout
          character={currentCharacter}
          onCharacterUpdate={handleCharacterUpdate}
          onSwitchCharacter={handleSwitchCharacter}
        />
      );

    default:
      return null;
  }
}

export default App;
