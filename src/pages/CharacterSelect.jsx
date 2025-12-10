import { useState } from 'react';
import { database, dmMode } from '../utils/database';
import { CrownIcon } from '../components/icons/Icons';
import './CharacterSelect.css';

function CharacterSelect({ onSelectCharacter, onCreateNew, onSelectDM }) {
  // Initialize from database directly to avoid setState in useEffect
  const [characters, setCharacters] = useState(() => database.getAllCharacters());
  const [currentCharacterId] = useState(() => database.getCurrentCharacterId());

  const reloadCharacters = () => {
    const chars = database.getAllCharacters();
    setCharacters(chars);
  };

  const handleSelect = (character) => {
    database.setCurrentCharacter(character.id);
    dmMode.setDM(false); // Ensure DM mode is off when selecting a character
    onSelectCharacter(character);
  };

  const handleSelectDM = () => {
    dmMode.setDM(true);
    if (onSelectDM) {
      onSelectDM();
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      database.deleteCharacter(id);
      reloadCharacters();
    }
  };

  return (
    <div className="character-select">
      <div className="select-header">
        <h1>🎯 Select Your Hunter</h1>
        <div className="header-actions">
          <button className="btn btn-success" onClick={onCreateNew}>
            ✨ Create New Character
          </button>
        </div>
      </div>

      {/* DM Mode Option */}
      <div className="dm-mode-option" onClick={handleSelectDM}>
        <div className="dm-mode-icon">
          <CrownIcon size={48} />
        </div>
        <div className="dm-mode-info">
          <h3>Play as Game Master</h3>
          <p>Run the game, award XP, create encounters, and manage the session.</p>
        </div>
        <div className="dm-mode-arrow">→</div>
      </div>

      {characters.length === 0 ? (
        <div className="card empty-state">
          <h2>No Characters Yet!</h2>
          <p>Create your first Hunter to begin your adventure, or play as Game Master.</p>
        </div>
      ) : (
        <>
          <h2 className="section-title">Your Characters</h2>
          <div className="character-grid">
            {characters.map((char) => (
              <div
                key={char.id}
                className={`character-card ${currentCharacterId === char.id ? 'active' : ''}`}
                onClick={() => handleSelect(char)}
              >
                <div className="character-image">
                  {char.image ? (
                    <img src={char.image} alt={char.name} />
                  ) : (
                    <div className="default-avatar">
                      {char.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="character-info">
                  <h3>{char.name || 'Unnamed Hunter'}</h3>
                  <div className="character-stats-mini">
                    <span>❤️ {char.hp || 0}/{char.maxHp || 0}</span>
                    <span>⚡ Level {char.level || 1}</span>
                  </div>
                </div>
                <button
                  className="btn-delete"
                  onClick={(e) => handleDelete(e, char.id)}
                  title="Delete character"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CharacterSelect;
