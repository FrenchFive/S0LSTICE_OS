import { useState, useEffect } from 'react';
import './IDCardApp.css';
import { database as db } from '../utils/database';

export default function IDCardApp() {
  const [character, setCharacter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [backstory, setBackstory] = useState('');

  useEffect(() => {
    loadCharacter();
  }, []);

  const loadCharacter = () => {
    const currentCharId = db.getCurrentCharacterId();
    if (currentCharId) {
      const char = db.getCharacter(currentCharId);
      if (char) {
        setCharacter(char);
        setBackstory(char.backstory || '');
      }
    }
  };

  const handleSaveBackstory = () => {
    if (character) {
      const updated = { ...character, backstory };
      db.saveCharacter(updated);
      setCharacter(updated);
      setIsEditing(false);
    }
  };

  const getModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (mod) => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  if (!character) {
    return (
      <div className="id-card-app">
        <div className="no-character">
          <p>No character selected</p>
          <p>Go to Character app to select or create one</p>
        </div>
      </div>
    );
  }

  const activeIdentity = character.activeIdentity || 'real';
  const displayName = activeIdentity === 'disguise' && character.disguise
    ? character.disguise.name
    : activeIdentity === 'secret' && character.secretIdentity
    ? character.secretIdentity.name
    : character.name;

  return (
    <div className="id-card-app">
      <div className="id-card">
        <div className="id-card-header">
          <h2>🪪 Hunter ID Card</h2>
          {activeIdentity !== 'real' && (
            <span className="identity-badge">{activeIdentity === 'disguise' ? '🎭 Disguised' : '🕵️ Undercover'}</span>
          )}
        </div>

        <div className="id-card-body">
          <div className="id-photo-section">
            {character.image ? (
              <img src={character.image} alt={displayName} className="id-photo" />
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

            <div className="id-field">
              <label>Level:</label>
              <div className="id-value">{character.level}</div>
            </div>

            <div className="id-field">
              <label>HP:</label>
              <div className="id-value">{character.currentHP} / {character.maxHP}</div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">STR</div>
            <div className="stat-value">{character.stats.str}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.str))}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">DEX</div>
            <div className="stat-value">{character.stats.dex}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.dex))}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CON</div>
            <div className="stat-value">{character.stats.con}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.con))}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">INT</div>
            <div className="stat-value">{character.stats.int}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.int))}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">WIS</div>
            <div className="stat-value">{character.stats.wis}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.wis))}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CHA</div>
            <div className="stat-value">{character.stats.cha}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.cha))}</div>
          </div>
        </div>
      </div>

      <div className="backstory-section">
        <div className="section-header">
          <h3>📖 Backstory</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              ✏️ Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="backstory-editor">
            <textarea
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Write your character's backstory here..."
              className="backstory-textarea"
              rows={10}
            />
            <div className="editor-actions">
              <button onClick={handleSaveBackstory} className="btn-save">
                💾 Save
              </button>
              <button onClick={() => { setIsEditing(false); setBackstory(character.backstory || ''); }} className="btn-cancel">
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="backstory-display">
            {backstory || 'No backstory yet. Click Edit to add one!'}
          </div>
        )}
      </div>
    </div>
  );
}
