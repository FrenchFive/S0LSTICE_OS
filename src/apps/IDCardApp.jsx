import { useState, useEffect } from 'react';
import './IDCardApp.css';
import { database as db } from '../utils/database';
import { DotRating, DamageTrack, DesperationTracker } from '../components/DotRating';
import {
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  getAttributeValue
} from '../utils/huntersData';

export default function IDCardApp() {
  const [character, setCharacter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState('');

  const loadCharacter = () => {
    const currentCharId = db.getCurrentCharacterId();
    if (currentCharId) {
      const char = db.getCharacter(currentCharId);
      if (char) {
        setCharacter(char);
        setHistory(char.biography?.history || char.backstory || '');
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

  // Handle both old and new character formats
  const getName = () => character.identity?.name || character.name || 'Unknown';
  const getImage = () => character.identity?.portraitUrl || character.image || null;
  const getConcept = () => character.identity?.concept || '';
  const getCreed = () => character.identity?.creed || '';
  const getDrive = () => character.identity?.drive || '';
  const getCell = () => character.identity?.cell || '';

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

  const displayName = getName();

  return (
    <div className="id-card-app">
      <div className="id-card">
        <div className="id-card-header">
          <h2>🪪 Hunter ID</h2>
          {getCreed() && (
            <span className="creed-badge">{getCreed()}</span>
          )}
        </div>

        <div className="id-card-body">
          <div className="id-photo-section">
            {getImage() ? (
              <img src={getImage()} alt={displayName} className="id-photo" />
            ) : (
              <div className="id-photo-placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="id-info-section">
            <div className="id-field">
              <label>Name:</label>
              <div className="id-value">{displayName}</div>
            </div>

            {getConcept() && (
              <div className="id-field">
                <label>Concept:</label>
                <div className="id-value">{getConcept()}</div>
              </div>
            )}

            {getDrive() && (
              <div className="id-field">
                <label>Drive:</label>
                <div className="id-value">{getDrive()}</div>
              </div>
            )}

            {getCell() && (
              <div className="id-field">
                <label>Cell:</label>
                <div className="id-value">{getCell()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Attributes Display */}
        {character.attributes && (
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
        {character.health && character.willpower && (
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
        {character.desperation && (
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
