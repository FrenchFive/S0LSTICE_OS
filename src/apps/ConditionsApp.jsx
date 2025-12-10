import { useState } from 'react';
import { database } from '../utils/database';
import { ActivityIcon, BandageIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, AlertIcon } from '../components/icons/Icons';
import './ConditionsApp.css';

// Predefined conditions for Hunter: The Reckoning
const CONDITION_TEMPLATES = [
  { name: 'Frightened', type: 'mental', severity: 'minor', description: 'You are unsettled and have difficulty focusing. -1 to Mental rolls.' },
  { name: 'Dazed', type: 'mental', severity: 'minor', description: 'Your thoughts are scattered. -1 to Social and Mental rolls.' },
  { name: 'Impaired', type: 'physical', severity: 'minor', description: 'Your body isn\'t responding well. -1 to Physical rolls.' },
  { name: 'Shaken', type: 'mental', severity: 'moderate', description: 'Your resolve wavers. -2 to Willpower-related rolls.' },
  { name: 'Exhausted', type: 'physical', severity: 'moderate', description: 'Fatigue grips you. -2 to all Physical rolls.' },
  { name: 'Terrified', type: 'mental', severity: 'severe', description: 'Overwhelming fear. Must spend Willpower to take aggressive action.' },
  { name: 'Incapacitated', type: 'physical', severity: 'severe', description: 'You cannot take Physical actions without assistance.' },
  { name: 'Stunned', type: 'physical', severity: 'minor', description: 'You lose your next action.' },
  { name: 'Blinded', type: 'physical', severity: 'moderate', description: 'You cannot see. +2 difficulty on vision-based rolls.' },
  { name: 'Grappled', type: 'physical', severity: 'minor', description: 'Your movement is restricted. Must break free to move.' },
];

// Predefined injury types
const INJURY_TEMPLATES = [
  { name: 'Bruised', location: 'body', severity: 'superficial', description: 'Minor bruising and pain.' },
  { name: 'Cut', location: 'limb', severity: 'superficial', description: 'A shallow cut that will heal quickly.' },
  { name: 'Sprained', location: 'limb', severity: 'minor', description: 'Twisted joint. -1 to actions using that limb.' },
  { name: 'Broken Bone', location: 'limb', severity: 'major', description: 'Fracture requires medical attention. -3 to actions using that limb.' },
  { name: 'Concussion', location: 'head', severity: 'moderate', description: 'Head trauma. -2 to Mental rolls until treated.' },
  { name: 'Deep Laceration', location: 'body', severity: 'moderate', description: 'Serious wound. Take 1 damage per scene until treated.' },
  { name: 'Internal Bleeding', location: 'body', severity: 'major', description: 'Life-threatening. Take aggravated damage per hour until surgery.' },
  { name: 'Burn', location: 'body', severity: 'moderate', description: 'Painful burn that impairs movement. -1 to Physical rolls.' },
];

const SEVERITY_COLORS = {
  superficial: 'var(--color-success)',
  minor: 'var(--color-warning)',
  moderate: 'var(--color-danger)',
  severe: '#7c3aed',
  major: '#7c3aed'
};

