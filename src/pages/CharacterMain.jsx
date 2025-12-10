import { useState, useEffect, useRef } from 'react';
import { database } from '../utils/database';
import { diceTypes } from '../utils/dice';
import { wsClient } from '../utils/websocket';
import DiceRoller3D from '../components/DiceRoller3D';
import './CharacterMain.css';

function CharacterMain({ character, onUpdate }) {
  const [editingHp, setEditingHp] = useState(false);
  const [tempHp, setTempHp] = useState(character?.hp || 0);
  const [diceRolls, setDiceRolls] = useState([]);
  const [selectedDice, setSelectedDice] = useState(6);
  const [diceCount, setDiceCount] = useState(1);
  const [externalRoll, setExternalRoll] = useState(null);
  const [use3DDice, setUse3DDice] = useState(true);
  const diceRollerRef = useRef(null);

  useEffect(() => {
    if (character) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempHp(character.hp);
      
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

  const handleHpChange = (newHp) => {
    const clampedHp = Math.max(0, Math.min(newHp, character.maxHp));
    const updated = database.updateCharacter(character.id, { hp: clampedHp });
    onUpdate(updated);
    setTempHp(clampedHp);
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

  const getStatModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (mod) => {
    return mod >= 0 ? `+${mod}` : mod;
  };

  if (!character) {
    return (
      <div className="character-main">
        <div className="card">
          <h2>No Character Selected</h2>
          <p>Please select or create a character first.</p>
        </div>
      </div>
    );
  }

  const hpPercentage = (character.hp / character.maxHp) * 100;

  return (
    <div className="character-main">
      <div className="main-layout">
        <div className="left-column">
          {/* Character Card */}
          <div className="card character-display">
            <div className="character-portrait">
              {character.image ? (
                <img src={character.image} alt={character.name} />
              ) : (
                <div className="default-portrait">
                  {character.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <h2 className="character-name">{character.name}</h2>
            <div className="character-level">Level {character.level} Hunter</div>
          </div>

          {/* HP Card */}
          <div className="card hp-card">
            <div className="card-header">❤️ Life Points</div>
            <div className="hp-display">
              {editingHp ? (
                <div className="hp-edit">
                  <input
                    type="number"
                    className="input"
                    value={tempHp}
                    onChange={(e) => setTempHp(parseInt(e.target.value) || 0)}
                    min="0"
                    max={character.maxHp}
                  />
                  <div className="hp-buttons">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleHpChange(tempHp);
                        setEditingHp(false);
                      }}
                    >
                      ✓
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setTempHp(character.hp);
                        setEditingHp(false);
                      }}
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hp-value" onClick={() => setEditingHp(true)}>
                  <span className="hp-current">{character.hp}</span>
                  <span className="hp-separator">/</span>
                  <span className="hp-max">{character.maxHp}</span>
                </div>
              )}
            </div>
            <div className="hp-bar">
              <div
                className="hp-bar-fill"
                style={{
                  width: `${hpPercentage}%`,
                  backgroundColor: hpPercentage > 50 ? '#BAFFC9' : hpPercentage > 25 ? '#FFDFBA' : '#FF9AA2'
                }}
              />
            </div>
            <div className="hp-quick-actions">
              <button className="btn btn-danger" onClick={() => handleHpChange(character.hp - 10)}>
                -10
              </button>
              <button className="btn btn-danger" onClick={() => handleHpChange(character.hp - 1)}>
                -1
              </button>
              <button className="btn btn-success" onClick={() => handleHpChange(character.hp + 1)}>
                +1
              </button>
              <button className="btn btn-success" onClick={() => handleHpChange(character.hp + 10)}>
                +10
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card stats-card">
            <div className="card-header">📊 Character Stats</div>
            <div className="stats-display">
              {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => {
                const value = character[stat] || 10;
                const modifier = getStatModifier(value);
                return (
                  <div key={stat} className="stat-row">
                    <div className="stat-name">
                      {stat.charAt(0).toUpperCase() + stat.slice(1).substring(0, 3).toUpperCase()}
                    </div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-modifier">{formatModifier(modifier)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="right-column">
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
                  <div key={roll.id} className={`dice-result ${roll.isRemote ? 'remote-roll' : ''}`}>
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
                        <span key={i} className="roll-value">{r}</span>
                      ))}
                    </div>
                    <div className="result-total">Total: {roll.total}</div>
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
