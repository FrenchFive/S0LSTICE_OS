import { useState, useEffect } from 'react';
import { SwordsIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon } from '../components/icons/Icons';
import { encounterDatabase, dmMode } from '../utils/database';
import { wsClient } from '../utils/websocket';
import './CombatApp.css';

// Play icon
const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// Pause icon
const PauseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

// Skip icon
const SkipIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

// Heart icon for HP
const HeartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Shield icon for armor
const ShieldIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Creature type colors
const CREATURE_COLORS = {
  monster: '#ef4444',
  npc: '#22c55e',
  minion: '#f59e0b',
  boss: '#8b5cf6'
};

// Difficulty colors
const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
  deadly: '#7c3aed'
};

// Status effect definitions
const STATUS_EFFECTS = [
  { id: 'blinded', name: 'Blinded', icon: '👁️', description: 'Cannot see, auto-fail sight checks', color: '#6b7280' },
  { id: 'charmed', name: 'Charmed', icon: '💕', description: 'Cannot attack charmer', color: '#ec4899' },
  { id: 'deafened', name: 'Deafened', icon: '👂', description: 'Cannot hear, auto-fail hearing checks', color: '#6b7280' },
  { id: 'frightened', name: 'Frightened', icon: '😨', description: 'Disadvantage while source visible', color: '#7c3aed' },
  { id: 'grappled', name: 'Grappled', icon: '🤼', description: 'Speed becomes 0', color: '#f59e0b' },
  { id: 'incapacitated', name: 'Incapacitated', icon: '💫', description: 'Cannot take actions or reactions', color: '#ef4444' },
  { id: 'invisible', name: 'Invisible', icon: '👻', description: 'Cannot be seen without special sense', color: '#8b5cf6' },
  { id: 'paralyzed', name: 'Paralyzed', icon: '⚡', description: 'Incapacitated, auto-fail Str/Dex saves', color: '#dc2626' },
  { id: 'poisoned', name: 'Poisoned', icon: '🤢', description: 'Disadvantage on attacks and ability checks', color: '#22c55e' },
  { id: 'prone', name: 'Prone', icon: '🛌', description: 'Disadvantage on attacks, advantage for melee vs', color: '#78716c' },
  { id: 'restrained', name: 'Restrained', icon: '⛓️', description: 'Speed 0, disadvantage on Dex saves', color: '#57534e' },
  { id: 'stunned', name: 'Stunned', icon: '💥', description: 'Incapacitated, auto-fail Str/Dex saves', color: '#fbbf24' },
  { id: 'unconscious', name: 'Unconscious', icon: '😴', description: 'Incapacitated, prone, auto-fail Str/Dex', color: '#1f2937' },
  { id: 'exhausted', name: 'Exhausted', icon: '😩', description: 'Cumulative exhaustion effects', color: '#9ca3af' },
  { id: 'concentrating', name: 'Concentrating', icon: '🎯', description: 'Maintaining concentration on spell', color: '#3b82f6' },
  { id: 'hidden', name: 'Hidden', icon: '🥷', description: 'Location unknown to enemies', color: '#1e293b' },
];

// Action economy icons
const ActionIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const BonusActionIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 22,12 12,22 2,12" />
  </svg>
);

const ReactionIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const MovementIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/**
 * Status Effect Selector Modal
 */
