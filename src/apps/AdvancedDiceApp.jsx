import { useState } from 'react';
import { database } from '../utils/database';
import { inventoryDatabase } from '../utils/sharedData';
import { DiceIcon, PlusIcon, TrashIcon, SaveIcon, StarIcon, BackpackIcon, CheckIcon, XIcon, CopyIcon } from '../components/icons/Icons';
import {
  rollHuntersPool,
  formatOutcome,
  saveRollToHistory,
  getRollHistory
} from '../utils/dice';
import {
  ATTRIBUTE_LABELS,
  SKILL_LABELS,
  getAttributeValue,
  getSkillValue
} from '../utils/huntersData';
import './AdvancedDiceApp.css';

// Dice expression parser
const DICE_REGEX = /(\d+)?d(\d+)([+-]\d+)?/gi;

function parseDiceExpression(expression) {
  const results = [];
  let match;
  const normalizedExpr = expression.toLowerCase().replace(/\s/g, '');
  
  // Reset regex
  DICE_REGEX.lastIndex = 0;
  
  while ((match = DICE_REGEX.exec(normalizedExpr)) !== null) {
    const count = parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    const modifier = parseInt(match[3]) || 0;
    
    results.push({ count, sides, modifier });
  }
  
  // Also check for just a modifier like "+5" or "-3"
  const modifierMatch = normalizedExpr.match(/^([+-]?\d+)$/);
  if (modifierMatch && results.length === 0) {
    results.push({ count: 0, sides: 0, modifier: parseInt(modifierMatch[1]) });
  }
  
  return results;
}

function rollDiceExpression(expression) {
  const dice = parseDiceExpression(expression);
  
  if (dice.length === 0) return null;
  
  let total = 0;
  const details = [];
  
  dice.forEach(({ count, sides, modifier }) => {
    const rolls = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    total += modifier;
    
    if (count > 0) {
      details.push({
        expression: `${count}d${sides}${modifier > 0 ? '+' + modifier : modifier < 0 ? modifier : ''}`,
        rolls,
        modifier,
        subtotal: rolls.reduce((a, b) => a + b, 0) + modifier
      });
    } else if (modifier !== 0) {
      details.push({
        expression: `${modifier > 0 ? '+' : ''}${modifier}`,
        rolls: [],
        modifier,
        subtotal: modifier
      });
    }
  });
  
  return {
    id: Date.now().toString(),
    expression,
    total,
    details,
    timestamp: new Date().toISOString()
  };
}

// Preset storage
const PRESETS_KEY = 'hunters_dice_presets';

