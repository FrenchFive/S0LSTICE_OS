/**
 * CharacterEditor Component
 * A comprehensive character editor for editing all aspects of a Hunters character
 * Used in both creation and edit modes
 */
import { useState, useEffect } from 'react';
import { database } from '../utils/database';
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
import { 
  getAvailableXP, 
  calculateLevel
} from '../utils/levelUp';
import { DotRating } from './DotRating';
import { TraitSelector, TraitsDisplay } from './TraitSelector';
import { getTraitById } from '../data/huntersTraits';
import {
  UserIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EditIcon,
  CheckIcon,
  SaveIcon
} from './icons/Icons';
import './CharacterEditor.css';

// Tabs for navigation
const EDITOR_TABS = [
  { id: 'identity', label: 'Identity', icon: '🪪' },
  { id: 'attributes', label: 'Attributes', icon: '💪' },
  { id: 'skills', label: 'Skills', icon: '🎯' },
  { id: 'traits', label: 'Traits', icon: '⭐' },
  { id: 'biography', label: 'Biography', icon: '📖' }
];

/**
 * Identity Tab Content
 */
function IdentityTab({ character, onChange }) {
  const updateIdentity = (field, value) => {
    onChange({
      ...character,
      identity: { ...character.identity, [field]: value }
    });
  };

  const updateBiography = (field, value) => {
    onChange({
      ...character,
      biography: { ...character.biography, [field]: value }
    });
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

  return (
    <div className="editor-tab-content">
      <div className="avatar-section">
        <div className="avatar-preview-large">
          {character.identity?.portraitUrl ? (
            <img src={character.identity.portraitUrl} alt="Character" />
          ) : (
            <UserIcon size={64} />
          )}
        </div>
        <div className="avatar-actions">
          <label className="btn btn-outline btn-sm">
            📷 Upload Photo
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              hidden
            />
          </label>
          {character.identity?.portraitUrl && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => updateIdentity('portraitUrl', null)}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="form-section">
        <h4>Basic Info</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Hunter Name *</label>
            <input
              type="text"
              className="input"
              value={character.identity?.name || ''}
              onChange={(e) => updateIdentity('name', e.target.value)}
              placeholder="Enter your hunter's name"
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              className="input"
              value={character.biography?.age || ''}
              onChange={(e) => updateBiography('age', parseInt(e.target.value) || null)}
              placeholder="Age"
              min="0"
              max="150"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Concept</label>
            <input
              type="text"
              className="input"
              value={character.identity?.concept || ''}
              onChange={(e) => updateIdentity('concept', e.target.value)}
              placeholder="e.g., Paranoid Journalist"
            />
          </div>
          <div className="form-group">
            <label>Occupation</label>
            <input
              type="text"
              className="input"
              value={character.identity?.occupation || ''}
              onChange={(e) => updateIdentity('occupation', e.target.value)}
              placeholder="e.g., Private Investigator"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Creed</label>
            <select
              className="input"
              value={character.identity?.creed || ''}
              onChange={(e) => updateIdentity('creed', e.target.value)}
            >
              <option value="">Select Creed...</option>
              {CREEDS.map(creed => (
                <option key={creed.id} value={creed.name}>{creed.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Cell</label>
            <input
              type="text"
              className="input"
              value={character.identity?.cell || ''}
              onChange={(e) => updateIdentity('cell', e.target.value)}
              placeholder="Your hunting group"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Drive</label>
            <input
              type="text"
              className="input"
              value={character.identity?.drive || ''}
              onChange={(e) => updateIdentity('drive', e.target.value)}
              placeholder="What drives you?"
            />
          </div>
          <div className="form-group">
            <label>Pronouns</label>
            <input
              type="text"
              className="input"
              value={character.biography?.pronouns || ''}
              onChange={(e) => updateBiography('pronouns', e.target.value)}
              placeholder="e.g., he/him, she/her, they/them"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ambition</label>
            <input
              type="text"
              className="input"
              value={character.identity?.ambition || ''}
              onChange={(e) => updateIdentity('ambition', e.target.value)}
              placeholder="Long-term goal"
            />
          </div>
          <div className="form-group">
            <label>Desire</label>
            <input
              type="text"
              className="input"
              value={character.identity?.desire || ''}
              onChange={(e) => updateIdentity('desire', e.target.value)}
              placeholder="Immediate want"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Attributes Tab Content
 */
function AttributesTab({ character, onChange }) {
  const updateAttribute = (category, attr, value) => {
    const newChar = {
      ...character,
      attributes: {
        ...character.attributes,
        [category]: {
          ...character.attributes[category],
          [attr]: value
        }
      }
    };
    // Recalculate derived stats
    newChar.health = { ...newChar.health, max: calculateHealth(newChar) };
    newChar.willpower = { ...newChar.willpower, max: calculateWillpower(newChar) };
    onChange(newChar);
  };

  // Count total attribute dots
  const totalAttributeDots = Object.values(character.attributes || {}).reduce((sum, category) => {
    return sum + Object.values(category).reduce((s, v) => s + v, 0);
  }, 0);

  return (
    <div className="editor-tab-content">
      <div className="editor-info-bar">
        <span className="info-label">Total Attribute Dots:</span>
        <span className="info-value">{totalAttributeDots}</span>
        <span className="info-hint">(Starting: 22 points distributed 7/5/3 + 1 each)</span>
      </div>

      <div className="attributes-edit-grid">
        {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
          <div key={category} className="attribute-edit-category">
            <h4 className="category-label">{label}</h4>
            {attrs.map(attr => (
              <div key={attr} className="attribute-edit-row">
                <span className="attr-name">{ATTRIBUTE_LABELS[attr]}</span>
                <DotRating
                  value={character.attributes?.[category]?.[attr] || 1}
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

      <div className="derived-stats-display">
        <div className="derived-stat-card">
          <span className="derived-label">❤️ Health</span>
          <span className="derived-value">{character.health?.max || calculateHealth(character)}</span>
          <span className="derived-calc">(Stamina + 3)</span>
        </div>
        <div className="derived-stat-card">
          <span className="derived-label">🧠 Willpower</span>
          <span className="derived-value">{character.willpower?.max || calculateWillpower(character)}</span>
          <span className="derived-calc">(Composure + Resolve)</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Skills Tab Content
 */
function SkillsTab({ character, onChange }) {
  const updateSkill = (category, skill, value) => {
    onChange({
      ...character,
      skills: {
        ...character.skills,
        [category]: {
          ...character.skills[category],
          [skill]: value
        }
      }
    });
  };

  // Count total skill dots
  const totalSkillDots = Object.values(character.skills || {}).reduce((sum, category) => {
    return sum + Object.values(category).reduce((s, v) => s + v, 0);
  }, 0);

  return (
    <div className="editor-tab-content">
      <div className="editor-info-bar">
        <span className="info-label">Total Skill Dots:</span>
        <span className="info-value">{totalSkillDots}</span>
        <span className="info-hint">(Starting: 27 points distributed 13/9/5)</span>
      </div>

      <div className="skills-edit-grid">
        {Object.entries(SKILLS).map(([category, { label, skills }]) => (
          <div key={category} className="skill-edit-category">
            <h4 className="category-label">{label}</h4>
            {skills.map(skill => (
              <div key={skill} className="skill-edit-row">
                <span className="skill-name">{SKILL_LABELS[skill]}</span>
                <DotRating
                  value={character.skills?.[category]?.[skill] || 0}
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
  );
}

/**
 * Traits Tab Content
 */
function TraitsTab({ character, onChange }) {
  const handleTraitsChange = (traits) => {
    onChange({
      ...character,
      traits
    });
  };

  // Count traits
  const traitCounts = {
    backgrounds: (character.traits || []).filter(t => {
      const data = getTraitById(t.id);
      return data?.type === 'background';
    }).length,
    merits: (character.traits || []).filter(t => {
      const data = getTraitById(t.id);
      return data?.type === 'merit';
    }).length,
    flaws: (character.traits || []).filter(t => {
      const data = getTraitById(t.id);
      return data?.type === 'flaw';
    }).length
  };

  return (
    <div className="editor-tab-content">
      <div className="editor-info-bar traits-info">
        <div className="trait-count-group">
          <span className="trait-count bg">{traitCounts.backgrounds}</span>
          <span>Backgrounds</span>
        </div>
        <div className="trait-count-group">
          <span className="trait-count merit">{traitCounts.merits}</span>
          <span>Merits</span>
        </div>
        <div className="trait-count-group">
          <span className="trait-count flaw">{traitCounts.flaws}</span>
          <span>Flaws</span>
        </div>
      </div>

      <div className="traits-hint">
        <p>
          <strong>Backgrounds</strong> represent your character's resources, connections, and external advantages.
          <strong> Merits</strong> are inherent advantages. <strong>Flaws</strong> are disadvantages that add depth and earn extra experience.
        </p>
      </div>

      <TraitSelector
        selectedTraits={character.traits || []}
        onChange={handleTraitsChange}
      />
    </div>
  );
}

/**
 * Biography Tab Content
 */
function BiographyTab({ character, onChange }) {
  const updateBiography = (field, value) => {
    onChange({
      ...character,
      biography: { ...character.biography, [field]: value }
    });
  };

  return (
    <div className="editor-tab-content">
      <div className="form-section">
        <h4>Appearance</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Apparent Age</label>
            <input
              type="text"
              className="input"
              value={character.biography?.apparentAge || ''}
              onChange={(e) => updateBiography('apparentAge', e.target.value)}
              placeholder="How old do you look?"
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              className="input"
              value={character.biography?.dateOfBirth || ''}
              onChange={(e) => updateBiography('dateOfBirth', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Physical Appearance</label>
          <textarea
            className="input"
            value={character.biography?.appearance || ''}
            onChange={(e) => updateBiography('appearance', e.target.value)}
            placeholder="Describe your character's appearance..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Distinguishing Features</label>
          <input
            type="text"
            className="input"
            value={character.biography?.distinguishingFeatures || ''}
            onChange={(e) => updateBiography('distinguishingFeatures', e.target.value)}
            placeholder="Scars, tattoos, unusual features..."
          />
        </div>
      </div>

      <div className="form-section">
        <h4>History</h4>
        <div className="form-group">
          <label>Character History / Backstory</label>
          <textarea
            className="input"
            value={character.biography?.history || ''}
            onChange={(e) => updateBiography('history', e.target.value)}
            placeholder="Write your character's backstory..."
            rows={8}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            className="input"
            value={character.biography?.notes || ''}
            onChange={(e) => updateBiography('notes', e.target.value)}
            placeholder="Additional notes, goals, secrets..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main Character Editor Component
 */
export default function CharacterEditor({ 
  character: initialCharacter, 
  onSave, 
  onCancel,
  isNew = false 
}) {
  const [character, setCharacter] = useState(() => 
    initialCharacter || createDefaultCharacter()
  );
  const [activeTab, setActiveTab] = useState('identity');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Track changes - calculate without setState in effect
  const computedHasChanges = initialCharacter
    ? JSON.stringify(character) !== JSON.stringify(initialCharacter)
    : !!character.identity?.name;
  
  // Update hasChanges only when computed value differs
  useEffect(() => {
    setHasChanges(computedHasChanges);
  }, [computedHasChanges]);

  const handleChange = (updatedCharacter) => {
    setCharacter(updatedCharacter);
  };

  const handleSave = async () => {
    if (!character.identity?.name?.trim()) {
      return; // Name is required
    }

    setSaving(true);
    
    const finalCharacter = {
      ...character,
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      finalCharacter.createdAt = new Date().toISOString();
    }

    // Save to database
    database.saveCharacter(finalCharacter);
    
    if (onSave) {
      onSave(finalCharacter);
    }
    
    setSaving(false);
  };

  const canSave = character.identity?.name?.trim() && hasChanges;

  // Get XP info for existing characters
  const xpInfo = !isNew && character.experience ? {
    level: calculateLevel(character.experience.total || 0),
    available: getAvailableXP(character),
    total: character.experience.total || 0
  } : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity':
        return <IdentityTab character={character} onChange={handleChange} />;
      case 'attributes':
        return <AttributesTab character={character} onChange={handleChange} />;
      case 'skills':
        return <SkillsTab character={character} onChange={handleChange} />;
      case 'traits':
        return <TraitsTab character={character} onChange={handleChange} />;
      case 'biography':
        return <BiographyTab character={character} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="character-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-title">
          <EditIcon size={24} />
          <h2>{isNew ? 'Create New Hunter' : `Edit: ${character.identity?.name || 'Hunter'}`}</h2>
        </div>
        
        {xpInfo && (
          <div className="editor-xp-badge">
            <span className="xp-level">Lvl {xpInfo.level.level}</span>
            <span className="xp-available">{xpInfo.available} XP</span>
          </div>
        )}
        
        <div className="editor-actions">
          {onCancel && (
            <button className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button 
            className="btn btn-success" 
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? 'Saving...' : (
              <>
                <SaveIcon size={16} /> Save {isNew ? 'Hunter' : 'Changes'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="editor-tabs">
        {EDITOR_TABS.map(tab => (
          <button
            key={tab.id}
            className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="editor-content">
        {renderTabContent()}
      </div>

      {/* Footer Navigation */}
      <div className="editor-footer">
        <div className="editor-nav-buttons">
          {activeTab !== 'identity' && (
            <button 
              className="btn btn-outline"
              onClick={() => {
                const idx = EDITOR_TABS.findIndex(t => t.id === activeTab);
                if (idx > 0) setActiveTab(EDITOR_TABS[idx - 1].id);
              }}
            >
              <ArrowLeftIcon size={16} /> Previous
            </button>
          )}
          {activeTab !== 'biography' && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                const idx = EDITOR_TABS.findIndex(t => t.id === activeTab);
                if (idx < EDITOR_TABS.length - 1) setActiveTab(EDITOR_TABS[idx + 1].id);
              }}
            >
              Next <ArrowRightIcon size={16} />
            </button>
          )}
        </div>
        
        {hasChanges && (
          <span className="unsaved-indicator">● Unsaved changes</span>
        )}
      </div>
    </div>
  );
}

// Export tabs for use in other components
export { IdentityTab, AttributesTab, SkillsTab, TraitsTab, BiographyTab };
