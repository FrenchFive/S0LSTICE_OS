import { useState, useEffect } from 'react';
import './StatsApp.css';
import { database as db } from '../utils/database';
import {
  rollHuntersPool,
  formatOutcome,
  saveRollToHistory,
  getRollHistory
} from '../utils/dice';
import {
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  SKILLS,
  SKILL_LABELS,
  getAttributeValue,
  getSkillValue,
  calculateHealth,
  calculateWillpower
} from '../utils/huntersData';
import {
  calculateLevel,
  getAvailableXP,
  getXPToNextLevel,
  getRecentChanges
} from '../utils/levelUp';
import { DotRating, DesperationTracker } from '../components/DotRating';
import { ChartIcon, DiceIcon, StarIcon } from '../components/icons/Icons';
import LevelUpModal from '../components/LevelUpModal';

export default function StatsApp() {
  const [character, setCharacter] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [modifier, setModifier] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [desperationDice, setDesperationDice] = useState(0);
  const [recentRolls, setRecentRolls] = useState([]);
  const [lastRoll, setLastRoll] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [recentChanges, setRecentChanges] = useState([]);

  const loadCharacter = () => {
    const currentCharId = db.getCurrentCharacterId();
    if (currentCharId) {
      const char = db.getCharacter(currentCharId);
      if (char) {
        setCharacter(char);
        setRecentChanges(getRecentChanges(char, 48));
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCharacter();
    setRecentRolls(getRollHistory().slice(0, 10));
  }, []);

  const handleCharacterUpdate = (updated) => {
    const withDerived = {
      ...updated,
      health: { ...updated.health, max: calculateHealth(updated) },
      willpower: { ...updated.willpower, max: calculateWillpower(updated) }
    };
    db.saveCharacter(withDerived);
    setCharacter(withDerived);
    setRecentChanges(getRecentChanges(withDerived, 48));
  };

  // Get XP info
  const xpInfo = character?.experience ? {
    level: calculateLevel(character.experience.total || 0),
    available: getAvailableXP(character),
    total: character.experience.total || 0,
    progress: getXPToNextLevel(character.experience.total || 0)
  } : { level: { level: 1, title: 'Fledgling Hunter' }, available: 0, total: 0, progress: { progress: 0 } };

  // Check if a field was recently changed
  const isHighlighted = (fieldPath) => {
    return recentChanges.some(change => change.field === fieldPath);
  };

  const handleAttributeClick = (attrName) => {
    setSelectedAttribute(selectedAttribute === attrName ? null : attrName);
  };

  const handleSkillClick = (skillName) => {
    setSelectedSkill(selectedSkill === skillName ? null : skillName);
  };

  const calculatePool = () => {
    let pool = modifier;
    if (selectedAttribute && character) {
      pool += getAttributeValue(character, selectedAttribute);
    }
    if (selectedSkill && character) {
      pool += getSkillValue(character, selectedSkill);
    }
    return Math.max(1, pool);
  };

  const handleRoll = () => {
    const poolSize = calculatePool();
    const result = rollHuntersPool(poolSize, desperationDice, difficulty);
    
    setLastRoll(result);
    
    // Save to history
    saveRollToHistory(result, character?.identity?.name || 'Unknown');
    setRecentRolls(getRollHistory().slice(0, 10));
    
    // Clear selection
    setSelectedAttribute(null);
    setSelectedSkill(null);
    setModifier(0);
  };

  const getAttrValue = (attrName) => {
    if (!character) return 1;
    return getAttributeValue(character, attrName);
  };

  const getSkillVal = (skillName) => {
    if (!character) return 0;
    return getSkillValue(character, skillName);
  };

  if (!character) {
    return (
      <div className="stats-app">
        <div className="no-character">
          <p>No Hunter selected</p>
          <p>Go to Character app to select or create one</p>
        </div>
      </div>
    );
  }

  const poolSize = calculatePool();
  const outcome = lastRoll ? formatOutcome(lastRoll.outcome) : null;

  return (
    <div className="stats-app hunters-mode">
      <div className="stats-header">
        <div className="stats-title">
          <h2><DiceIcon size={28} /> Dice Roller</h2>
          <div className="character-name">{character.identity?.name || character.name}</div>
        </div>
        <div className="stats-xp-display">
          <div className="xp-level-badge">
            <span className="level-num">Lvl {xpInfo.level.level}</span>
            <span className="level-title">{xpInfo.level.title}</span>
          </div>
          <button 
            className={`btn btn-sm ${xpInfo.available > 0 ? 'btn-success level-up-btn' : 'btn-outline'}`}
            onClick={() => setShowLevelUp(true)}
          >
            <StarIcon size={14} />
            {xpInfo.available > 0 ? `${xpInfo.available} XP` : 'Level Up'}
          </button>
        </div>
      </div>

      {/* XP Progress Bar */}
      {character.experience && xpInfo.progress.nextLevel && (
        <div className="stats-xp-bar">
          <div className="xp-bar-track">
            <div 
              className="xp-bar-fill" 
              style={{ width: `${xpInfo.progress.progress}%` }}
            />
          </div>
          <div className="xp-bar-info">
            <span>{xpInfo.progress.needed} XP to Level {xpInfo.progress.nextLevel.level}</span>
          </div>
        </div>
      )}

      {/* Dice Pool Builder */}
      <div className="pool-builder-section">
        <h3>Build Your Pool</h3>
        
        <div className="pool-config">
          <div className="pool-display">
            <span className="pool-label">Dice Pool</span>
            <span className="pool-value">{poolSize}d10</span>
            {desperationDice > 0 && (
              <span className="desperation-badge">+{desperationDice} Desperation</span>
            )}
          </div>
          
          <div className="pool-breakdown">
            {selectedAttribute && (
              <span className="pool-part">{ATTRIBUTE_LABELS[selectedAttribute]} ({getAttrValue(selectedAttribute)})</span>
            )}
            {selectedSkill && (
              <span className="pool-part">+ {SKILL_LABELS[selectedSkill]} ({getSkillVal(selectedSkill)})</span>
            )}
            {modifier !== 0 && (
              <span className="pool-part modifier">{modifier > 0 ? '+' : ''}{modifier} Mod</span>
            )}
          </div>
        </div>

        <div className="pool-controls">
          <div className="control-group">
            <label>Difficulty</label>
            <div className="number-input">
              <button onClick={() => setDifficulty(Math.max(1, difficulty - 1))}>−</button>
              <span>{difficulty}</span>
              <button onClick={() => setDifficulty(Math.min(10, difficulty + 1))}>+</button>
            </div>
          </div>
          
          <div className="control-group">
            <label>Modifier</label>
            <div className="number-input">
              <button onClick={() => setModifier(modifier - 1)}>−</button>
              <span>{modifier > 0 ? '+' : ''}{modifier}</span>
              <button onClick={() => setModifier(modifier + 1)}>+</button>
            </div>
          </div>
          
          <div className="control-group">
            <label>Desperation</label>
            <div className="number-input desperation">
              <button onClick={() => setDesperationDice(Math.max(0, desperationDice - 1))}>−</button>
              <span>{desperationDice}</span>
              <button onClick={() => setDesperationDice(Math.min(5, desperationDice + 1))}>+</button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleRoll} 
          className="btn-roll"
        >
          <DiceIcon size={20} /> Roll {poolSize + desperationDice}d10
        </button>
      </div>

      {/* Last Roll Result */}
      {lastRoll && (
        <div className={`roll-result ${outcome.class}`}>
          <div className="result-header">
            <span className="result-outcome">{outcome.text}</span>
            <span className="result-successes">{lastRoll.successes} / {lastRoll.difficulty} Successes</span>
          </div>
          
          <div className="dice-results">
            <div className="regular-dice">
              {lastRoll.regularResults.map((die, i) => (
                <span 
                  key={i} 
                  className={`die ${die >= 6 ? 'success' : 'fail'} ${die === 10 ? 'crit' : ''}`}
                >
                  {die}
                </span>
              ))}
            </div>
            {lastRoll.desperationResults.length > 0 && (
              <div className="desperation-dice">
                {lastRoll.desperationResults.map((die, i) => (
                  <span 
                    key={i} 
                    className={`die desperation ${die >= 6 ? 'success' : 'fail'} ${die === 10 ? 'crit' : ''}`}
                  >
                    {die}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {lastRoll.criticalPairs > 0 && (
            <div className="crit-info">
              {lastRoll.criticalPairs} Critical Pair{lastRoll.criticalPairs > 1 ? 's' : ''} (+{lastRoll.criticalPairs * 2} successes)
            </div>
          )}
        </div>
      )}

      {/* Attributes Section */}
      <div className="attributes-section">
        <h3><ChartIcon size={20} /> Attributes (Click to add to pool)</h3>
        <div className="attributes-grid">
          {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
            <div key={category} className="attribute-category">
              <h4>{label}</h4>
              {attrs.map(attr => {
                const fieldPath = `attributes.${category}.${attr}`;
                const highlighted = isHighlighted(fieldPath);
                return (
                  <div 
                    key={attr} 
                    className={`attr-row ${selectedAttribute === attr ? 'selected' : ''} ${highlighted ? 'highlighted' : ''}`}
                    onClick={() => handleAttributeClick(attr)}
                  >
                    <span className="attr-name">{ATTRIBUTE_LABELS[attr]}</span>
                    <DotRating 
                      value={getAttrValue(attr)} 
                      max={5} 
                      min={1}
                      size="sm"
                    />
                    {highlighted && <span className="new-badge">↑</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="skills-section">
        <h3>Skills (Click to add to pool)</h3>
        <div className="skills-grid">
          {Object.entries(SKILLS).map(([category, { label, skills }]) => (
            <div key={category} className="skill-category">
              <h4>{label}</h4>
              {skills.map(skill => {
                const value = getSkillVal(skill);
                const fieldPath = `skills.${category}.${skill}`;
                const highlighted = isHighlighted(fieldPath);
                return (
                  <div 
                    key={skill} 
                    className={`skill-row ${selectedSkill === skill ? 'selected' : ''} ${value === 0 ? 'untrained' : ''} ${highlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSkillClick(skill)}
                  >
                    <span className="skill-name">{SKILL_LABELS[skill]}</span>
                    <DotRating 
                      value={value} 
                      max={5} 
                      min={0}
                      size="sm"
                    />
                    {highlighted && <span className="new-badge">↑</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Rolls */}
      <div className="recent-rolls-section">
        <h3>Recent Rolls</h3>
        {recentRolls.length === 0 ? (
          <div className="empty-state">No rolls yet</div>
        ) : (
          <div className="rolls-list">
            {recentRolls.map(roll => {
              const rollOutcome = formatOutcome(roll.outcome);
              return (
                <div key={roll.id} className={`roll-card ${rollOutcome.class}`}>
                  <div className="roll-header">
                    <span className="roll-time">{new Date(roll.timestamp).toLocaleTimeString()}</span>
                    <span className={`roll-outcome-badge ${rollOutcome.class}`}>{rollOutcome.text}</span>
                  </div>
                  <div className="roll-details">
                    <span className="roll-pool">{roll.poolSize + (roll.desperationDice || 0)}d10</span>
                    <span className="roll-result">{roll.successes}/{roll.difficulty} successes</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          character={character}
          onUpdate={handleCharacterUpdate}
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}
