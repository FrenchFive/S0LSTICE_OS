import { useState } from 'react';
import { database } from '../utils/database';
import './CharacterCreator.css';

function CharacterCreator({ onComplete, editCharacter = null }) {
  const [character, setCharacter] = useState(editCharacter || {
    name: '',
    image: '',
    level: 1,
    maxHp: 100,
    hp: 100,
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    constitution: 10,
    wisdom: 10,
    charisma: 10
  });

  const handleChange = (field, value) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!character.name.trim()) {
      alert('Please enter a character name!');
      return;
    }

    const saved = database.saveCharacter(character);
    database.setCurrentCharacter(saved.id);
    onComplete(saved);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="character-creator">
      <div className="creator-header">
        <h1>✨ {editCharacter ? 'Edit' : 'Create'} Your Hunter</h1>
      </div>

      <div className="creator-content">
        <div className="card">
          <div className="card-header">Basic Info</div>
          
          <div className="form-group">
            <label>Character Name *</label>
            <input
              type="text"
              className="input"
              value={character.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter character name"
            />
          </div>

          <div className="form-group">
            <label>Character Image</label>
            <div className="image-upload-area">
              {character.image ? (
                <div className="image-preview">
                  <img src={character.image} alt="Character" />
                  <button
                    className="btn btn-danger"
                    onClick={() => handleChange('image', '')}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="btn btn-secondary">
                    📷 Upload Image
                  </label>
                  <p>or drag and drop</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Level</label>
              <input
                type="number"
                className="input"
                value={character.level}
                onChange={(e) => handleChange('level', parseInt(e.target.value) || 1)}
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Max HP</label>
              <input
                type="number"
                className="input"
                value={character.maxHp}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  handleChange('maxHp', val);
                  if (character.hp > val) handleChange('hp', val);
                }}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Current HP</label>
              <input
                type="number"
                className="input"
                value={character.hp}
                onChange={(e) => handleChange('hp', Math.min(parseInt(e.target.value) || 0, character.maxHp))}
                min="0"
                max={character.maxHp}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Character Stats</div>
          
          <div className="stats-grid">
            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
              <div key={stat} className="stat-item">
                <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                <input
                  type="number"
                  className="input"
                  value={character[stat]}
                  onChange={(e) => handleChange(stat, parseInt(e.target.value) || 0)}
                  min="1"
                  max="20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="creator-actions">
          <button className="btn btn-success" onClick={handleSave}>
            💾 Save Character
          </button>
          <button className="btn btn-secondary" onClick={() => onComplete(null)}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterCreator;