const presetsDatabase = {
  getPresets() {
    const data = localStorage.getItem(PRESETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  savePreset(preset) {
    const presets = this.getPresets();
    const newPreset = {
      ...preset,
      id: preset.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const existingIndex = presets.findIndex(p => p.id === newPreset.id);
    if (existingIndex >= 0) {
      presets[existingIndex] = newPreset;
    } else {
      presets.push(newPreset);
    }
    
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return newPreset;
  },
  
  deletePreset(id) {
    const presets = this.getPresets();
    const filtered = presets.filter(p => p.id !== id);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
  }
};

// Common preset templates
const PRESET_TEMPLATES = [
  { name: 'Attack Roll', expression: '1d20', type: 'freeform', category: 'combat' },
  { name: 'Damage (Sword)', expression: '1d8+3', type: 'freeform', category: 'combat' },
  { name: 'Damage (Dagger)', expression: '1d4+2', type: 'freeform', category: 'combat' },
  { name: 'Fireball', expression: '8d6', type: 'freeform', category: 'combat' },
  { name: 'Healing', expression: '2d8+3', type: 'freeform', category: 'utility' },
];

function PresetEditor({ preset, onSave, onCancel }) {
  const [form, setForm] = useState(preset || {
    name: '',
    type: 'hunters',
    attribute: 'strength',
    skill: 'athletics',
    modifier: 0,
    expression: '1d20',
    category: 'general',
    notes: ''
  });

  return (
    <div className="modal-overlay">
      <div className="preset-editor-modal">
        <div className="modal-header">
          <h3>{preset ? 'Edit Preset' : 'Create Preset'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Preset Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="e.g., Melee Attack"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Roll Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
              >
                <option value="hunters">Hunters Pool</option>
                <option value="freeform">Freeform Expression</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                <option value="general">General</option>
                <option value="combat">Combat</option>
                <option value="social">Social</option>
                <option value="mental">Mental</option>
                <option value="utility">Utility</option>
              </select>
            </div>
          </div>

          {form.type === 'hunters' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Attribute</label>
                  <select
                    className="input"
                    value={form.attribute}
                    onChange={(e) => setForm({...form, attribute: e.target.value})}
                  >
                    {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Skill</label>
                  <select
                    className="input"
                    value={form.skill}
                    onChange={(e) => setForm({...form, skill: e.target.value})}
                  >
                    <option value="">None</option>
                    {Object.entries(SKILL_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Modifier</label>
                <input
                  type="number"
                  className="input"
                  value={form.modifier}
                  onChange={(e) => setForm({...form, modifier: parseInt(e.target.value) || 0})}
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Dice Expression</label>
              <input
                type="text"
                className="input"
                value={form.expression}
                onChange={(e) => setForm({...form, expression: e.target.value})}
                placeholder="e.g., 2d6+3 or 1d20+5"
              />
              <p className="form-hint">Examples: 1d20, 2d6+3, 4d8-2, 1d20+1d4</p>
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              placeholder="Optional notes about this roll..."
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
            <SaveIcon size={16} /> Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedDiceApp() {
  // Initialize state lazily to avoid useEffect + setState pattern
  const [character] = useState(() => {
    const currentCharId = database.getCurrentCharacterId();
    if (currentCharId) {
      return database.getCharacter(currentCharId);
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState('quick');
  const [presets, setPresets] = useState(() => presetsDatabase.getPresets());
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [recentRolls, setRecentRolls] = useState(() => getRollHistory().slice(0, 15));
  const [lastRoll, setLastRoll] = useState(null);
  const [equipment] = useState(() => {
    const currentCharId = database.getCurrentCharacterId();
    if (currentCharId) {
      const items = inventoryDatabase.getCharacterItems(currentCharId);
      return items.filter(i => i.type === 'Weapon' || i.dice || i.damage);
    }
    return [];
  });
  
  // Quick roll state
  const [quickExpression, setQuickExpression] = useState('1d20');
  
  // Hunters pool state
  const [selectedAttribute, setSelectedAttribute] = useState('strength');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [poolModifier, setPoolModifier] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [desperationDice, setDesperationDice] = useState(0);

  // Quick roll handler
  const handleQuickRoll = () => {
    const result = rollDiceExpression(quickExpression);
    if (result) {
      setLastRoll({ ...result, type: 'freeform' });
      saveRollToHistory({
        ...result,
        type: 'freeform',
        poolSize: 0,
        outcome: 'none'
      }, character?.identity?.name || 'Unknown');
      setRecentRolls(getRollHistory().slice(0, 15));
    }
  };

  // Hunters pool roll handler
  const handlePoolRoll = () => {
    if (!character) return;
    
    let poolSize = getAttributeValue(character, selectedAttribute);
    if (selectedSkill) {
      poolSize += getSkillValue(character, selectedSkill);
    }
    poolSize += poolModifier;
    poolSize = Math.max(1, poolSize);
    
    const result = rollHuntersPool(poolSize, desperationDice, difficulty);
    setLastRoll({ ...result, type: 'hunters' });
    
    saveRollToHistory(result, character?.identity?.name || 'Unknown');
    setRecentRolls(getRollHistory().slice(0, 15));
  };

  // Preset roll handler
  const handlePresetRoll = (preset) => {
    if (preset.type === 'hunters') {
      if (!character) return;
      
      let poolSize = getAttributeValue(character, preset.attribute);
      if (preset.skill) {
        poolSize += getSkillValue(character, preset.skill);
      }
      poolSize += preset.modifier || 0;
      poolSize = Math.max(1, poolSize);
      
      const result = rollHuntersPool(poolSize, 0, 1);
      setLastRoll({ ...result, type: 'hunters', presetName: preset.name });
      
      saveRollToHistory(result, character?.identity?.name || 'Unknown');
    } else {
      const result = rollDiceExpression(preset.expression);
      if (result) {
        setLastRoll({ ...result, type: 'freeform', presetName: preset.name });
        saveRollToHistory({
          ...result,
          type: 'freeform',
          poolSize: 0,
          outcome: 'none'
        }, character?.identity?.name || 'Unknown');
      }
    }
    setRecentRolls(getRollHistory().slice(0, 15));
  };

  // Equipment roll handler
  const handleEquipmentRoll = (item) => {
    const expression = item.dice || item.damage || '1d6';
    const result = rollDiceExpression(expression);
    if (result) {
      setLastRoll({ ...result, type: 'equipment', equipmentName: item.name });
      saveRollToHistory({
        ...result,
        type: 'equipment',
        poolSize: 0,
        outcome: 'none'
      }, character?.identity?.name || 'Unknown');
      setRecentRolls(getRollHistory().slice(0, 15));
    }
  };

  // Preset handlers
  const handleSavePreset = (presetData) => {
    presetsDatabase.savePreset(presetData);
    setPresets(presetsDatabase.getPresets());
    setShowPresetEditor(false);
    setEditingPreset(null);
  };

  const handleDeletePreset = (presetId) => {
    if (window.confirm('Delete this preset?')) {
      presetsDatabase.deletePreset(presetId);
      setPresets(presetsDatabase.getPresets());
    }
  };

  const handleAddTemplate = (template) => {
    presetsDatabase.savePreset(template);
    setPresets(presetsDatabase.getPresets());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const getPoolSize = () => {
    if (!character) return 1;
    let poolSize = getAttributeValue(character, selectedAttribute);
    if (selectedSkill) {
      poolSize += getSkillValue(character, selectedSkill);
    }
    poolSize += poolModifier;
    return Math.max(1, poolSize);
  };

  return (
    <div className="advanced-dice-app">
      <div className="dice-header">
        <h1>
          <DiceIcon size={28} /> 
          Advanced Dice
        </h1>
        {character && (
          <span className="character-badge">
            {character.identity?.name || character.name}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button 
          className={`tab ${activeTab === 'quick' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick')}
        >
          Quick Roll
        </button>
        <button 
          className={`tab ${activeTab === 'pool' ? 'active' : ''}`}
          onClick={() => setActiveTab('pool')}
        >
          Hunters Pool
        </button>
        <button 
          className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
        <button 
          className={`tab ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          Equipment
        </button>
      </div>

      {/* Last Roll Result */}
      {lastRoll && (
        <div className={`roll-result ${lastRoll.type === 'hunters' ? formatOutcome(lastRoll.outcome).class : 'freeform'}`}>
          {lastRoll.presetName && (
            <div className="result-preset-name">{lastRoll.presetName}</div>
          )}
          {lastRoll.equipmentName && (
            <div className="result-preset-name">{lastRoll.equipmentName}</div>
          )}
          
          {lastRoll.type === 'hunters' ? (
            <>
              <div className="result-header">
                <span className="result-outcome">{formatOutcome(lastRoll.outcome).text}</span>
                <span className="result-successes">{lastRoll.successes} / {lastRoll.difficulty} Successes</span>
              </div>
              <div className="dice-results">
                {lastRoll.regularResults.map((die, i) => (
                  <span 
                    key={i} 
                    className={`die ${die >= 6 ? 'success' : 'fail'} ${die === 10 ? 'crit' : ''}`}
                  >
                    {die}
                  </span>
                ))}
                {lastRoll.desperationResults?.map((die, i) => (
                  <span 
                    key={`d-${i}`} 
                    className={`die desperation ${die >= 6 ? 'success' : 'fail'} ${die === 10 ? 'crit' : ''}`}
                  >
                    {die}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="result-header">
                <span className="result-expression">{lastRoll.expression}</span>
                <span className="result-total">= {lastRoll.total}</span>
              </div>
              <div className="dice-details">
                {lastRoll.details?.map((detail, i) => (
                  <div key={i} className="detail-group">
                    <span className="detail-expr">{detail.expression}:</span>
                    <span className="detail-rolls">
                      [{detail.rolls.join(', ')}]
                      {detail.modifier !== 0 && (
                        <span className="detail-mod">
                          {detail.modifier > 0 ? '+' : ''}{detail.modifier}
                        </span>
                      )}
                      = {detail.subtotal}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Roll Tab */}
      {activeTab === 'quick' && (
        <div className="quick-roll-section">
          <h3>Freeform Dice Roll</h3>
          <p className="section-description">
            Enter any dice expression like 2d6+3, 1d20, or 4d8-2
          </p>
          
          <div className="expression-input">
            <input
              type="text"
              className="input input-lg"
              value={quickExpression}
              onChange={(e) => setQuickExpression(e.target.value)}
              placeholder="e.g., 2d6+3"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickRoll()}
            />
            <button 
              className="btn btn-primary"
              onClick={handleQuickRoll}
            >
              <DiceIcon size={20} /> Roll
            </button>
          </div>

          <div className="quick-buttons">
            {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '1d100', '2d6'].map(expr => (
              <button
                key={expr}
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setQuickExpression(expr);
                  const result = rollDiceExpression(expr);
                  if (result) {
                    setLastRoll({ ...result, type: 'freeform' });
                    saveRollToHistory({
                      ...result,
                      type: 'freeform',
                      poolSize: 0,
                      outcome: 'none'
                    }, character?.identity?.name || 'Unknown');
                    setRecentRolls(getRollHistory().slice(0, 15));
                  }
                }}
              >
                {expr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hunters Pool Tab */}
      {activeTab === 'pool' && (
        <div className="pool-roll-section">
          <h3>Hunters Dice Pool</h3>
          
          {!character ? (
            <div className="no-character-notice">
              Select a character to use the pool builder
            </div>
          ) : (
            <>
              <div className="pool-display-large">
                <span className="pool-value">{getPoolSize()}d10</span>
                {desperationDice > 0 && (
                  <span className="desperation-badge">+{desperationDice} Desperation</span>
                )}
              </div>

              <div className="pool-builder">
                <div className="form-row">
                  <div className="form-group">
                    <label>Attribute</label>
                    <select
                      className="input"
                      value={selectedAttribute}
                      onChange={(e) => setSelectedAttribute(e.target.value)}
                    >
                      {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label} ({getAttributeValue(character, key)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Skill</label>
                    <select
                      className="input"
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                      <option value="">None (0)</option>
                      {Object.entries(SKILL_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label} ({getSkillValue(character, key)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty</label>
                    <div className="number-control">
                      <button onClick={() => setDifficulty(Math.max(1, difficulty - 1))}>−</button>
                      <span>{difficulty}</span>
                      <button onClick={() => setDifficulty(Math.min(10, difficulty + 1))}>+</button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Modifier</label>
                    <div className="number-control">
                      <button onClick={() => setPoolModifier(poolModifier - 1)}>−</button>
                      <span>{poolModifier > 0 ? '+' : ''}{poolModifier}</span>
                      <button onClick={() => setPoolModifier(poolModifier + 1)}>+</button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Desperation</label>
                    <div className="number-control desperation">
                      <button onClick={() => setDesperationDice(Math.max(0, desperationDice - 1))}>−</button>
                      <span>{desperationDice}</span>
                      <button onClick={() => setDesperationDice(Math.min(5, desperationDice + 1))}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg roll-btn"
                onClick={handlePoolRoll}
              >
                <DiceIcon size={24} /> Roll {getPoolSize() + desperationDice}d10
              </button>
            </>
          )}
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="presets-section">
          <div className="presets-header">
            <h3>Saved Presets</h3>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingPreset(null);
                setShowPresetEditor(true);
              }}
            >
              <PlusIcon size={14} /> New Preset
            </button>
          </div>

          {presets.length === 0 ? (
            <div className="empty-presets">
              <StarIcon size={48} />
              <h4>No Saved Presets</h4>
              <p>Create presets for your frequently used rolls.</p>
              
              <div className="template-suggestions">
                <h5>Quick Add Templates:</h5>
                <div className="template-list">
                  {PRESET_TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      className="btn btn-outline btn-sm"
                      onClick={() => handleAddTemplate(template)}
                    >
                      <PlusIcon size={12} /> {template.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="presets-grid">
              {presets.map(preset => (
                <div key={preset.id} className={`preset-card category-${preset.category}`}>
                  <div className="preset-header">
                    <h4>{preset.name}</h4>
                    <span className="preset-category">{preset.category}</span>
                  </div>
                  
                  <div className="preset-info">
                    {preset.type === 'hunters' ? (
                      <span className="preset-details">
                        {ATTRIBUTE_LABELS[preset.attribute]}
                        {preset.skill && ` + ${SKILL_LABELS[preset.skill]}`}
                        {preset.modifier !== 0 && ` ${preset.modifier > 0 ? '+' : ''}${preset.modifier}`}
                      </span>
                    ) : (
                      <span className="preset-expression">{preset.expression}</span>
                    )}
                  </div>

                  {preset.notes && (
                    <p className="preset-notes">{preset.notes}</p>
                  )}

                  <div className="preset-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handlePresetRoll(preset)}
                    >
                      <DiceIcon size={14} /> Roll
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => {
                        setEditingPreset(preset);
                        setShowPresetEditor(true);
                      }}
                    >
                      <SaveIcon size={14} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="equipment-section">
          <h3><BackpackIcon size={20} /> Equipment Dice</h3>
          
          {equipment.length === 0 ? (
            <div className="empty-equipment">
              <BackpackIcon size={48} />
              <h4>No Equipment with Dice</h4>
              <p>Add weapons or items with dice values in your inventory.</p>
            </div>
          ) : (
            <div className="equipment-list">
              {equipment.map(item => (
                <div key={item.id} className="equipment-item">
                  <div className="equipment-info">
                    <span className="equipment-name">{item.name}</span>
                    <span className="equipment-dice">{item.dice || item.damage || '1d6'}</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEquipmentRoll(item)}
                  >
                    <DiceIcon size={14} /> Roll
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Rolls */}
      <div className="recent-rolls-section">
        <h3>Recent Rolls</h3>
        {recentRolls.length === 0 ? (
          <div className="empty-rolls">No rolls yet</div>
        ) : (
          <div className="rolls-list">
            {recentRolls.slice(0, 10).map((roll, idx) => (
              <div key={idx} className="roll-history-item">
                <span className="roll-time">
                  {new Date(roll.timestamp).toLocaleTimeString()}
                </span>
                {roll.type === 'freeform' || roll.type === 'equipment' ? (
                  <>
                    <span className="roll-expr">{roll.expression}</span>
                    <span className="roll-total">= {roll.total}</span>
                  </>
                ) : (
                  <>
                    <span className="roll-pool">{roll.poolSize}d10</span>
                    <span className={`roll-outcome ${formatOutcome(roll.outcome).class}`}>
                      {formatOutcome(roll.outcome).text}
                    </span>
                  </>
                )}
                <button 
                  className="btn-copy"
                  onClick={() => copyToClipboard(roll.expression || `${roll.poolSize}d10`)}
                  title="Copy"
                >
                  <CopyIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Editor Modal */}
      {showPresetEditor && (
        <PresetEditor
          preset={editingPreset}
          onSave={handleSavePreset}
          onCancel={() => {
            setShowPresetEditor(false);
            setEditingPreset(null);
          }}
        />
      )}
    </div>
  );
}
