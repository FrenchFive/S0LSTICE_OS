import { useState, useEffect } from 'react';
import { database, dmMode } from '../utils/database';
import {
  createDefaultCharacter,
  calculateHealth,
  calculateWillpower,
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  SKILLS,
  SKILL_LABELS,
  CREEDS
} from '../utils/huntersData';
import { DotRating } from './DotRating';
import { TraitSelector, TraitsDisplay } from './TraitSelector';
import {
  UserIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  TrashIcon,
  CrownIcon,
} from './icons/Icons';
import './CharacterOnboarding.css';

// Step components
function WelcomeStep({ onNext, onSelectDM, hasCharacters }) {
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
          ? 'Select a character to continue your chronicle or create a new Hunter.'
          : 'Create your first Hunter to begin your journey into the darkness, or enter as Game Master.'
        }
      </p>
      <div className="welcome-actions">
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          {hasCharacters ? 'Choose Hunter' : 'Create Hunter'}
          <ArrowRightIcon size={20} />
        </button>
        <button className="btn btn-outline btn-lg dm-entry-btn" onClick={onSelectDM}>
          <CrownIcon size={20} />
          Enter as Game Master
        </button>
      </div>
    </div>
  );
}

function SelectCharacterStep({ characters, onSelect, onCreate, onDelete, onSelectDM }) {
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

  const getCharacterInfo = (char) => {
    // Handle both old and new character formats
    if (char.identity) {
      return {
        name: char.identity.name || 'Unnamed',
        image: char.identity.portraitUrl,
        subtitle: char.identity.creed || char.identity.concept || 'Hunter'
      };
    }
    return {
      name: char.name || 'Unnamed',
      image: char.image,
      subtitle: `Level ${char.level || 1} Hunter`
    };
  };

  return (
    <div className="onboarding-step select-step">
      <h2>Select Your Hunter</h2>
      <p className="step-description">Choose a Hunter to continue, create a new one, or play as Game Master.</p>
      
      {/* DM Mode Option */}
      <div className="dm-mode-option-onboarding" onClick={onSelectDM}>
        <div className="dm-mode-icon-onboarding">
          <CrownIcon size={32} />
        </div>
        <div className="dm-mode-info-onboarding">
          <h3>Play as Game Master</h3>
          <p>Run the game, award XP, create encounters, and manage the session.</p>
        </div>
        <div className="dm-mode-arrow-onboarding">
          <ArrowRightIcon size={20} />
        </div>
      </div>

      <div className="character-list">
        {characters.map(char => {
          const info = getCharacterInfo(char);
          return (
            <div 
              key={char.id} 
              className="character-card-select"
              onClick={() => onSelect(char)}
            >
              <div className="character-avatar-select">
                {info.image ? (
                  <img src={info.image} alt={info.name} />
                ) : (
                  <span>{info.name?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div className="character-info-select">
                <h3>{info.name}</h3>
                <p>{info.subtitle}</p>
              </div>
              <button 
                className={`btn-delete-char ${confirmDelete === char.id ? 'confirm' : ''}`}
                onClick={(e) => handleDelete(e, char.id)}
                title={confirmDelete === char.id ? 'Click again to confirm' : 'Delete character'}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          );
        })}
        
        <button className="create-new-card" onClick={onCreate}>
          <div className="create-icon">
            <PlusIcon size={32} />
          </div>
          <span>Create New Hunter</span>
        </button>
      </div>
    </div>
  );
}

function CreateCharacterStep({ onBack, onCreate, hasCharacters }) {
  const [character, setCharacter] = useState(() => createDefaultCharacter());
  const [step, setStep] = useState(1); // 1: Identity, 2: Attributes, 3: Skills, 4: Traits, 5: Review

  const updateIdentity = (field, value) => {
    setCharacter(prev => ({
      ...prev,
      identity: { ...prev.identity, [field]: value }
    }));
  };

  const updateAttribute = (category, attr, value) => {
    setCharacter(prev => {
      const newChar = {
        ...prev,
        attributes: {
          ...prev.attributes,
          [category]: {
            ...prev.attributes[category],
            [attr]: value
          }
        }
      };
      // Recalculate derived stats
      newChar.health = { ...newChar.health, max: calculateHealth(newChar) };
      newChar.willpower = { ...newChar.willpower, max: calculateWillpower(newChar) };
      return newChar;
    });
  };

  const updateSkill = (category, skill, value) => {
    setCharacter(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: {
          ...prev.skills[category],
          [skill]: value
        }
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateIdentity('portraitUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!character.identity.name.trim()) return;
    
    const finalCharacter = {
      ...character,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    database.saveCharacter(finalCharacter);
    onCreate(finalCharacter);
  };

  const canProceed = () => {
    if (step === 1) return character.identity.name.trim().length > 0;
    return true;
  };

  // Count total attribute dots
  const totalAttributeDots = Object.values(character.attributes).reduce((sum, category) => {
    return sum + Object.values(category).reduce((s, v) => s + v, 0);
  }, 0);

  // Count total skill dots
  const totalSkillDots = Object.values(character.skills).reduce((sum, category) => {
    return sum + Object.values(category).reduce((s, v) => s + v, 0);
  }, 0);

  return (
    <div className="onboarding-step create-step">
      <div className="create-header">
        {hasCharacters && step === 1 && (
          <button className="btn btn-ghost" onClick={onBack}>
            <ArrowLeftIcon size={16} /> Back
          </button>
        )}
        <h2>Create Your Hunter</h2>
        <div className="step-indicator">
          <span className={step >= 1 ? 'active' : ''}>1</span>
          <span className={step >= 2 ? 'active' : ''}>2</span>
          <span className={step >= 3 ? 'active' : ''}>3</span>
          <span className={step >= 4 ? 'active' : ''}>4</span>
          <span className={step >= 5 ? 'active' : ''}>5</span>
        </div>
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <div className="create-form">
          <h3>Identity</h3>
          
          <div className="avatar-upload">
            <div className="avatar-preview">
              {character.identity.portraitUrl ? (
                <img src={character.identity.portraitUrl} alt="Character" />
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
            <label>Hunter Name *</label>
            <input
              type="text"
              className="input"
              value={character.identity.name}
              onChange={(e) => updateIdentity('name', e.target.value)}
              placeholder="Enter your hunter's name"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                className="input"
                value={character.biography?.age || ''}
                onChange={(e) => setCharacter(prev => ({
                  ...prev,
                  biography: { ...prev.biography, age: parseInt(e.target.value) || null }
                }))}
                placeholder="Age"
                min="0"
                max="150"
              />
            </div>
            <div className="form-group">
              <label>Occupation / Job</label>
              <input
                type="text"
                className="input"
                value={character.identity.occupation}
                onChange={(e) => updateIdentity('occupation', e.target.value)}
                placeholder="e.g., Private Investigator"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Concept</label>
              <input
                type="text"
                className="input"
                value={character.identity.concept}
                onChange={(e) => updateIdentity('concept', e.target.value)}
                placeholder="e.g., Paranoid Journalist"
              />
            </div>
            <div className="form-group">
              <label>Creed</label>
              <select
                className="input"
                value={character.identity.creed}
                onChange={(e) => updateIdentity('creed', e.target.value)}
              >
                <option value="">Select Creed...</option>
                {CREEDS.map(creed => (
                  <option key={creed.id} value={creed.name}>{creed.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Drive</label>
              <input
                type="text"
                className="input"
                value={character.identity.drive}
                onChange={(e) => updateIdentity('drive', e.target.value)}
                placeholder="What drives you?"
              />
            </div>
            <div className="form-group">
              <label>Cell</label>
              <input
                type="text"
                className="input"
                value={character.identity.cell}
                onChange={(e) => updateIdentity('cell', e.target.value)}
                placeholder="Your hunting group"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ambition</label>
              <input
                type="text"
                className="input"
                value={character.identity.ambition}
                onChange={(e) => updateIdentity('ambition', e.target.value)}
                placeholder="Long-term goal"
              />
            </div>
            <div className="form-group">
              <label>Desire</label>
              <input
                type="text"
                className="input"
                value={character.identity.desire}
                onChange={(e) => updateIdentity('desire', e.target.value)}
                placeholder="Immediate want"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Attributes */}
      {step === 2 && (
        <div className="create-form">
          <h3>Attributes</h3>
          <p className="form-hint">
            Assign dots to your attributes (1-5). Total: {totalAttributeDots} dots
          </p>
          
          <div className="attributes-grid">
            {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
              <div key={category} className="attribute-category">
                <h4 className="category-label">{label}</h4>
                {attrs.map(attr => (
                  <div key={attr} className="attribute-row">
                    <span className="attr-name">{ATTRIBUTE_LABELS[attr]}</span>
                    <DotRating
                      value={character.attributes[category][attr]}
                      max={5}
                      min={1}
                      onChange={(value) => updateAttribute(category, attr, value)}
                      size="md"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="derived-stats-preview">
            <div className="derived-stat">
              <span className="derived-label">Health</span>
              <span className="derived-value">{character.health.max}</span>
              <span className="derived-calc">(Stamina + 3)</span>
            </div>
            <div className="derived-stat">
              <span className="derived-label">Willpower</span>
              <span className="derived-value">{character.willpower.max}</span>
              <span className="derived-calc">(Composure + Resolve)</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Skills */}
      {step === 3 && (
        <div className="create-form">
          <h3>Skills</h3>
          <p className="form-hint">
            Assign dots to your skills (0-5). Total: {totalSkillDots} dots
          </p>
          
          <div className="skills-grid">
            {Object.entries(SKILLS).map(([category, { label, skills }]) => (
              <div key={category} className="skill-category">
                <h4 className="category-label">{label}</h4>
                {skills.map(skill => (
                  <div key={skill} className="skill-row">
                    <span className="skill-name">{SKILL_LABELS[skill]}</span>
                    <DotRating
                      value={character.skills[category][skill]}
                      max={5}
                      min={0}
                      onChange={(value) => updateSkill(category, skill, value)}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Traits (Backgrounds, Merits, Flaws) */}
      {step === 4 && (
        <div className="create-form">
          <h3>Traits</h3>
          <p className="form-hint">
            Add Backgrounds, Merits, and Flaws to define your character. 
            Backgrounds represent your resources and connections. 
            Merits are advantages. Flaws are disadvantages that add depth.
          </p>
          
          <TraitSelector
            selectedTraits={character.traits || []}
            onChange={(traits) => setCharacter(prev => ({ ...prev, traits }))}
          />
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="create-form review-form">
          <h3>Review Your Hunter</h3>
          
          <div className="review-card">
            <div className="review-avatar">
              {character.identity.portraitUrl ? (
                <img src={character.identity.portraitUrl} alt={character.identity.name} />
              ) : (
                <span>{character.identity.name?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="review-info">
              <h4>{character.identity.name}</h4>
              <p>{character.identity.concept || 'Hunter'}</p>
              {character.identity.occupation && <p className="occupation-text">{character.identity.occupation}</p>}
              {character.biography?.age && <p className="age-text">Age: {character.biography.age}</p>}
              {character.identity.creed && <p className="creed-badge">{character.identity.creed}</p>}
            </div>
          </div>

          <div className="review-section">
            <h5>Core Stats</h5>
            <div className="review-stats-row">
              <div className="review-stat-box">
                <span className="stat-name">Health</span>
                <span className="stat-value">{character.health.max}</span>
              </div>
              <div className="review-stat-box">
                <span className="stat-name">Willpower</span>
                <span className="stat-value">{character.willpower.max}</span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h5>Attributes ({totalAttributeDots} dots)</h5>
            <div className="review-attributes">
              {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
                <div key={category} className="review-attr-group">
                  <span className="review-group-label">{label}:</span>
                  {attrs.map(attr => (
                    <span key={attr} className="review-attr">
                      {ATTRIBUTE_LABELS[attr].substring(0, 3)} {character.attributes[category][attr]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="review-section">
            <h5>Skills ({totalSkillDots} dots)</h5>
            <div className="review-skills">
              {Object.entries(SKILLS).map(([category, { skills }]) => 
                skills.filter(skill => character.skills[category][skill] > 0).map(skill => (
                  <span key={skill} className="review-skill">
                    {SKILL_LABELS[skill]} ●{character.skills[category][skill]}
                  </span>
                ))
              )}
              {totalSkillDots === 0 && <span className="no-skills">No skills assigned</span>}
            </div>
          </div>

          {character.traits && character.traits.length > 0 && (
            <div className="review-section">
              <h5>Traits ({character.traits.length})</h5>
              <TraitsDisplay traits={character.traits} compact />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="create-nav">
        {step > 1 && (
          <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
            <ArrowLeftIcon size={16} /> Back
          </button>
        )}
        {step < 5 ? (
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
            Create Hunter
          </button>
        )}
      </div>
    </div>
  );
}

// Main Onboarding Component
function CharacterOnboarding({ onComplete, onSelectDM }) {
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
    dmMode.setDM(false); // Ensure DM mode is off when selecting a character
    onComplete(character);
  };

  const handleSelectDM = () => {
    dmMode.setDM(true);
    if (onSelectDM) {
      onSelectDM();
    }
  };

  const handleCreateNew = () => {
    setCurrentStep('create');
  };

  const handleCharacterCreated = (character) => {
    database.setCurrentCharacter(character.id);
    dmMode.setDM(false); // Ensure DM mode is off when creating a character
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
            onSelectDM={handleSelectDM}
            hasCharacters={characters.length > 0}
          />
        )}
        
        {currentStep === 'select' && (
          <SelectCharacterStep
            characters={characters}
            onSelect={handleSelectCharacter}
            onCreate={handleCreateNew}
            onDelete={handleDeleteCharacter}
            onSelectDM={handleSelectDM}
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