function StatusEffectSelector({ currentEffects = [], onToggle, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="status-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Status Effects</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="status-effects-grid">
            {STATUS_EFFECTS.map(effect => {
              const isActive = currentEffects.includes(effect.id);
              return (
                <button
                  key={effect.id}
                  className={`status-effect-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onToggle(effect.id)}
                  style={{ borderColor: isActive ? effect.color : undefined }}
                >
                  <span className="status-icon">{effect.icon}</span>
                  <span className="status-name">{effect.name}</span>
                  <span className="status-desc">{effect.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Action Economy Display
 */
function ActionEconomy({ creature, onUpdate }) {
  const actions = creature.actions || { action: true, bonus: true, reaction: true, movement: creature.speed || 30 };
  
  const toggleAction = (type) => {
    onUpdate({
      ...creature,
      actions: { ...actions, [type]: !actions[type] }
    });
  };
  
  const spendMovement = (amount) => {
    const newMovement = Math.max(0, actions.movement - amount);
    onUpdate({
      ...creature,
      actions: { ...actions, movement: newMovement }
    });
  };

  return (
    <div className="action-economy">
      <div className="action-row">
        <button 
          className={`action-btn action ${actions.action ? 'available' : 'used'}`}
          onClick={() => toggleAction('action')}
          title="Action"
        >
          <ActionIcon size={14} />
          <span>Action</span>
        </button>
        <button 
          className={`action-btn bonus ${actions.bonus ? 'available' : 'used'}`}
          onClick={() => toggleAction('bonus')}
          title="Bonus Action"
        >
          <BonusActionIcon size={14} />
          <span>Bonus</span>
        </button>
        <button 
          className={`action-btn reaction ${actions.reaction ? 'available' : 'used'}`}
          onClick={() => toggleAction('reaction')}
          title="Reaction"
        >
          <ReactionIcon size={14} />
          <span>React</span>
        </button>
      </div>
      <div className="movement-row">
        <MovementIcon size={14} />
        <span className="movement-value">{actions.movement}ft</span>
        <div className="movement-buttons">
          <button onClick={() => spendMovement(5)}>-5</button>
          <button onClick={() => spendMovement(10)}>-10</button>
          <button onClick={() => spendMovement(-actions.movement + (creature.speed || 30))}>Reset</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Status Effects Display for Creature
 */
function CreatureStatusEffects({ effects = [], onRemove }) {
  if (effects.length === 0) return null;
  
  return (
    <div className="creature-effects">
      {effects.map(effectId => {
        const effect = STATUS_EFFECTS.find(e => e.id === effectId);
        if (!effect) return null;
        return (
          <span 
            key={effectId} 
            className="effect-badge"
            style={{ backgroundColor: effect.color }}
            onClick={() => onRemove(effectId)}
            title={`${effect.name}: ${effect.description} (click to remove)`}
          >
            {effect.icon}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Creature Editor Modal
 */
function CreatureEditor({ creature, onSave, onCancel }) {
  const [form, setForm] = useState(creature || encounterDatabase.createCreature());

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="creature-editor-modal">
        <div className="modal-header">
          <h3>{creature ? 'Edit Creature' : 'Add Creature'}</h3>
          <button className="btn-close" onClick={onCancel}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Creature name"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="monster">Monster</option>
                <option value="npc">NPC</option>
                <option value="minion">Minion</option>
                <option value="boss">Boss</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>HP</label>
              <input
                type="number"
                className="input"
                value={form.maxHp}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleChange('maxHp', val);
                  handleChange('hp', val);
                }}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Armor</label>
              <input
                type="number"
                className="input"
                value={form.armor}
                onChange={(e) => handleChange('armor', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Speed (ft)</label>
              <input
                type="number"
                className="input"
                value={form.speed || 30}
                onChange={(e) => handleChange('speed', parseInt(e.target.value) || 30)}
                min="0"
                step="5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Initiative Bonus</label>
              <input
                type="number"
                className="input"
                value={form.initiative}
                onChange={(e) => handleChange('initiative', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Attack</label>
              <input
                type="number"
                className="input"
                value={form.attack}
                onChange={(e) => handleChange('attack', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Damage</label>
              <input
                type="text"
                className="input"
                value={form.damage}
                onChange={(e) => handleChange('damage', e.target.value)}
                placeholder="e.g., 1d6+2"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Special abilities, tactics, etc."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Token Color</label>
            <div className="color-picker">
              {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map(color => (
                <button
                  key={color}
                  className={`color-btn ${form.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            <CheckIcon size={16} /> Save Creature
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Encounter Editor
 */
function EncounterEditor({ encounter, onSave, onCancel }) {
  const [form, setForm] = useState(encounter || encounterDatabase.createEncounter());
  const [editingCreature, setEditingCreature] = useState(null);
  const [showCreatureEditor, setShowCreatureEditor] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCreature = () => {
    setEditingCreature(null);
    setShowCreatureEditor(true);
  };

  const handleEditCreature = (creature) => {
    setEditingCreature(creature);
    setShowCreatureEditor(true);
  };

  const handleSaveCreature = (creature) => {
    if (editingCreature) {
      // Update existing
      setForm(prev => ({
        ...prev,
        creatures: prev.creatures.map(c => c.id === creature.id ? creature : c)
      }));
    } else {
      // Add new
      setForm(prev => ({
        ...prev,
        creatures: [...prev.creatures, { ...creature, id: Date.now().toString() }]
      }));
    }
    setShowCreatureEditor(false);
    setEditingCreature(null);
  };

  const handleRemoveCreature = (id) => {
    setForm(prev => ({
      ...prev,
      creatures: prev.creatures.filter(c => c.id !== id)
    }));
  };

  const handleDuplicateCreature = (creature) => {
    setForm(prev => {
      const newCreature = {
        ...creature,
        id: Date.now().toString(),
        name: `${creature.name} (copy)`
      };
      return {
        ...prev,
        creatures: [...prev.creatures, newCreature]
      };
    });
  };

  return (
    <div className="encounter-editor">
      <div className="editor-header">
        <h2>{encounter ? 'Edit Encounter' : 'Create Encounter'}</h2>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>

      <div className="editor-content">
        <div className="form-section">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Encounter Name</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Ambush at the Warehouse"
              />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select
                className="input"
                value={form.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="deadly">Deadly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Environment</label>
              <select
                className="input"
                value={form.environment}
                onChange={(e) => handleChange('environment', e.target.value)}
              >
                <option value="urban">Urban</option>
                <option value="wilderness">Wilderness</option>
                <option value="underground">Underground</option>
                <option value="building">Building/Indoor</option>
                <option value="supernatural">Supernatural</option>
              </select>
            </div>
            <div className="form-group">
              <label>XP Reward</label>
              <input
                type="number"
                className="input"
                value={form.xpReward}
                onChange={(e) => handleChange('xpReward', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the encounter setup, objectives, and special conditions..."
              rows={3}
            />
          </div>
        </div>

        <div className="creatures-section">
          <div className="section-header">
            <h3>Creatures ({form.creatures.length})</h3>
            <button className="btn btn-success btn-sm" onClick={handleAddCreature}>
              <PlusIcon size={14} /> Add Creature
            </button>
          </div>

          {form.creatures.length === 0 ? (
            <div className="empty-creatures">
              <p>No creatures added yet. Add monsters, NPCs, or minions to this encounter.</p>
            </div>
          ) : (
            <div className="creatures-list">
              {form.creatures.map(creature => (
                <div key={creature.id} className="creature-item">
                  <div 
                    className="creature-token"
                    style={{ backgroundColor: creature.color || CREATURE_COLORS[creature.type] }}
                  >
                    {creature.name[0]}
                  </div>
                  <div className="creature-info">
                    <span className="creature-name">{creature.name}</span>
                    <span className="creature-type">{creature.type}</span>
                  </div>
                  <div className="creature-stats">
                    <span className="stat"><HeartIcon size={14} /> {creature.maxHp}</span>
                    <span className="stat"><ShieldIcon size={14} /> {creature.armor}</span>
                  </div>
                  <div className="creature-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDuplicateCreature(creature)}
                      title="Duplicate"
                    >
                      +
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEditCreature(creature)}
                      title="Edit"
                    >
                      <EditIcon size={14} />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => handleRemoveCreature(creature.id)}
                      title="Remove"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>DM Notes</label>
          <textarea
            className="input textarea"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Tactics, secrets, contingencies..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Loot</label>
          <textarea
            className="input textarea"
            value={form.loot}
            onChange={(e) => handleChange('loot', e.target.value)}
            placeholder="Items, money, information gained..."
            rows={2}
          />
        </div>
      </div>

      <div className="editor-footer">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>
          <CheckIcon size={16} /> Save Encounter
        </button>
      </div>

      {showCreatureEditor && (
        <CreatureEditor
          creature={editingCreature}
          onSave={handleSaveCreature}
          onCancel={() => {
            setShowCreatureEditor(false);
            setEditingCreature(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Active Combat View
 */
function ActiveCombat({ encounter, onUpdate, onEnd }) {
  const [combat, setCombat] = useState(encounter);
  const [showStatusSelector, setShowStatusSelector] = useState(null); // creatureId
  
  const currentTurnCreature = combat.initiativeOrder[combat.turn];

  const handleHPChange = (creatureId, delta) => {
    setCombat(prev => {
      const updated = {
        ...prev,
        creatures: prev.creatures.map(c => {
          if (c.id === creatureId) {
            return { ...c, hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) };
          }
          return c;
        }),
        initiativeOrder: prev.initiativeOrder.map(c => {
          if (c.id === creatureId) {
            return { ...c, hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) };
          }
          return c;
        })
      };
      onUpdate(updated);
      return updated;
    });
  };

  const handleCreatureUpdate = (updatedCreature) => {
    setCombat(prev => {
      const updated = {
        ...prev,
        creatures: prev.creatures.map(c => c.id === updatedCreature.id ? updatedCreature : c),
        initiativeOrder: prev.initiativeOrder.map(c => c.id === updatedCreature.id ? updatedCreature : c)
      };
      onUpdate(updated);
      return updated;
    });
  };

  const handleToggleStatus = (creatureId, effectId) => {
    setCombat(prev => {
      const updated = {
        ...prev,
        creatures: prev.creatures.map(c => {
          if (c.id === creatureId) {
            const effects = c.statusEffects || [];
            const hasEffect = effects.includes(effectId);
            return {
              ...c,
              statusEffects: hasEffect 
                ? effects.filter(e => e !== effectId)
                : [...effects, effectId]
            };
          }
          return c;
        }),
        initiativeOrder: prev.initiativeOrder.map(c => {
          if (c.id === creatureId) {
            const effects = c.statusEffects || [];
            const hasEffect = effects.includes(effectId);
            return {
              ...c,
              statusEffects: hasEffect 
                ? effects.filter(e => e !== effectId)
                : [...effects, effectId]
            };
          }
          return c;
        })
      };
      onUpdate(updated);
      return updated;
    });
  };

  const handleRemoveStatus = (creatureId, effectId) => {
    handleToggleStatus(creatureId, effectId);
  };

  const handleNextTurn = () => {
    setCombat(prev => {
      let nextTurn = prev.turn + 1;
      let nextRound = prev.round;
      
      if (nextTurn >= prev.initiativeOrder.length) {
        nextTurn = 0;
        nextRound += 1;
      }
      
      // Reset actions for the creature whose turn it now is
      const nextCreature = prev.initiativeOrder[nextTurn];
      const updatedCreatures = prev.creatures.map(c => {
        if (c.id === nextCreature?.id) {
          return {
            ...c,
            actions: { action: true, bonus: true, reaction: true, movement: c.speed || 30 }
          };
        }
        return c;
      });
      const updatedInitOrder = prev.initiativeOrder.map(c => {
        if (c.id === nextCreature?.id) {
          return {
            ...c,
            actions: { action: true, bonus: true, reaction: true, movement: c.speed || 30 }
          };
        }
        return c;
      });
      
      const updated = { 
        ...prev, 
        turn: nextTurn, 
        round: nextRound,
        creatures: updatedCreatures,
        initiativeOrder: updatedInitOrder
      };
      onUpdate(updated);
      return updated;
    });
  };

  const handlePreviousTurn = () => {
    setCombat(prev => {
      let nextTurn = prev.turn - 1;
      let nextRound = prev.round;
      
      if (nextTurn < 0) {
        nextTurn = prev.initiativeOrder.length - 1;
        nextRound = Math.max(1, nextRound - 1);
      }
      
      const updated = { ...prev, turn: nextTurn, round: nextRound };
      onUpdate(updated);
      return updated;
    });
  };

  const handleTogglePause = () => {
    setCombat(prev => {
      const updated = { 
        ...prev, 
        status: prev.status === 'active' ? 'paused' : 'active' 
      };
      onUpdate(updated);
      return updated;
    });
  };

  const handleEndCombat = () => {
    if (window.confirm('End this combat encounter?')) {
      const updated = { ...combat, status: 'completed' };
      onUpdate(updated);
      onEnd(updated);
    }
  };

  // Sort creatures by current HP for display
  const aliveCreatures = combat.creatures.filter(c => c.hp > 0);
  const deadCreatures = combat.creatures.filter(c => c.hp <= 0);

  return (
    <div className="active-combat">
      {/* Combat Header */}
      <div className="combat-info-header">
        <div className="combat-status">
          <h2>{combat.name}</h2>
          <span className={`status-badge ${combat.status}`}>
            {combat.status === 'active' ? 'In Progress' : 'Paused'}
          </span>
        </div>
        <div className="combat-round">
          <span className="round-label">Round</span>
          <span className="round-number">{combat.round}</span>
        </div>
      </div>

      {/* Turn Tracker */}
      <div className="turn-tracker">
        <button className="btn btn-outline btn-sm" onClick={handlePreviousTurn}>
          ← Prev
        </button>
        <div className="current-turn">
          {currentTurnCreature ? (
            <>
              <div 
                className="turn-token"
                style={{ backgroundColor: currentTurnCreature.color || CREATURE_COLORS[currentTurnCreature.type] }}
              >
                {currentTurnCreature.name[0]}
              </div>
              <span className="turn-name">{currentTurnCreature.name}&apos;s Turn</span>
            </>
          ) : (
            <span>No combatants</span>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleNextTurn}>
          Next <SkipIcon size={14} />
        </button>
      </div>

      {/* Current Turn Action Economy */}
      {currentTurnCreature && (
        <div className="current-turn-actions">
          <h4>Action Economy - {currentTurnCreature.name}</h4>
          <ActionEconomy 
            creature={currentTurnCreature}
            onUpdate={handleCreatureUpdate}
          />
        </div>
      )}

      {/* Initiative Order */}
      <div className="initiative-order">
        <h4>Initiative Order</h4>
        <div className="initiative-list">
          {combat.initiativeOrder.map((creature, index) => (
            <div 
              key={creature.id} 
              className={`initiative-item ${index === combat.turn ? 'active' : ''} ${creature.hp <= 0 ? 'dead' : ''}`}
            >
              <span className="init-order">{index + 1}</span>
              <div 
                className="init-token"
                style={{ backgroundColor: creature.color || CREATURE_COLORS[creature.type] }}
              >
                {creature.name[0]}
              </div>
              <span className="init-name">{creature.name}</span>
              <CreatureStatusEffects 
                effects={creature.statusEffects} 
                onRemove={(effectId) => handleRemoveStatus(creature.id, effectId)}
              />
              <span className="init-hp">{creature.hp}/{creature.maxHp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creatures Grid */}
      <div className="combat-creatures">
        <h4>Combatants</h4>
        <div className="creatures-grid">
          {aliveCreatures.map(creature => (
            <div key={creature.id} className={`combat-creature-card ${combat.initiativeOrder[combat.turn]?.id === creature.id ? 'current-turn' : ''}`}>
              <div className="creature-header" style={{ backgroundColor: creature.color || CREATURE_COLORS[creature.type] }}>
                <span className="creature-name">{creature.name}</span>
                <span className="creature-type-badge">{creature.type}</span>
              </div>
              <div className="creature-body">
                {/* Status Effects */}
                <div className="creature-status-row">
                  <CreatureStatusEffects 
                    effects={creature.statusEffects} 
                    onRemove={(effectId) => handleRemoveStatus(creature.id, effectId)}
                  />
                  <button 
                    className="btn-add-status"
                    onClick={() => setShowStatusSelector(creature.id)}
                    title="Add/Remove Status"
                  >
                    +
                  </button>
                </div>

                <div className="hp-bar-container">
                  <div 
                    className="hp-bar" 
                    style={{ width: `${(creature.hp / creature.maxHp) * 100}%` }}
                  />
                  <span className="hp-text">{creature.hp} / {creature.maxHp}</span>
                </div>
                <div className="hp-controls">
                  <button className="btn-hp" onClick={() => handleHPChange(creature.id, -5)}>-5</button>
                  <button className="btn-hp" onClick={() => handleHPChange(creature.id, -1)}>-1</button>
                  <button className="btn-hp heal" onClick={() => handleHPChange(creature.id, 1)}>+1</button>
                  <button className="btn-hp heal" onClick={() => handleHPChange(creature.id, 5)}>+5</button>
                </div>
                <div className="creature-stats-row">
                  <span><ShieldIcon size={12} /> {creature.armor}</span>
                  <span>ATK +{creature.attack}</span>
                  <span>DMG {creature.damage}</span>
                  <span>{creature.speed || 30}ft</span>
                </div>
                {creature.notes && (
                  <div className="creature-notes">{creature.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {deadCreatures.length > 0 && (
          <>
            <h4 className="dead-section-title">Defeated</h4>
            <div className="dead-creatures">
              {deadCreatures.map(creature => (
                <div key={creature.id} className="dead-creature">
                  <span>{creature.name}</span>
                  <button className="btn-revive" onClick={() => handleHPChange(creature.id, 1)}>
                    Revive
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Combat Controls */}
      <div className="combat-controls">
        <button className="btn btn-outline" onClick={handleTogglePause}>
          {combat.status === 'active' ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          {combat.status === 'active' ? 'Pause' : 'Resume'}
        </button>
        <button className="btn btn-danger" onClick={handleEndCombat}>
          End Combat
        </button>
      </div>

      {/* Status Effect Selector Modal */}
      {showStatusSelector && (
        <StatusEffectSelector
          currentEffects={combat.creatures.find(c => c.id === showStatusSelector)?.statusEffects || []}
          onToggle={(effectId) => handleToggleStatus(showStatusSelector, effectId)}
          onClose={() => setShowStatusSelector(null)}
        />
      )}
    </div>
  );
}

/**
 * Main Combat App
 */
function CombatApp() {
  const [isDM] = useState(() => dmMode.isDM());
  // Initialize encounters from storage
  const [encounters, setEncounters] = useState(() => encounterDatabase.getAllEncounters());
  // Initialize active encounter from storage
  const [activeEncounter, setActiveEncounter] = useState(() => encounterDatabase.getActiveEncounter());
  const [showEditor, setShowEditor] = useState(false);
  const [editingEncounter, setEditingEncounter] = useState(null);

  // Helper function to reload encounters
  const reloadEncounters = () => {
    const all = encounterDatabase.getAllEncounters();
    setEncounters(all);
  };

  useEffect(() => {
    // Listen for encounter syncs from DM
    const handleEncounterSync = (data) => {
      if (data.action === 'start' || data.action === 'update') {
        setActiveEncounter(data.encounter);
      } else if (data.action === 'end') {
        setActiveEncounter(null);
      }
    };

    wsClient.on('encounter_sync', handleEncounterSync);
    return () => wsClient.off('encounter_sync', handleEncounterSync);
  }, []);

  const handleCreateEncounter = () => {
    setEditingEncounter(null);
    setShowEditor(true);
  };

  const handleEditEncounter = (encounter) => {
    setEditingEncounter(encounter);
    setShowEditor(true);
  };

  const handleSaveEncounter = (encounter) => {
    encounterDatabase.saveEncounter(encounter);
    reloadEncounters();
    setShowEditor(false);
    setEditingEncounter(null);
  };

  const handleDeleteEncounter = (id) => {
    if (window.confirm('Delete this encounter?')) {
      encounterDatabase.deleteEncounter(id);
      reloadEncounters();
    }
  };

  const handleStartEncounter = (encounter) => {
    // Roll initiative for all creatures
    const creaturesWithInit = encounter.creatures.map(c => ({
      ...c,
      initiativeRoll: Math.floor(Math.random() * 10) + 1 + (c.initiative || 0)
    }));

    // Sort by initiative (highest first)
    const initiativeOrder = [...creaturesWithInit].sort((a, b) => b.initiativeRoll - a.initiativeRoll);

    const activeEnc = {
      ...encounter,
      creatures: creaturesWithInit,
      initiativeOrder,
      round: 1,
      turn: 0,
      status: 'active'
    };

    setActiveEncounter(activeEnc);
    encounterDatabase.setActiveEncounter(activeEnc);

    // Sync to players
    wsClient.syncEncounter(activeEnc, 'start');
  };

  const handleUpdateCombat = (updated) => {
    setActiveEncounter(updated);
    encounterDatabase.setActiveEncounter(updated);
    wsClient.syncEncounter(updated, 'update');
  };

  const handleEndCombat = (finalState) => {
    setActiveEncounter(null);
    encounterDatabase.setActiveEncounter(null);
    wsClient.syncEncounter(finalState, 'end');
  };

  // Show active combat if there's one
  if (activeEncounter && activeEncounter.status !== 'completed') {
    return (
      <div className="combat-app">
        <ActiveCombat
          encounter={activeEncounter}
          onUpdate={handleUpdateCombat}
          onEnd={handleEndCombat}
        />
      </div>
    );
  }

  // Show encounter editor
  if (showEditor) {
    return (
      <div className="combat-app">
        <EncounterEditor
          encounter={editingEncounter}
          onSave={handleSaveEncounter}
          onCancel={() => {
            setShowEditor(false);
            setEditingEncounter(null);
          }}
        />
      </div>
    );
  }

  // Main view
  return (
    <div className="combat-app">
      <div className="combat-header">
        <h1><SwordsIcon size={32} /> Combat</h1>
        {isDM && (
          <button className="btn btn-success" onClick={handleCreateEncounter}>
            <PlusIcon size={16} /> Create Encounter
          </button>
        )}
      </div>

      <div className="combat-content">
        {isDM ? (
          // DM View - Show encounter list
          <>
            <h2 className="section-title">Your Encounters</h2>
            {encounters.length === 0 ? (
              <div className="empty-state">
                <SwordsIcon size={48} />
                <h3>No Encounters Yet</h3>
                <p>Create your first combat encounter to get started.</p>
                <button className="btn btn-primary" onClick={handleCreateEncounter}>
                  <PlusIcon size={16} /> Create Encounter
                </button>
              </div>
            ) : (
              <div className="encounters-list">
                {encounters.map(enc => (
                  <div key={enc.id} className="encounter-card">
                    <div className="encounter-header">
                      <h3>{enc.name}</h3>
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: DIFFICULTY_COLORS[enc.difficulty] }}
                      >
                        {enc.difficulty}
                      </span>
                    </div>
                    <p className="encounter-desc">{enc.description || 'No description'}</p>
                    <div className="encounter-meta">
                      <span>{enc.creatures.length} creature{enc.creatures.length !== 1 ? 's' : ''}</span>
                      <span>{enc.environment}</span>
                      {enc.xpReward > 0 && <span>{enc.xpReward} XP</span>}
                    </div>
                    <div className="encounter-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleStartEncounter(enc)}>
                        <PlayIcon size={14} /> Start
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEditEncounter(enc)}>
                        <EditIcon size={14} /> Edit
                      </button>
                      <button className="btn btn-outline btn-sm danger" onClick={() => handleDeleteEncounter(enc.id)}>
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Player View - Waiting for combat
          <div className="player-waiting">
            <div className="waiting-icon">
              <SwordsIcon size={72} />
            </div>
            <h2>Waiting for Combat</h2>
            <p>The Game Master will start combat encounters.</p>
            <p className="hint">Stay alert, Hunter. Danger could strike at any moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CombatApp;
