import { useState, useEffect } from 'react';
import { petsDatabase } from '../utils/sharedData';
import { getCurrentCharacter } from '../utils/database';
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

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = () => {
    const character = getCurrentCharacter();
    if (character) {
      const characterPets = petsDatabase.getCharacterPets(character.id);
      setPets(characterPets);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const character = getCurrentCharacter();
    if (!character) {
      alert('Please select a character first');
      return;
    }

    petsDatabase.savePet(character.id, null, formData);
    
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
    const character = getCurrentCharacter();
    if (!character) return;

    const updated = {
      ...pet,
      hunger: Math.min(100, pet.hunger + 20),
      mood: 'Happy'
    };

    petsDatabase.savePet(character.id, pet.id, updated);
    loadPets();
    if (selectedPet && selectedPet.id === pet.id) {
      setSelectedPet(updated);
    }
  };

  const handleRest = (pet) => {
    const character = getCurrentCharacter();
    if (!character) return;

    const updated = {
      ...pet,
      energy: Math.min(100, pet.energy + 30),
      mood: 'Happy'
    };

    petsDatabase.savePet(character.id, pet.id, updated);
    loadPets();
    if (selectedPet && selectedPet.id === pet.id) {
      setSelectedPet(updated);
    }
  };

  const handleDelete = (petId) => {
    if (confirm('Remove this pet/familiar?')) {
      const character = getCurrentCharacter();
      if (character) {
        petsDatabase.deletePet(character.id, petId);
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
    if (percent > 66) return '#4CAF50';
    if (percent > 33) return '#FFC107';
    return '#F44336';
  };

  return (
    <div className="pets-app">
      <div className="pets-header">
        <h1>🐾 Pets & Familiars</h1>
        <button className="btn-add-pet" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✖ Cancel' : '➕ Add Pet'}
        </button>
      </div>

      {showAddForm && (
        <form className="pet-form" onSubmit={handleSubmit}>
          <h3>New Pet/Familiar</h3>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
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

          <button type="submit" className="btn-submit">💾 Add Pet</button>
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
                <button className="btn-action" onClick={(e) => { e.stopPropagation(); handleFeed(pet); }}>
                  🍖 Feed
                </button>
                <button className="btn-action" onClick={(e) => { e.stopPropagation(); handleRest(pet); }}>
                  😴 Rest
                </button>
                <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(pet.id); }}>
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
            <button className="btn-close" onClick={() => setSelectedPet(null)}>✖</button>
            
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
              <button className="btn-modal-action" onClick={() => handleFeed(selectedPet)}>
                🍖 Feed
              </button>
              <button className="btn-modal-action" onClick={() => handleRest(selectedPet)}>
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
