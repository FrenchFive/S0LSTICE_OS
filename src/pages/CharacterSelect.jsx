import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import './CharacterSelect.css';

function CharacterSelect({ onSelectCharacter, onCreateNew }) {
  const [characters, setCharacters] = useState([]);
  const [currentCharacterId, setCurrentCharacterId] = useState(null);

  const loadCharacters = () => {
    const chars = database.getAllCharacters();
    setCharacters(chars);
    setCurrentCharacterId(database.getCurrentCharacterId());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCharacters();
  }, []);

  const handleSelect = (character) => {
    database.setCurrentCharacter(character.id);
    onSelectCharacter(character);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      database.deleteCharacter(id);
      loadCharacters();
    }
  };

  return (
    <div className="character-select">
      <div className="select-header">
        <h1>🎯 Select Your Hunter</h1>
        <button className="btn btn-success" onClick={onCreateNew}>
          ✨ Create New Character
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="card empty-state">
          <h2>No Characters Yet!</h2>
          <p>Create your first Hunter to begin your adventure.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default CharacterSelect;
