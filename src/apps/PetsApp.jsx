import { useState, useEffect, useCallback } from 'react';
import { petsDatabase } from '../utils/sharedData';
import { database } from '../utils/database';
import './PetsApp.css';

function PetsApp() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Familiar',
    maxHP: 20,
    currentHP: 20,
    mood: 'Happy',
    hunger: 100,
    energy: 100
  });

  const character = database.getCurrentCharacter();
  const characterId = character?.id;

  const loadPets = useCallback(() => {
    if (!characterId) {
      setPets([]);
      return;
    }
    const characterPets = petsDatabase.getPets(characterId);
    setPets(characterPets);
  }, [characterId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPets();
  }, [loadPets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!characterId) {
      alert('Please select a character first');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a pet name');
      return;
    }

    petsDatabase.savePet(characterId, formData);
    
    setFormData({
      name: '',
      type: 'Familiar',
      maxHP: 20,
      currentHP: 20,
      mood: 'Happy',
      hunger: 100,
      energy: 100
    });
    setShowAddForm(false);
    loadPets();
  };

  const handleFeed = (pet) => {
    if (!characterId) return;

    const updated = {
      ...pet,
      hunger: Math.min(100, pet.hunger + 20),
      mood: 'Happy'
    };

    petsDatabase.savePet(characterId, updated);
    loadPets();
    if (selectedPet && selectedPet.id === pet.id) {
      setSelectedPet(updated);
    }
  };

  const handleRest = (pet) => {
    if (!characterId) return;

    const updated = {
      ...pet,
      energy: Math.min(100, pet.energy + 30),
      mood: 'Happy'
    };

    petsDatabase.savePet(characterId, updated);
    loadPets();
    if (selectedPet && selectedPet.id === pet.id) {
      setSelectedPet(updated);
    }
  };

  const handleDelete = (petId) => {
    if (window.confirm('Remove this pet/familiar?')) {
      if (characterId) {
        petsDatabase.deletePet(characterId, petId);
        if (selectedPet && selectedPet.id === petId) {
          setSelectedPet(null);
        }
        loadPets();
      }
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Familiar': '🦉',
      'Mount': '🐴',
      'Companion': '🐕',
      'Spirit': '👻',
      'Beast': '🐻'
    };
    return icons[type] || '🐾';
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      'Happy': '😊',
      'Neutral': '😐',
      'Sad': '😢',
      'Angry': '😠',
      'Excited': '🤩'
    };
    return emojis[mood] || '😐';
  };

  const getHPColor = (current, max) => {
    const percent = (current / max) * 100;
    if (percent > 66) return 'var(--color-success)';
    if (percent > 33) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  if (!character) {
    return (
      <div className="pets-app">
        <div className="no-character">
          <span className="big-icon">🐾</span>
          <p>No character selected</p>
          <p className="hint">Select a character to manage pets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pets-app">
      <div className="pets-header">
        <h1>🐾 Pets & Familiars</h1>
        <button className="btn btn-primary btn-add-pet" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Cancel' : '+ Add Pet'}
        </button>
      </div>

      {showAddForm && (
        <form className="pet-form" onSubmit={handleSubmit}>
          <h3>New Pet/Familiar</h3>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Pet name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Familiar</option>
                <option>Mount</option>
                <option>Companion</option>
                <option>Spirit</option>
                <option>Beast</option>
              </select>
            </div>

            <div className="form-group">
              <label>Max HP</label>
              <input
                type="number"
                className="input"
                value={formData.maxHP}
                onChange={(e) => setFormData({
                  ...formData,
                  maxHP: parseInt(e.target.value) || 20,
                  currentHP: parseInt(e.target.value) || 20
                })}
                min="1"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success btn-submit">💾 Add Pet</button>
        </form>
      )}

      <div className="pets-grid">
        {pets.length === 0 ? (
          <div className="empty-state">
            <p>🐾 No pets yet</p>
            <p className="empty-subtitle">Add a familiar, mount, or companion</p>
          </div>
        ) : (
          pets.map(pet => (
            <div key={pet.id} className="pet-card" onClick={() => setSelectedPet(pet)}>
              <div className="pet-icon">{getTypeIcon(pet.type)}</div>
              
              <div className="pet-name">{pet.name}</div>
              <div className="pet-type">{pet.type}</div>
              
              <div className="pet-mood">
                {getMoodEmoji(pet.mood)} {pet.mood}
              </div>

              <div className="pet-hp">
                <div className="hp-label">HP: {pet.currentHP}/{pet.maxHP}</div>
                <div className="hp-bar">
                  <div
                    className="hp-fill"
                    style={{
                      width: `${(pet.currentHP / pet.maxHP) * 100}%`,
                      background: getHPColor(pet.currentHP, pet.maxHP)
                    }}
                  />
                </div>
              </div>

              <div className="pet-stats">
                <div className="pet-stat">
                  <div className="stat-label">🍖 Hunger</div>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${pet.hunger}%` }} />
                  </div>
                </div>
                <div className="pet-stat">
                  <div className="stat-label">⚡ Energy</div>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${pet.energy}%` }} />
                  </div>
                </div>
              </div>

              <div className="pet-actions">
                <button className="btn btn-small btn-action" onClick={(e) => { e.stopPropagation(); handleFeed(pet); }}>
                  🍖 Feed
                </button>
                <button className="btn btn-small btn-action" onClick={(e) => { e.stopPropagation(); handleRest(pet); }}>
                  😴 Rest
                </button>
                <button className="btn btn-small btn-danger btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(pet.id); }}>
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPet && (
        <div className="pet-modal" onClick={() => setSelectedPet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedPet(null)}>✕</button>
            
            <div className="modal-header">
              <div className="modal-icon">{getTypeIcon(selectedPet.type)}</div>
              <div>
                <h2>{selectedPet.name}</h2>
                <div className="modal-type">{selectedPet.type}</div>
              </div>
            </div>

            <div className="modal-mood">
              {getMoodEmoji(selectedPet.mood)} Mood: {selectedPet.mood}
            </div>

            <div className="modal-section">
              <h3>Health</h3>
              <div className="large-hp">
                <div className="hp-label">{selectedPet.currentHP}/{selectedPet.maxHP} HP</div>
                <div className="hp-bar large">
                  <div
                    className="hp-fill"
                    style={{
                      width: `${(selectedPet.currentHP / selectedPet.maxHP) * 100}%`,
                      background: getHPColor(selectedPet.currentHP, selectedPet.maxHP)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Needs</h3>
              <div className="needs-grid">
                <div className="need-item">
                  <div className="need-label">🍖 Hunger: {selectedPet.hunger}%</div>
                  <div className="stat-bar large">
                    <div className="stat-fill" style={{ width: `${selectedPet.hunger}%` }} />
                  </div>
                </div>
                <div className="need-item">
                  <div className="need-label">⚡ Energy: {selectedPet.energy}%</div>
                  <div className="stat-bar large">
                    <div className="stat-fill" style={{ width: `${selectedPet.energy}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary btn-modal-action" onClick={() => handleFeed(selectedPet)}>
                🍖 Feed
              </button>
              <button className="btn btn-primary btn-modal-action" onClick={() => handleRest(selectedPet)}>
                😴 Rest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetsApp;
