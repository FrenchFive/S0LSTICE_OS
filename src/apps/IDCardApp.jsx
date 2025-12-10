import { useState, useEffect } from 'react';
import './IDCardApp.css';
import { database as db, secretIdentityDatabase } from '../utils/database';
import { DotRating, DamageTrack, DesperationTracker } from '../components/DotRating';
import {
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  getAttributeValue
} from '../utils/huntersData';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  UserIcon
} from '../components/icons/Icons';

export default function IDCardApp() {
  const [character, setCharacter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState('');
  
  // Fake Identity State
  const [identities, setIdentities] = useState([]);
  const [activeIdentityId, setActiveIdentityId] = useState(null);
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState(null);
  const [identityForm, setIdentityForm] = useState({
    name: '',
    type: 'disguise',
    occupation: '',
    coverStory: ''
  });

  const loadCharacter = () => {
    const currentCharId = db.getCurrentCharacterId();
    if (currentCharId) {
      const char = db.getCharacter(currentCharId);
      if (char) {
        setCharacter(char);
        setHistory(char.biography?.history || char.backstory || '');
        
        // Load identities
        const ids = secretIdentityDatabase.getIdentities(currentCharId);
        setIdentities(ids);
        
        // Find active identity
        const active = ids.find(i => i.active);
        setActiveIdentityId(active?.id || null);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCharacter();
  }, []);

  const handleSaveHistory = () => {
    if (character) {
      const updated = {
        ...character,
        biography: {
          ...character.biography,
          history
        }
      };
      db.saveCharacter(updated);
      setCharacter(updated);
      setIsEditing(false);
    }
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

  const handleEditIdentity = (identity) => {
    setIdentityForm({
      name: identity.name,
      type: identity.type,
      occupation: identity.occupation || '',
      coverStory: identity.coverStory || ''
    });
    setEditingIdentity(identity);
    setShowIdentityForm(true);
  };

  const handleDeleteIdentity = (identityId) => {
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
          type: activeIdentity.type
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

  if (!character) {
    return (
      <div className="id-card-app">
        <div className="no-character">
          <p>No Hunter selected</p>
          <p>Go to Character app to select or create one</p>
        </div>
      </div>
    );
  }

  const displayedIdentity = getDisplayedIdentity();

  return (
    <div className="id-card-app">
      <div className="id-card">
        <div className="id-card-header">
          <h2>🪪 Hunter ID</h2>
          {displayedIdentity.isFake && (
            <span className={`identity-badge ${displayedIdentity.type}`}>
              {displayedIdentity.type === 'disguise' ? '🎭 Disguised' : '🕵️ Cover Identity'}
            </span>
          )}
          {getCreed() && !displayedIdentity.isFake && (
            <span className="creed-badge">{getCreed()}</span>
          )}
        </div>

        <div className="id-card-body">
          <div className="id-photo-section">
            {getImage() ? (
              <img src={getImage()} alt={displayedIdentity.name} className="id-photo" />
            ) : (
              <div className="id-photo-placeholder">
                {displayedIdentity.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="id-info-section">
            <div className="id-field">
              <label>Name:</label>
              <div className="id-value">{displayedIdentity.name}</div>
            </div>

            {(displayedIdentity.occupation || getOccupation()) && (
              <div className="id-field">
                <label>Occupation:</label>
                <div className="id-value">{displayedIdentity.occupation || getOccupation()}</div>
              </div>
            )}

            {getAge() && !displayedIdentity.isFake && (
              <div className="id-field">
                <label>Age:</label>
                <div className="id-value">{getAge()}</div>
              </div>
            )}

            {getConcept() && !displayedIdentity.isFake && (
              <div className="id-field">
                <label>Concept:</label>
                <div className="id-value">{getConcept()}</div>
              </div>
            )}

            {getDrive() && !displayedIdentity.isFake && (
              <div className="id-field">
                <label>Drive:</label>
                <div className="id-value">{getDrive()}</div>
              </div>
            )}

            {getCell() && !displayedIdentity.isFake && (
              <div className="id-field">
                <label>Cell:</label>
                <div className="id-value">{getCell()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Attributes Display */}
        {character.attributes && !displayedIdentity.isFake && (
          <div className="attributes-section">
            <h3>Attributes</h3>
            <div className="attributes-display">
              {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
                <div key={category} className="attr-category">
                  <h4>{label}</h4>
                  {attrs.map(attr => (
                    <div key={attr} className="attr-item">
                      <span className="attr-name">{ATTRIBUTE_LABELS[attr]}</span>
                      <DotRating 
                        value={getAttributeValue(character, attr)} 
                        max={5}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health & Willpower */}
        {character.health && character.willpower && !displayedIdentity.isFake && (
          <div className="vitals-section">
            <div className="vital-track">
              <DamageTrack
                max={character.health.max || 7}
                superficial={character.health.superficial || 0}
                aggravated={character.health.aggravated || 0}
                label="Health"
                variant="health"
              />
            </div>
            <div className="vital-track">
              <DamageTrack
                max={character.willpower.max || 5}
                superficial={character.willpower.superficial || 0}
                aggravated={character.willpower.aggravated || 0}
                label="Willpower"
                variant="willpower"
              />
            </div>
          </div>
        )}

        {/* Desperation */}
        {character.desperation && !displayedIdentity.isFake && (
          <div className="desperation-section">
            <DesperationTracker
              pool={character.desperation.pool || 0}
              danger={character.desperation.danger || 0}
              despair={character.desperation.despair || false}
              compact
            />
          </div>
        )}
      </div>

      {/* Fake Identities Section */}
      <div className="identities-section">
        <div className="section-header">
          <h3>🎭 Identities & Disguises</h3>
          <button 
            className="btn-add-identity"
            onClick={() => setShowIdentityForm(true)}
          >
            <PlusIcon size={16} /> Add
          </button>
        </div>

        {/* Identity Switcher */}
        <div className="identity-switcher">
          <button
            className={`identity-option ${!activeIdentityId ? 'active' : ''}`}
            onClick={() => handleSetActiveIdentity(null)}
          >
            <UserIcon size={16} />
            <span>Real Identity</span>
            {!activeIdentityId && <CheckIcon size={14} />}
          </button>
          
          {identities.map(identity => (
            <div key={identity.id} className="identity-item">
              <button
                className={`identity-option ${activeIdentityId === identity.id ? 'active' : ''}`}
                onClick={() => handleSetActiveIdentity(identity.id)}
              >
                <span className="identity-icon">
                  {identity.type === 'disguise' ? '🎭' : '🕵️'}
                </span>
                <span className="identity-name">{identity.name}</span>
                {activeIdentityId === identity.id && <CheckIcon size={14} />}
              </button>
              <div className="identity-actions">
                <button 
                  className="btn-icon"
                  onClick={() => handleEditIdentity(identity)}
                  title="Edit"
                >
                  <EditIcon size={14} />
                </button>
                <button 
                  className="btn-icon btn-danger"
                  onClick={() => handleDeleteIdentity(identity.id)}
                  title="Delete"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Identity Form */}
        {showIdentityForm && (
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
        )}

        {identities.length === 0 && !showIdentityForm && (
          <div className="no-identities">
            <p>No fake identities yet.</p>
            <p className="hint">Create disguises or cover identities for undercover work.</p>
          </div>
        )}
      </div>

      {/* History/Backstory Section */}
      <div className="backstory-section">
        <div className="section-header">
          <h3>📖 History</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              ✏️ Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="backstory-editor">
            <textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="Write your hunter's history here..."
              className="backstory-textarea"
              rows={10}
            />
            <div className="editor-actions">
              <button onClick={handleSaveHistory} className="btn-save">
                💾 Save
              </button>
              <button onClick={() => { setIsEditing(false); setHistory(character.biography?.history || ''); }} className="btn-cancel">
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="backstory-display">
            {history || 'No history yet. Click Edit to add one!'}
          </div>
        )}
      </div>
    </div>
  );
}