function ConditionEditor({ condition, onSave, onCancel }) {
  const [form, setForm] = useState(condition || {
    id: null,
    name: '',
    type: 'physical',
    severity: 'minor',
    description: '',
    diceModifier: 0,
    duration: 'scene',
    notes: ''
  });

  return (
    <div className="modal-overlay">
      <div className="condition-editor-modal">
        <div className="modal-header">
          <h3>{condition ? 'Edit Condition' : 'Add Condition'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Condition Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="e.g., Frightened"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
              >
                <option value="physical">Physical</option>
                <option value="mental">Mental</option>
                <option value="social">Social</option>
                <option value="supernatural">Supernatural</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                className="input"
                value={form.severity}
                onChange={(e) => setForm({...form, severity: e.target.value})}
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dice Modifier</label>
              <input
                type="number"
                className="input"
                value={form.diceModifier}
                onChange={(e) => setForm({...form, diceModifier: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <select
                className="input"
                value={form.duration}
                onChange={(e) => setForm({...form, duration: e.target.value})}
              >
                <option value="turn">Turn</option>
                <option value="scene">Scene</option>
                <option value="session">Session</option>
                <option value="permanent">Until Resolved</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="What effect does this condition have?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              placeholder="How did you get this condition?"
              rows={2}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
          >
            <CheckIcon size={16} /> Save Condition
          </button>
        </div>
      </div>
    </div>
  );
}

function InjuryEditor({ injury, onSave, onCancel }) {
  const [form, setForm] = useState(injury || {
    id: null,
    name: '',
    location: 'body',
    severity: 'superficial',
    description: '',
    healingProgress: 0,
    treatmentNotes: '',
    aggravated: false
  });

  return (
    <div className="modal-overlay">
      <div className="injury-editor-modal">
        <div className="modal-header">
          <h3>{injury ? 'Edit Injury' : 'Add Injury'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Injury Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="e.g., Broken Arm"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <select
                className="input"
                value={form.location}
                onChange={(e) => setForm({...form, location: e.target.value})}
              >
                <option value="head">Head</option>
                <option value="torso">Torso</option>
                <option value="body">Body (General)</option>
                <option value="arm_left">Left Arm</option>
                <option value="arm_right">Right Arm</option>
                <option value="leg_left">Left Leg</option>
                <option value="leg_right">Right Leg</option>
                <option value="limb">Limb (General)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                className="input"
                value={form.severity}
                onChange={(e) => setForm({...form, severity: e.target.value})}
              >
                <option value="superficial">Superficial</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Healing Progress</label>
              <div className="healing-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.healingProgress}
                  onChange={(e) => setForm({...form, healingProgress: parseInt(e.target.value)})}
                />
                <span>{form.healingProgress}%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.aggravated}
                  onChange={(e) => setForm({...form, aggravated: e.target.checked})}
                />
                Aggravated Damage
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Describe the injury..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Treatment Notes</label>
            <textarea
              className="input textarea"
              value={form.treatmentNotes}
              onChange={(e) => setForm({...form, treatmentNotes: e.target.value})}
              placeholder="How is this being treated?"
              rows={2}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
          >
            <CheckIcon size={16} /> Save Injury
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickAddPanel({ type, onAdd, onClose }) {
  const templates = type === 'condition' ? CONDITION_TEMPLATES : INJURY_TEMPLATES;
  
  return (
    <div className="quick-add-panel">
      <div className="quick-add-header">
        <h4>Quick Add {type === 'condition' ? 'Condition' : 'Injury'}</h4>
        <button className="btn-close-sm" onClick={onClose}>
          <XIcon size={16} />
        </button>
      </div>
      <div className="quick-add-list">
        {templates.map((template, idx) => (
          <button
            key={idx}
            className="quick-add-item"
            onClick={() => onAdd(template)}
          >
            <span className="quick-add-name">{template.name}</span>
            <span 
              className="quick-add-severity"
              style={{ color: SEVERITY_COLORS[template.severity] }}
            >
              {template.severity}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ConditionsApp() {
  // Initialize character state lazily
  const [character, setCharacter] = useState(() => {
    const currentCharId = database.getCurrentCharacterId();
    if (currentCharId) {
      const char = database.getCharacter(currentCharId);
      if (char) {
        // Ensure conditions and injuries arrays exist
        if (!char.conditions) char.conditions = [];
        if (!char.injuries) char.injuries = [];
        return char;
      }
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState('conditions');
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [showInjuryEditor, setShowInjuryEditor] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [editingInjury, setEditingInjury] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(null);

  const saveCharacter = (updated) => {
    database.saveCharacter(updated);
    setCharacter(updated);
  };

  // Condition handlers
  const handleAddCondition = (conditionData) => {
    const newCondition = {
      ...conditionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updated = {
      ...character,
      conditions: [...(character.conditions || []), newCondition]
    };
    
    saveCharacter(updated);
    setShowConditionEditor(false);
    setShowQuickAdd(null);
  };

  const handleEditCondition = (condition) => {
    setEditingCondition(condition);
    setShowConditionEditor(true);
  };

  const handleSaveCondition = (conditionData) => {
    if (editingCondition) {
      const updated = {
        ...character,
        conditions: character.conditions.map(c => 
          c.id === conditionData.id ? conditionData : c
        )
      };
      saveCharacter(updated);
    } else {
      handleAddCondition(conditionData);
    }
    
    setShowConditionEditor(false);
    setEditingCondition(null);
  };

  const handleRemoveCondition = (conditionId) => {
    if (window.confirm('Remove this condition?')) {
      const updated = {
        ...character,
        conditions: character.conditions.filter(c => c.id !== conditionId)
      };
      saveCharacter(updated);
    }
  };

  // Injury handlers
  const handleAddInjury = (injuryData) => {
    const newInjury = {
      ...injuryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updated = {
      ...character,
      injuries: [...(character.injuries || []), newInjury]
    };
    
    saveCharacter(updated);
    setShowInjuryEditor(false);
    setShowQuickAdd(null);
  };

  const handleEditInjury = (injury) => {
    setEditingInjury(injury);
    setShowInjuryEditor(true);
  };

  const handleSaveInjury = (injuryData) => {
    if (editingInjury) {
      const updated = {
        ...character,
        injuries: character.injuries.map(i => 
          i.id === injuryData.id ? injuryData : i
        )
      };
      saveCharacter(updated);
    } else {
      handleAddInjury(injuryData);
    }
    
    setShowInjuryEditor(false);
    setEditingInjury(null);
  };

  const handleRemoveInjury = (injuryId) => {
    if (window.confirm('Remove this injury?')) {
      const updated = {
        ...character,
        injuries: character.injuries.filter(i => i.id !== injuryId)
      };
      saveCharacter(updated);
    }
  };

  const handleHealInjury = (injuryId, amount) => {
    const updated = {
      ...character,
      injuries: character.injuries.map(i => {
        if (i.id === injuryId) {
          const newProgress = Math.min(100, (i.healingProgress || 0) + amount);
          return { ...i, healingProgress: newProgress };
        }
        return i;
      })
    };
    saveCharacter(updated);
  };

  if (!character) {
    return (
      <div className="conditions-app">
        <div className="no-character">
          <ActivityIcon size={48} />
          <p>No Hunter selected</p>
          <p>Go to Character app to select or create one</p>
        </div>
      </div>
    );
  }

  const conditions = character.conditions || [];
  const injuries = character.injuries || [];
  
  // Calculate total modifiers
  const totalModifier = conditions.reduce((sum, c) => sum + (c.diceModifier || 0), 0);
  const activeConditions = conditions.length;
  const activeInjuries = injuries.filter(i => (i.healingProgress || 0) < 100).length;

  return (
    <div className="conditions-app">
      <div className="conditions-header">
        <h1>
          <ActivityIcon size={28} /> 
          Health Status
        </h1>
        <div className="status-summary">
          {totalModifier !== 0 && (
            <span className={`modifier-badge ${totalModifier < 0 ? 'negative' : 'positive'}`}>
              {totalModifier > 0 ? '+' : ''}{totalModifier} dice
            </span>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div className="status-card conditions">
          <ActivityIcon size={20} />
          <span className="status-count">{activeConditions}</span>
          <span className="status-label">Conditions</span>
        </div>
        <div className="status-card injuries">
          <BandageIcon size={20} />
          <span className="status-count">{activeInjuries}</span>
          <span className="status-label">Injuries</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button 
          className={`tab ${activeTab === 'conditions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conditions')}
        >
          <ActivityIcon size={16} /> Conditions
        </button>
        <button 
          className={`tab ${activeTab === 'injuries' ? 'active' : ''}`}
          onClick={() => setActiveTab('injuries')}
        >
          <BandageIcon size={16} /> Injuries
        </button>
      </div>

      {/* Conditions Tab */}
      {activeTab === 'conditions' && (
        <div className="conditions-content">
          <div className="content-actions">
            <button 
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingCondition(null);
                setShowConditionEditor(true);
              }}
            >
              <PlusIcon size={14} /> Add Condition
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowQuickAdd(showQuickAdd === 'condition' ? null : 'condition')}
            >
              Quick Add
            </button>
          </div>

          {showQuickAdd === 'condition' && (
            <QuickAddPanel 
              type="condition" 
              onAdd={handleAddCondition}
              onClose={() => setShowQuickAdd(null)}
            />
          )}

          {conditions.length === 0 ? (
            <div className="empty-state">
              <ActivityIcon size={48} />
              <h3>No Active Conditions</h3>
              <p>Your hunter is in good mental and physical state.</p>
            </div>
          ) : (
            <div className="conditions-list">
              {conditions.map(condition => (
                <div 
                  key={condition.id} 
                  className={`condition-card severity-${condition.severity}`}
                >
                  <div className="condition-header">
                    <div className="condition-title">
                      <span 
                        className="severity-indicator"
                        style={{ backgroundColor: SEVERITY_COLORS[condition.severity] }}
                      />
                      <h4>{condition.name}</h4>
                    </div>
                    <div className="condition-badges">
                      <span className="type-badge">{condition.type}</span>
                      {condition.diceModifier !== 0 && (
                        <span className={`modifier-badge ${condition.diceModifier < 0 ? 'negative' : 'positive'}`}>
                          {condition.diceModifier > 0 ? '+' : ''}{condition.diceModifier}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {condition.description && (
                    <p className="condition-description">{condition.description}</p>
                  )}
                  
                  <div className="condition-meta">
                    <span className="duration-badge">
                      Duration: {condition.duration}
                    </span>
                  </div>

                  {condition.notes && (
                    <p className="condition-notes">{condition.notes}</p>
                  )}

                  <div className="condition-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditCondition(condition)}
                      title="Edit"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleRemoveCondition(condition.id)}
                      title="Remove"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Injuries Tab */}
      {activeTab === 'injuries' && (
        <div className="injuries-content">
          <div className="content-actions">
            <button 
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingInjury(null);
                setShowInjuryEditor(true);
              }}
            >
              <PlusIcon size={14} /> Add Injury
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowQuickAdd(showQuickAdd === 'injury' ? null : 'injury')}
            >
              Quick Add
            </button>
          </div>

          {showQuickAdd === 'injury' && (
            <QuickAddPanel 
              type="injury" 
              onAdd={handleAddInjury}
              onClose={() => setShowQuickAdd(null)}
            />
          )}

          {injuries.length === 0 ? (
            <div className="empty-state">
              <BandageIcon size={48} />
              <h3>No Injuries</h3>
              <p>Your hunter is physically unharmed.</p>
            </div>
          ) : (
            <div className="injuries-list">
              {injuries.map(injury => (
                <div 
                  key={injury.id} 
                  className={`injury-card severity-${injury.severity} ${injury.aggravated ? 'aggravated' : ''}`}
                >
                  <div className="injury-header">
                    <div className="injury-title">
                      {injury.aggravated && (
                        <AlertIcon size={16} className="aggravated-icon" />
                      )}
                      <h4>{injury.name}</h4>
                    </div>
                    <span 
                      className="severity-badge"
                      style={{ backgroundColor: SEVERITY_COLORS[injury.severity] }}
                    >
                      {injury.severity}
                    </span>
                  </div>
                  
                  <div className="injury-location">
                    Location: <strong>{injury.location?.replace('_', ' ')}</strong>
                  </div>

                  {injury.description && (
                    <p className="injury-description">{injury.description}</p>
                  )}

                  <div className="healing-progress">
                    <div className="healing-bar">
                      <div 
                        className="healing-fill"
                        style={{ width: `${injury.healingProgress || 0}%` }}
                      />
                    </div>
                    <span className="healing-text">
                      {injury.healingProgress >= 100 ? 'Healed!' : `${injury.healingProgress || 0}% healed`}
                    </span>
                  </div>

                  <div className="healing-buttons">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleHealInjury(injury.id, 10)}
                      disabled={(injury.healingProgress || 0) >= 100}
                    >
                      +10% Heal
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleHealInjury(injury.id, 25)}
                      disabled={(injury.healingProgress || 0) >= 100}
                    >
                      +25% Heal
                    </button>
                  </div>

                  {injury.treatmentNotes && (
                    <p className="treatment-notes">
                      <strong>Treatment:</strong> {injury.treatmentNotes}
                    </p>
                  )}

                  <div className="injury-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditInjury(injury)}
                      title="Edit"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleRemoveInjury(injury.id)}
                      title="Remove"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showConditionEditor && (
        <ConditionEditor
          condition={editingCondition}
          onSave={handleSaveCondition}
          onCancel={() => {
            setShowConditionEditor(false);
            setEditingCondition(null);
          }}
        />
      )}

      {showInjuryEditor && (
        <InjuryEditor
          injury={editingInjury}
          onSave={handleSaveInjury}
          onCancel={() => {
            setShowInjuryEditor(false);
            setEditingInjury(null);
          }}
        />
      )}
    </div>
  );
}
