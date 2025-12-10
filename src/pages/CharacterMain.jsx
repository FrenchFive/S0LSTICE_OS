import { useState, useEffect, useRef } from 'react';
import { database } from '../utils/database';
import { diceTypes, rollHuntersPool, formatOutcome, saveRollToHistory } from '../utils/dice';
import { wsClient } from '../utils/websocket';
import { DamageTrack, DesperationTracker, DotRating } from '../components/DotRating';
import DiceRoller3D from '../components/DiceRoller3D';
import {
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  getAttributeValue,
  calculateHealth,
  calculateWillpower
} from '../utils/huntersData';
import './CharacterMain.css';

function CharacterMain({ character, onUpdate }) {
  const [diceRolls, setDiceRolls] = useState([]);
  const [selectedDice, setSelectedDice] = useState(10);
  const [diceCount, setDiceCount] = useState(1);
  const [externalRoll, setExternalRoll] = useState(null);
  const [use3DDice, setUse3DDice] = useState(true);
  const [quickRollResult, setQuickRollResult] = useState(null);
  const diceRollerRef = useRef(null);

  useEffect(() => {
    if (character) {
      // Update character in WebSocket if connected
      if (wsClient.isConnected()) {
        wsClient.setCharacter(character);
      }
    }
  }, [character]);

  useEffect(() => {
    // Listen for dice rolls from other players
    const handleRemoteDiceRoll = (data) => {
      if (data.clientId !== wsClient.getClientId()) {
        // Show external roll in 3D view
        setExternalRoll({
          sides: data.roll.sides,
          count: data.roll.rolls.length
        });
        
        // Add to roll history
        const result = {
          id: Date.now(),
          type: `${data.roll.rolls.length}D${data.roll.sides}`,
          rolls: data.roll.rolls,
          total: data.roll.total,
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          player: data.character?.name || 'Unknown Player',
          isRemote: true
        };
        setDiceRolls(prev => [result, ...prev.slice(0, 9)]);
      }
    };

    wsClient.on('dice_roll', handleRemoteDiceRoll);

    return () => {
      wsClient.off('dice_roll', handleRemoteDiceRoll);
    };
  }, []);

  // Handle health/willpower damage changes
  const handleHealthChange = (damage) => {
    const updated = database.updateCharacter(character.id, {
      health: {
        ...character.health,
        superficial: damage.superficial,
        aggravated: damage.aggravated
      }
    });
    onUpdate(updated);
  };

  const handleWillpowerChange = (damage) => {
    const updated = database.updateCharacter(character.id, {
      willpower: {
        ...character.willpower,
        superficial: damage.superficial,
        aggravated: damage.aggravated
      }
    });
    onUpdate(updated);
  };

  const handleDesperationChange = (desperation) => {
    const updated = database.updateCharacter(character.id, {
      desperation
    });
    onUpdate(updated);
  };

  const handleDiceRoll = () => {
    if (use3DDice && diceRollerRef.current && diceRollerRef.current.rollDice) {
      // Trigger 3D dice roll
      diceRollerRef.current.rollDice(selectedDice, diceCount);
    } else {
      // Fallback to simple roll
      handle2DDiceRoll();
    }
  };

  const handle2DDiceRoll = () => {
    const rolls = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * selectedDice) + 1);
    }
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    
    const result = {
      id: Date.now(),
      type: `${diceCount}D${selectedDice}`,
      rolls,
      total,
      timestamp: new Date().toLocaleTimeString(),
      sides: selectedDice
    };
    
    setDiceRolls(prev => [result, ...prev.slice(0, 9)]);

    // Broadcast to multiplayer server
    if (wsClient.isConnected()) {
      wsClient.sendDiceRoll(result);
    }
  };

  const handle3DRollComplete = (rolls) => {
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    const result = {
      id: Date.now(),
      type: `${rolls.length}D${selectedDice}`,
      rolls,
      total,
      timestamp: new Date().toLocaleTimeString(),
      sides: selectedDice
    };
    
    setDiceRolls(prev => [result, ...prev.slice(0, 9)]);

    // Broadcast to multiplayer server
    if (wsClient.isConnected()) {
      wsClient.sendDiceRoll(result);
    }
  };

  // Quick d10 pool roll
  const handleQuickRoll = (poolSize) => {
    const result = rollHuntersPool(poolSize, 0, 1);
    setQuickRollResult(result);
    saveRollToHistory(result, getName());
    
    // Add to visual history
    const visualResult = {
      id: result.id,
      type: `${poolSize}d10 Pool`,
      rolls: result.allResults,
      total: result.successes,
      timestamp: new Date().toLocaleTimeString(),
      sides: 10,
      isHuntersPool: true,
      outcome: result.outcome
    };
    setDiceRolls(prev => [visualResult, ...prev.slice(0, 9)]);
  };

  // Handle both old and new character formats
  const getName = () => character?.identity?.name || character?.name || 'Unknown';
  const getImage = () => character?.identity?.portraitUrl || character?.image || null;
  const getConcept = () => character?.identity?.concept || '';
  const getCreed = () => character?.identity?.creed || '';

  if (!character) {
    return (
      <div className="character-main">
        <div className="card">
          <h2>No Hunter Selected</h2>
          <p>Please select or create a Hunter first.</p>
        </div>
      </div>
    );
  }

  // Determine if using Hunters format
  const isHuntersFormat = !!character.attributes;
  const healthMax = character.health?.max || calculateHealth(character) || 7;
  const willpowerMax = character.willpower?.max || calculateWillpower(character) || 5;

  return (
    <div className="character-main hunters-mode">
      <div className="main-layout">
        <div className="left-column">
          {/* Character Card */}
          <div className="card character-display">
            <div className="character-portrait">
              {getImage() ? (
                <img src={getImage()} alt={getName()} />
              ) : (
                <div className="default-portrait">
                  {getName()?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <h2 className="character-name">{getName()}</h2>
            <div className="character-concept">{getConcept() || 'Hunter'}</div>
            {getCreed() && <div className="character-creed">{getCreed()}</div>}
          </div>

          {/* Health Track */}
          <div className="card health-card">
            <div className="card-header">❤️ Health</div>
            <DamageTrack
              max={healthMax}
              superficial={character.health?.superficial || 0}
              aggravated={character.health?.aggravated || 0}
              onChange={handleHealthChange}
              variant="health"
            />
          </div>

          {/* Willpower Track */}
          <div className="card willpower-card">
            <div className="card-header">🧠 Willpower</div>
            <DamageTrack
              max={willpowerMax}
              superficial={character.willpower?.superficial || 0}
              aggravated={character.willpower?.aggravated || 0}
              onChange={handleWillpowerChange}
              variant="willpower"
            />
          </div>

          {/* Desperation */}
          {character.desperation && (
            <div className="card desperation-card">
              <div className="card-header">⚡ Desperation</div>
              <DesperationTracker
                pool={character.desperation.pool || 0}
                danger={character.desperation.danger || 0}
                despair={character.desperation.despair || false}
                onChange={handleDesperationChange}
                compact
              />
            </div>
          )}

          {/* Quick Attributes */}
          {isHuntersFormat && (
            <div className="card attrs-card">
              <div className="card-header">📊 Attributes</div>
              <div className="attrs-grid">
                {Object.entries(ATTRIBUTES).map(([category, { label, attrs }]) => (
                  <div key={category} className="attr-group">
                    <h4>{label}</h4>
                    {attrs.map(attr => {
                      const value = getAttributeValue(character, attr);
                      return (
                        <div 
                          key={attr} 
                          className="attr-row clickable"
                          onClick={() => handleQuickRoll(value)}
                          title={`Click to roll ${value}d10`}
                        >
                          <span className="attr-name">{ATTRIBUTE_LABELS[attr]}</span>
                          <DotRating value={value} max={5} size="sm" />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="attrs-hint">Click an attribute to quick-roll its dice pool</p>
            </div>
          )}
        </div>

        <div className="right-column">
          {/* Quick Roll Result */}
          {quickRollResult && (
            <div className={`card quick-roll-result ${quickRollResult.outcome}`}>
              <div className="quick-result-header">
                <span className="result-label">
                  {formatOutcome(quickRollResult.outcome).text}
                </span>
                <span className="result-successes">
                  {quickRollResult.successes} Successes
                </span>
              </div>
              <div className="quick-result-dice">
                {quickRollResult.allResults.map((die, i) => (
                  <span 
                    key={i} 
                    className={`die ${die >= 6 ? 'success' : 'fail'} ${die === 10 ? 'crit' : ''}`}
                  >
                    {die}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dice Roller Card */}
          <div className="card dice-roller">
            <div className="card-header">
              🎲 Dice Roller
              <button 
                className="btn-small" 
                onClick={() => setUse3DDice(!use3DDice)}
                title={use3DDice ? 'Switch to 2D' : 'Switch to 3D'}
              >
                {use3DDice ? '🎲 3D' : '🎲 2D'}
              </button>
            </div>
            
            {use3DDice && (
              <DiceRoller3D
                ref={diceRollerRef}
                diceType={selectedDice}
                diceCount={diceCount}
                onRollComplete={handle3DRollComplete}
                externalRoll={externalRoll}
              />
            )}
            
            <div className="dice-controls">
              <div className="form-group">
                <label>Number of Dice</label>
                <input
                  type="number"
                  className="input"
                  value={diceCount}
                  onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="10"
                />
              </div>
              <div className="dice-type-selector">
                {diceTypes.map(dice => (
                  <button
                    key={dice.sides}
                    className={`btn ${selectedDice === dice.sides ? 'btn-accent' : 'btn-secondary'}`}
                    onClick={() => setSelectedDice(dice.sides)}
                  >
                    {dice.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-success roll-button" onClick={handleDiceRoll}>
                🎲 Roll {diceCount}D{selectedDice}
              </button>
            </div>

            {diceRolls.length > 0 && (
              <div className="dice-results">
                <h3>Recent Rolls</h3>
                {diceRolls.map(roll => (
                  <div key={roll.id} className={`dice-result ${roll.isRemote ? 'remote-roll' : ''} ${roll.isHuntersPool ? roll.outcome : ''}`}>
                    <div className="result-header">
                      <span className="result-type">
                        {roll.isRemote && <span className="remote-badge">👥 </span>}
                        {roll.type}
                        {roll.player && <span className="player-name"> - {roll.player}</span>}
                      </span>
                      <span className="result-time">{roll.timestamp}</span>
                    </div>
                    <div className="result-rolls">
                      {roll.rolls.map((r, i) => (
                        <span 
                          key={i} 
                          className={`roll-value ${roll.isHuntersPool && r >= 6 ? 'success' : ''} ${roll.isHuntersPool && r === 10 ? 'crit' : ''}`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <div className="result-total">
                      {roll.isHuntersPool ? `${roll.total} Successes` : `Total: ${roll.total}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterMain;
