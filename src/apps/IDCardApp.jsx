import { useState, useEffect, useRef } from 'react';
import './IDCardApp.css';
import { database as db, secretIdentityDatabase } from '../utils/database';
import { DotRating, DamageTrack, DesperationTracker } from '../components/DotRating';
import { getTraitById } from '../data/huntersTraits';
import LevelUpModal from '../components/LevelUpModal';
import CharacterEditor from '../components/CharacterEditor';
import {
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  SKILLS,
  SKILL_LABELS,
  getAttributeValue,
  getSkillValue,
  calculateHealth,
  calculateWillpower
} from '../utils/huntersData';
import {
  calculateLevel,
  getAvailableXP,
  getRecentChanges
} from '../utils/levelUp';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  UserIcon,
  StarIcon,
  ChevronDownIcon
} from '../components/icons/Icons';

// Arrow up icon for level up
const ArrowUpIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

// Chevron icon fallback
const ChevronIcon = ChevronDownIcon || (({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
));

/**
 * TraitWithTooltip - A trait display with hover tooltip
 */
function TraitWithTooltip({ trait }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  
  const data = getTraitById(trait.id);
  if (!data) return null;

  const currentLevelData = data.levels?.find(l => l.level === trait.level);

  return (
    <div 
      className={`trait-with-tooltip ${data.type}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(true)}
      onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
    >
      <div className="trait-badge">
        <span className="trait-name">{data.name}</span>
        {trait.level && <span className="trait-dots">●{trait.level}</span>}
        {trait.detail && (
          <span className="trait-detail">
            ({Array.isArray(trait.detail) ? trait.detail.join(', ') : trait.detail})
          </span>
        )}
      </div>
      
      {showTooltip && (
        <div className="trait-tooltip" ref={tooltipRef}>
          <div className="tooltip-header">
            <span className={`tooltip-type ${data.type}`}>
              {data.type === 'background' ? 'Background' : data.type === 'merit' ? 'Merit' : 'Flaw'}
            </span>
            <span className="tooltip-name">{data.name}</span>
          </div>
          <p className="tooltip-description">{data.description}</p>
          {currentLevelData && (
            <div className="tooltip-level-info">
              <span className="tooltip-level-label">{currentLevelData.label}</span>
              <p className="tooltip-effect"><strong>Effect:</strong> {currentLevelData.effect}</p>
            </div>
          )}
          {data.notes && (
            <p className="tooltip-notes"><em>{data.notes}</em></p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * TraitsDisplayWithTooltips - Display traits with hover tooltips
 */
function TraitsDisplayWithTooltips({ traits = [] }) {
  if (!traits || traits.length === 0) {
    return (
      <div className="traits-display-tooltips empty">
        <p>No traits</p>
      </div>
    );
  }

  const backgrounds = traits.filter(t => getTraitById(t.id)?.type === 'background');
  const merits = traits.filter(t => getTraitById(t.id)?.type === 'merit');
  const flaws = traits.filter(t => getTraitById(t.id)?.type === 'flaw');

  return (
    <div className="traits-display-tooltips">
      {backgrounds.length > 0 && (
        <div className="trait-group">
          <h4>Backgrounds</h4>
          <div className="traits-list">
            {backgrounds.map(trait => (
              <TraitWithTooltip key={trait.id} trait={trait} />
            ))}
          </div>
        </div>
      )}
      {merits.length > 0 && (
        <div className="trait-group">
          <h4>Merits</h4>
          <div className="traits-list">
            {merits.map(trait => (
              <TraitWithTooltip key={trait.id} trait={trait} />
            ))}
          </div>
        </div>
      )}
      {flaws.length > 0 && (
        <div className="trait-group">
          <h4>Flaws</h4>
          <div className="traits-list">
            {flaws.map(trait => (
              <TraitWithTooltip key={trait.id} trait={trait} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EditableField - Inline editable field component
 */
function EditableField({ label, value, onSave, type = 'text', placeholder = '' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditValue(value || '');
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="editable-field editing">
        <label>{label}:</label>
        <div className="edit-input-wrapper">
          {type === 'textarea' ? (
            <textarea
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={3}
            />
          ) : (
            <input
              ref={inputRef}
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
            />
          )}
          <div className="edit-actions">
            <button className="btn-save-field" onClick={handleSave} title="Save">
              <CheckIcon size={14} />
            </button>
            <button className="btn-cancel-field" onClick={() => { setEditValue(value || ''); setIsEditing(false); }} title="Cancel">
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editable-field" onClick={() => setIsEditing(true)}>
      <label>{label}:</label>
      <div className="field-value">
        {value || <span className="placeholder">{placeholder || 'Click to edit'}</span>}
        <EditIcon size={12} className="edit-hint" />
      </div>
    </div>
  );
}

export default function IDCardApp({ character: propCharacter, onUpdate, onSelectCharacter }) {
  const [character, setCharacter] = useState(propCharacter || null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);
  const [recentChanges, setRecentChanges] = useState([]);
  
  // Identity dropdown state
  const [identities, setIdentities] = useState([]);
  const [activeIdentityId, setActiveIdentityId] = useState(null);
  const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState(null);
  const [identityForm, setIdentityForm] = useState({
    name: '',
    type: 'disguise',
    occupation: '',
    coverStory: ''
  });

  // Stats expansion state
  const [expandedStats, setExpandedStats] = useState(false);

  const loadCharacter = () => {
    const currentCharId = db.getCurrentCharacterId();
    if (currentCharId) {
      const char = db.getCharacter(currentCharId);
      if (char) {
        setCharacter(char);
        
        // Load identities
        const ids = secretIdentityDatabase.getIdentities(currentCharId);
        setIdentities(ids);
        
        // Find active identity
        const active = ids.find(i => i.active);
        setActiveIdentityId(active?.id || null);
        
        // Get recent changes for highlighting
        setRecentChanges(getRecentChanges(char, 48));
      }
    }
  };

  useEffect(() => {
    if (propCharacter) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCharacter(propCharacter);
      const ids = secretIdentityDatabase.getIdentities(propCharacter.id);
      setIdentities(ids);
      const active = ids.find(i => i.active);
      setActiveIdentityId(active?.id || null);
      setRecentChanges(getRecentChanges(propCharacter, 48));
    } else {
      loadCharacter();
    }
  }, [propCharacter]);

  const handleCharacterUpdate = (updated) => {
    // Recalculate derived stats
    const withDerived = {
      ...updated,
      health: { ...updated.health, max: calculateHealth(updated) },
      willpower: { ...updated.willpower, max: calculateWillpower(updated) }
    };
    
    db.saveCharacter(withDerived);
    setCharacter(withDerived);
    setRecentChanges(getRecentChanges(withDerived, 48));
    if (onUpdate) onUpdate(withDerived);
  };

  const handleFieldUpdate = (field, value) => {
    if (!character) return;
    
    const fieldParts = field.split('.');
    let updated = { ...character };
    
    if (fieldParts.length === 1) {
      updated[field] = value;
    } else if (fieldParts.length === 2) {
      updated[fieldParts[0]] = {
        ...updated[fieldParts[0]],
        [fieldParts[1]]: value
      };
    }
    
    handleCharacterUpdate(updated);
  };

  const handleEditorSave = (updated) => {
    setCharacter(updated);
    setShowCharacterEditor(false);
    setRecentChanges(getRecentChanges(updated, 48));
    if (onUpdate) onUpdate(updated);
  };

  // Health and Willpower handlers
  const handleHealthChange = (damage) => {
    if (!character) return;
    const updated = {
      ...character,
      health: {
        ...character.health,
        superficial: damage.superficial,
        aggravated: damage.aggravated
      }
    };
    handleCharacterUpdate(updated);
  };

  const handleWillpowerChange = (damage) => {
    if (!character) return;
    const updated = {
      ...character,
      willpower: {
        ...character.willpower,
        superficial: damage.superficial,
        aggravated: damage.aggravated
      }
    };
    handleCharacterUpdate(updated);
  };

  const handleDesperationChange = (desperation) => {
    if (!character) return;
    const updated = {
      ...character,
      desperation
    };
    handleCharacterUpdate(updated);
  };

  // Identity Management
  const handleSaveIdentity = () => {
    if (!character || !identityForm.name.trim()) return;
    
    const identity = {
      ...identityForm,
      id: editingIdentity?.id
    };
    
    secretIdentityDatabase.saveIdentity(character.id, identity);
    
    // Refresh identities
    const ids = secretIdentityDatabase.getIdentities(character.id);
    setIdentities(ids);
    
    // Reset form
    setShowIdentityForm(false);
    setEditingIdentity(null);
    setIdentityForm({ name: '', type: 'disguise', occupation: '', coverStory: '' });
  };

  const handleEditIdentity = (identity, e) => {
    e?.stopPropagation();
    setIdentityForm({
      name: identity.name,
      type: identity.type,
      occupation: identity.occupation || '',
      coverStory: identity.coverStory || ''
    });
    setEditingIdentity(identity);
    setShowIdentityForm(true);
    setShowIdentityDropdown(false);
  };

  const handleDeleteIdentity = (identityId, e) => {
    e?.stopPropagation();
    if (!character) return;
    secretIdentityDatabase.deleteIdentity(character.id, identityId);
    
    // If we deleted the active one, clear it
    if (activeIdentityId === identityId) {
      setActiveIdentityId(null);
    }
    
    // Refresh
    const ids = secretIdentityDatabase.getIdentities(character.id);
    setIdentities(ids);
  };

  const handleSetActiveIdentity = (identityId) => {
    if (!character) return;
    
    if (identityId === null) {
      secretIdentityDatabase.clearActiveIdentity(character.id);
      setActiveIdentityId(null);
    } else {
      secretIdentityDatabase.setActiveIdentity(character.id, identityId);
      setActiveIdentityId(identityId);
    }
    
    // Refresh
    const ids = secretIdentityDatabase.getIdentities(character.id);
    setIdentities(ids);
    setShowIdentityDropdown(false);
  };

  const handleCancelIdentityForm = () => {
    setShowIdentityForm(false);
    setEditingIdentity(null);
    setIdentityForm({ name: '', type: 'disguise', occupation: '', coverStory: '' });
  };

  // Handle both old and new character formats
  const getName = () => character?.identity?.name || character?.name || 'Unknown';
  const getImage = () => character?.identity?.portraitUrl || character?.image || null;
  const getConcept = () => character?.identity?.concept || '';
  const getCreed = () => character?.identity?.creed || '';
  const getDrive = () => character?.identity?.drive || '';
  const getCell = () => character?.identity?.cell || '';
  const getOccupation = () => character?.identity?.occupation || '';
  const getAge = () => character?.biography?.age || null;

  // Get displayed identity (real or fake)
  const getDisplayedIdentity = () => {
    if (activeIdentityId) {
      const activeIdentity = identities.find(i => i.id === activeIdentityId);
      if (activeIdentity) {
        return {
          name: activeIdentity.name,
          occupation: activeIdentity.occupation,
          isFake: true,
          type: activeIdentity.type,
          coverStory: activeIdentity.coverStory
        };
      }
    }
    return {
      name: getName(),
      occupation: getOccupation(),
      isFake: false,
      type: 'real'
    };
  };

  // Check if a field was recently changed
  const isHighlighted = (fieldPath) => {
    return recentChanges.some(change => change.field === fieldPath);
  };

  // Get XP info
  const xpInfo = character?.experience ? {
    level: calculateLevel(character.experience.total || 0),
    available: getAvailableXP(character),
    total: character.experience.total || 0
  } : { level: { level: 1, title: 'Fledgling Hunter' }, available: 0, total: 0 };

  if (!character) {
    return (
      <div className="identity-app">
        <div className="no-character">
          <UserIcon size={48} />
          <p>No Hunter selected</p>
          <p className="hint">Select or create a character to view their identity</p>
          {onSelectCharacter && (
            <button className="btn btn-primary" onClick={onSelectCharacter}>
              <UserIcon size={16} /> Select Character
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show character editor if requested
  if (showCharacterEditor) {
    return (
      <div className="identity-app">
        <CharacterEditor
          character={character}
          onSave={handleEditorSave}
          onCancel={() => setShowCharacterEditor(false)}
          isNew={false}
        />
      </div>
    );
  }

  const displayedIdentity = getDisplayedIdentity();
  const healthMax = character.health?.max || calculateHealth(character) || 7;
  const willpowerMax = character.willpower?.max || calculateWillpower(character) || 5;

  return (
    <div className="identity-app">
      {/* Identity Header with Name Dropdown */}
      <div className="identity-header">
        <div className="identity-name-dropdown" onClick={() => setShowIdentityDropdown(!showIdentityDropdown)}>
          <div className="current-identity">
            {displayedIdentity.isFake && (
              <span className="identity-type-icon">
                {displayedIdentity.type === 'disguise' ? '🎭' : '🕵️'}
              </span>
            )}
            <h1 className="identity-name">{displayedIdentity.name}</h1>
            <ChevronIcon size={20} className={`dropdown-chevron ${showIdentityDropdown ? 'open' : ''}`} />
          </div>
          {displayedIdentity.isFake && (
            <span className={`identity-badge-small ${displayedIdentity.type}`}>
              {displayedIdentity.type === 'disguise' ? 'Disguised' : 'Cover Identity'}
            </span>
          )}
        </div>

        {/* Identity Dropdown Menu */}
        {showIdentityDropdown && (
          <div className="identity-dropdown-menu">
            {/* Real Identity Option */}
            <div
              className={`identity-option ${!activeIdentityId ? 'active' : ''}`}
              onClick={() => handleSetActiveIdentity(null)}
            >
              <UserIcon size={18} />
              <div className="identity-option-info">
                <span className="identity-option-name">{getName()}</span>
                <span className="identity-option-type">Real Identity</span>
              </div>
              {!activeIdentityId && <CheckIcon size={16} className="check-icon" />}
            </div>

            {/* Fake Identities */}
            {identities.length > 0 && (
              <div className="identity-divider">
                <span>Disguises & Covers</span>
              </div>
            )}
            
            {identities.map(identity => (
              <div
                key={identity.id}
                className={`identity-option ${activeIdentityId === identity.id ? 'active' : ''}`}
                onClick={() => handleSetActiveIdentity(identity.id)}
              >
                <span className="identity-type-icon">
                  {identity.type === 'disguise' ? '🎭' : '🕵️'}
                </span>
                <div className="identity-option-info">
                  <span className="identity-option-name">{identity.name}</span>
                  <span className="identity-option-type">
                    {identity.type === 'disguise' ? 'Disguise' : 'Secret Identity'}
                  </span>
                </div>
                <div className="identity-option-actions">
                  <button 
                    className="btn-icon-small"
                    onClick={(e) => handleEditIdentity(identity, e)}
                    title="Edit"
                  >
                    <EditIcon size={12} />
                  </button>
                  <button 
                    className="btn-icon-small danger"
                    onClick={(e) => handleDeleteIdentity(identity.id, e)}
                    title="Delete"
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
                {activeIdentityId === identity.id && <CheckIcon size={16} className="check-icon" />}
              </div>
            ))}

            {/* Add New Identity Button */}
            <div className="identity-add-section">
              <button 
                className="btn-add-new-identity"
                onClick={() => { setShowIdentityForm(true); setShowIdentityDropdown(false); }}
              >
                <PlusIcon size={16} /> Add Disguise / Identity
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar */}
      <div className="quick-action-bar">
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => setShowCharacterEditor(true)}
        >
          <EditIcon size={14} /> Edit Full Profile
        </button>
        <button 
          className={`btn btn-sm ${xpInfo.available > 0 ? 'btn-success level-up-pulse' : 'btn-outline'}`}
          onClick={() => setShowLevelUp(true)}
        >
          <ArrowUpIcon size={14} /> 
          Level Up
          {xpInfo.available > 0 && <span className="xp-badge">{xpInfo.available} XP</span>}
        </button>
      </div>

      {/* XP Progress Display */}
      {character.experience && (
        <div className="xp-display-card">
          <div className="xp-level-info">
            <span className="level-badge">Lvl {xpInfo.level.level}</span>
            <span className="level-title">{xpInfo.level.title}</span>
          </div>
          <div className="xp-numbers">
            <span className="available-xp">{xpInfo.available} XP available</span>
            <span className="total-xp">{xpInfo.total} total</span>
          </div>
        </div>
      )}

      {/* Recent Changes Highlight */}
      {recentChanges.length > 0 && (
        <div className="recent-changes-banner">
          <StarIcon size={16} />
          <span>{recentChanges.length} recent upgrade{recentChanges.length > 1 ? 's' : ''}!</span>
          <div className="recent-changes-list">
            {recentChanges.slice(0, 3).map((change, i) => (
              <span key={i} className="recent-change-item">{change.description}</span>
            ))}
          </div>
        </div>
      )}

      {/* Main Identity Card */}
      <div className="identity-card">
        <div className="identity-card-body">
          <div className="identity-photo-section">
            {getImage() ? (
              <img src={getImage()} alt={displayedIdentity.name} className="identity-photo" />
            ) : (
              <div className="identity-photo-placeholder">
                {displayedIdentity.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="identity-info-section">
            {!displayedIdentity.isFake ? (
              <>
                <EditableField
                  label="Name"
                  value={getName()}
                  onSave={(val) => handleFieldUpdate('identity.name', val)}
                  placeholder="Enter name"
                />
                <EditableField
                  label="Occupation"
                  value={getOccupation()}
                  onSave={(val) => handleFieldUpdate('identity.occupation', val)}
                  placeholder="Enter occupation"
                />
                <EditableField
                  label="Age"
                  value={getAge()}
                  onSave={(val) => handleFieldUpdate('biography.age', val)}
                  type="number"
                  placeholder="Enter age"
                />
                <EditableField
                  label="Concept"
                  value={getConcept()}
                  onSave={(val) => handleFieldUpdate('identity.concept', val)}
                  placeholder="Enter concept"
                />
                <EditableField
                  label="Creed"
                  value={getCreed()}
                  onSave={(val) => handleFieldUpdate('identity.creed', val)}
                  placeholder="Enter creed"
                />
                <EditableField
                  label="Drive"
                  value={getDrive()}
                  onSave={(val) => handleFieldUpdate('identity.drive', val)}
                  placeholder="Enter drive"
                />
                <EditableField
                  label="Cell"
                  value={getCell()}
                  onSave={(val) => handleFieldUpdate('identity.cell', val)}
                  placeholder="Enter cell name"
                />
              </>
            ) : (
              <>
                <div className="fake-identity-notice">
                  <span className="notice-icon">{displayedIdentity.type === 'disguise' ? '🎭' : '🕵️'}</span>
                  <span>Currently displaying {displayedIdentity.type === 'disguise' ? 'disguise' : 'cover identity'}</span>
                </div>
                <div className="id-field">
                  <label>Name:</label>
                  <div className="id-value">{displayedIdentity.name}</div>
                </div>
                {displayedIdentity.occupation && (
                  <div className="id-field">
                    <label>Occupation:</label>
                    <div className="id-value">{displayedIdentity.occupation}</div>
                  </div>
                )}
                {displayedIdentity.coverStory && (
                  <div className="id-field cover-story">
                    <label>Cover Story:</label>
                    <div className="id-value">{displayedIdentity.coverStory}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Health & Willpower */}
        {character.health && character.willpower && (
          <div className="vitals-section">
            <div className="vital-track">
              <DamageTrack
                max={healthMax}
                superficial={character.health.superficial || 0}
                aggravated={character.health.aggravated || 0}
                onChange={handleHealthChange}
                label="Health"
                variant="health"
              />
            </div>
            <div className="vital-track">
              <DamageTrack
                max={willpowerMax}
                superficial={character.willpower.superficial || 0}
                aggravated={character.willpower.aggravated || 0}
                onChange={handleWillpowerChange}
                label="Willpower"
                variant="willpower"
              />
            </div>
          </div>
        )}

        {/* Desperation */}
        {character.desperation && (
          <div className="desperation-section">
            <DesperationTracker
              pool={character.desperation.pool || 0}
              danger={character.desperation.danger || 0}
              despair={character.desperation.despair || false}
              onChange={handleDesperationChange}
              compact
            />
          </div>
        )}

        {/* Traits Display with Tooltips */}
        {character.traits && character.traits.length > 0 && (
          <div className="traits-section">
            <h3>Traits <span className="trait-hint">(hover for details)</span></h3>
            <TraitsDisplayWithTooltips traits={character.traits} />
          </div>
        )}
      </div>

      {/* Stats Section (Attributes & Skills) */}
      <div className="stats-section">
        <div 
          className="stats-header-toggle"
          onClick={() => setExpandedStats(!expandedStats)}
        >
          <h3>📊 Attributes & Skills</h3>
          <ChevronIcon size={20} className={`toggle-chevron ${expandedStats ? 'open' : ''}`} />
        </div>

        {expandedStats && (
          <div className="stats-content">
            {/* Attributes */}
            {character.attributes && (
              <div className="attributes-grid">
                {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
                  <div key={category} className="attr-category">
                    <h4>{label}</h4>
                    {attrs.map(attr => {
                      const fieldPath = `attributes.${category}.${attr}`;
                      const highlighted = isHighlighted(fieldPath);
                      return (
                        <div key={attr} className={`attr-item ${highlighted ? 'highlighted' : ''}`}>
                          <span className="attr-name">{ATTRIBUTE_LABELS[attr]}</span>
                          <DotRating 
                            value={getAttributeValue(character, attr)} 
                            max={5}
                            size="sm"
                          />
                          {highlighted && <span className="highlight-badge">NEW</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {character.skills && (
              <div className="skills-grid">
                <h4 className="skills-header">Skills</h4>
                {Object.entries(SKILLS).map(([category, { label, skills }]) => (
                  <div key={category} className="skill-category">
                    <h5>{label}</h5>
                    {skills.map(skill => {
                      const value = getSkillValue(character, skill);
                      const fieldPath = `skills.${category}.${skill}`;
                      const highlighted = isHighlighted(fieldPath);
                      if (value === 0 && !highlighted) return null; // Only show trained skills
                      return (
                        <div key={skill} className={`skill-item ${highlighted ? 'highlighted' : ''}`}>
                          <span className="skill-name">{SKILL_LABELS[skill]}</span>
                          <DotRating 
                            value={value} 
                            max={5}
                            size="sm"
                          />
                          {highlighted && <span className="highlight-badge">NEW</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Identity Form Modal */}
      {showIdentityForm && (
        <div className="identity-form-overlay">
          <div className="identity-form">
            <h4>{editingIdentity ? 'Edit Identity' : 'Create New Identity'}</h4>
            
            <div className="form-group">
              <label>Type</label>
              <select
                className="input"
                value={identityForm.type}
                onChange={(e) => setIdentityForm({ ...identityForm, type: e.target.value })}
              >
                <option value="disguise">Disguise (Temporary)</option>
                <option value="secret_identity">Secret Identity (Long-term)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                className="input"
                value={identityForm.name}
                onChange={(e) => setIdentityForm({ ...identityForm, name: e.target.value })}
                placeholder="Fake name"
              />
            </div>

            <div className="form-group">
              <label>Fake Occupation</label>
              <input
                type="text"
                className="input"
                value={identityForm.occupation}
                onChange={(e) => setIdentityForm({ ...identityForm, occupation: e.target.value })}
                placeholder="Cover job"
              />
            </div>

            <div className="form-group">
              <label>Cover Story</label>
              <textarea
                className="input"
                value={identityForm.coverStory}
                onChange={(e) => setIdentityForm({ ...identityForm, coverStory: e.target.value })}
                placeholder="Background story for this identity..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-outline" onClick={handleCancelIdentityForm}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveIdentity}
                disabled={!identityForm.name.trim()}
              >
                {editingIdentity ? 'Save Changes' : 'Create Identity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          character={character}
          onUpdate={handleCharacterUpdate}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {/* Click outside to close dropdown */}
      {showIdentityDropdown && (
        <div 
          className="dropdown-backdrop" 
          onClick={() => setShowIdentityDropdown(false)}
        />
      )}
    </div>
  );
}
