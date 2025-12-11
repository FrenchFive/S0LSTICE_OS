import { useState, useEffect, useCallback } from 'react';
import { database, dmMode } from './utils/database';
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
  const [isDMMode, setIsDMMode] = useState(false);

  // Check for existing character or DM mode on load
  useEffect(() => {
    // Pre-load character data and DM mode state while splash is showing
    const loadCharacterData = () => {
      const savedCharacter = database.getCurrentCharacter();
      const savedDMMode = dmMode.isDM();
      
      if (savedDMMode) {
        setIsDMMode(true);
      } else if (savedCharacter) {
        setCurrentCharacter(savedCharacter);
      }
    };
    loadCharacterData();
  }, []);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    if (isDMMode) {
      // DM mode active, go directly to main app
      setAppState(APP_STATE.MAIN);
    } else if (currentCharacter) {
      // Character exists, go directly to main app
      setAppState(APP_STATE.MAIN);
    } else {
      // No character and not DM, show onboarding
      setAppState(APP_STATE.ONBOARDING);
    }
  }, [currentCharacter, isDMMode]);

  // Handle character selection/creation from onboarding
  const handleCharacterComplete = useCallback((character) => {
    setCurrentCharacter(character);
    setIsDMMode(false);
    setAppState(APP_STATE.MAIN);
  }, []);

  // Handle DM mode selection from onboarding
  const handleDMSelect = useCallback(() => {
    setIsDMMode(true);
    setCurrentCharacter(null);
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
    setIsDMMode(false);
    dmMode.setDM(false);
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
          onSelectDM={handleDMSelect}
        />
      );

    case APP_STATE.MAIN:
      return (
        <DesktopLayout
          character={currentCharacter}
          onCharacterUpdate={handleCharacterUpdate}
          onSwitchCharacter={handleSwitchCharacter}
          isDMMode={isDMMode}
        />
      );

    default:
      return null;
  }
}

export default App;
