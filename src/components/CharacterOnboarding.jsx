import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import {
  UserIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  TrashIcon,
} from './icons/Icons';
import './CharacterOnboarding.css';

// Step components
function WelcomeStep({ onNext, hasCharacters }) {
  return (
    <div className="onboarding-step welcome-step">
      <div className="welcome-icon">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="35" fill="currentColor" />
          <circle cx="50" cy="50" r="25" fill="var(--color-bg)" />
        </svg>
      </div>
      <h1>Welcome to S0LSTICE_OS</h1>
      <p className="welcome-subtitle">Your Hunter&apos;s Digital Companion</p>
      <p className="welcome-description">
        {hasCharacters 
          ? 'Select a character to continue your adventure or create a new one.'
          : 'Create your first character to begin your journey as a Hunter.'
        }
      </p>
      <button className="btn btn-primary btn-lg" onClick={onNext}>
        {hasCharacters ? 'Choose Character' : 'Create Character'}
        <ArrowRightIcon size={20} />
      </button>
    </div>
  );
}

function SelectCharacterStep({ characters, onSelect, onCreate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = (e, charId) => {
    e.stopPropagation();
    if (confirmDelete === charId) {
      database.deleteCharacter(charId);
      onDelete(charId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(charId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="onboarding-step select-step">
      <h2>Select Your Character</h2>
      <p className="step-description">Choose a character to continue or create a new one.</p>
      
      <div className="character-list">
        {characters.map(char => (
          <div 
            key={char.id} 
            className="character-card-select"
            onClick={() => onSelect(char)}
          >
            <div className="character-avatar-select">
              {char.image ? (
                <img src={char.image} alt={char.name} />
              ) : (
                <span>{char.name?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="character-info-select">
              <h3>{char.name}</h3>
              <p>Level {char.level} Hunter</p>
            </div>
            <button 
              className={`btn-delete-char ${confirmDelete === char.id ? 'confirm' : ''}`}
              onClick={(e) => handleDelete(e, char.id)}
              title={confirmDelete === char.id ? 'Click again to confirm' : 'Delete character'}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
        
        <button className="create-new-card" onClick={onCreate}>
          <div className="create-icon">
            <PlusIcon size={32} />
          </div>
          <span>Create New Character</span>
        </button>
      </div>
    </div>
  );
}

function CreateCharacterStep({ onBack, onCreate, hasCharacters }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [hp, setHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  const [image, setImage] = useState('');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Stats, 3: Finish

  const handleStatChange = (stat, value) => {
    const numValue = Math.max(1, Math.min(30, parseInt(value) || 1));
    setStats(prev => ({ ...prev, [stat]: numValue }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const character = {
      id: Date.now().toString(),
      name: name.trim(),
      level,
      hp,
      maxHp,
      ...stats,
      image,
      backstory: '',
      createdAt: new Date().toISOString()
    };

    database.saveCharacter(character);
    onCreate(character);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="onboarding-step create-step">
      <div className="create-header">
        {hasCharacters && (
          <button className="btn btn-ghost" onClick={onBack}>
            <ArrowLeftIcon size={16} /> Back
          </button>
        )}
        <h2>Create Your Character</h2>
        <div className="step-indicator">
          <span className={step >= 1 ? 'active' : ''}>1</span>
          <span className={step >= 2 ? 'active' : ''}>2</span>
          <span className={step >= 3 ? 'active' : ''}>3</span>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="create-form">
          <h3>Basic Information</h3>
          
          <div className="avatar-upload">
            <div className="avatar-preview">
              {image ? (
                <img src={image} alt="Character" />
              ) : (
                <UserIcon size={48} />
              )}
            </div>
            <label className="btn btn-outline btn-sm">
              Upload Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>

          <div className="form-group">
            <label>Character Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your hunter's name"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Level</label>
              <input
                type="number"
                className="input"
                value={level}
                onChange={(e) => setLevel(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Max HP</label>
              <input
                type="number"
                className="input"
                value={maxHp}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setMaxHp(val);
                  setHp(val);
                }}
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Stats */}
      {step === 2 && (
        <div className="create-form">
          <h3>Ability Scores</h3>
          <p className="form-hint">Set your character&apos;s base abilities (1-30)</p>
          
          <div className="stats-grid-create">
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="stat-input-group">
                <label>{stat.charAt(0).toUpperCase() + stat.slice(1).substring(0, 3)}</label>
                <input
                  type="number"
                  className="input stat-input"
                  value={value}
                  onChange={(e) => handleStatChange(stat, e.target.value)}
                  min="1"
                  max="30"
                />
                <span className="stat-modifier-display">
                  {value >= 10 ? '+' : ''}{Math.floor((value - 10) / 2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="create-form review-form">
          <h3>Review Your Character</h3>
          
          <div className="review-card">
            <div className="review-avatar">
              {image ? (
                <img src={image} alt={name} />
              ) : (
                <span>{name?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="review-info">
              <h4>{name}</h4>
              <p>Level {level} Hunter</p>
              <p>HP: {hp}/{maxHp}</p>
            </div>
          </div>

          <div className="review-stats">
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="review-stat">
                <span className="review-stat-name">{stat.substring(0, 3).toUpperCase()}</span>
                <span className="review-stat-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="create-nav">
        {step > 1 && (
          <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
            <ArrowLeftIcon size={16} /> Back
          </button>
        )}
        {step < 3 ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next <ArrowRightIcon size={16} />
          </button>
        ) : (
          <button 
            className="btn btn-success btn-lg" 
            onClick={handleCreate}
          >
            Create Character
          </button>
        )}
      </div>
    </div>
  );
}

// Main Onboarding Component
function CharacterOnboarding({ onComplete }) {
  const [characters, setCharacters] = useState([]);
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, select, create

  useEffect(() => {
    const chars = database.getAllCharacters();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCharacters(chars);
  }, []);

  const handleNext = () => {
    if (characters.length > 0) {
      setCurrentStep('select');
    } else {
      setCurrentStep('create');
    }
  };

  const handleSelectCharacter = (character) => {
    database.setCurrentCharacter(character.id);
    onComplete(character);
  };

  const handleCreateNew = () => {
    setCurrentStep('create');
  };

  const handleCharacterCreated = (character) => {
    database.setCurrentCharacter(character.id);
    onComplete(character);
  };

  const handleDeleteCharacter = (charId) => {
    setCharacters(prev => prev.filter(c => c.id !== charId));
    if (characters.length <= 1) {
      setCurrentStep('create');
    }
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
  };

  return (
    <div className="character-onboarding">
      <div className="onboarding-container">
        {currentStep === 'welcome' && (
          <WelcomeStep 
            onNext={handleNext} 
            hasCharacters={characters.length > 0}
          />
        )}
        
        {currentStep === 'select' && (
          <SelectCharacterStep
            characters={characters}
            onSelect={handleSelectCharacter}
            onCreate={handleCreateNew}
            onDelete={handleDeleteCharacter}
          />
        )}
        
        {currentStep === 'create' && (
          <CreateCharacterStep
            onBack={characters.length > 0 ? handleBackToSelect : null}
            onCreate={handleCharacterCreated}
            hasCharacters={characters.length > 0}
          />
        )}
      </div>
    </div>
  );
}

export default CharacterOnboarding;
