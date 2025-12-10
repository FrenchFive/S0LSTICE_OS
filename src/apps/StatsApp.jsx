import { useState, useEffect } from 'react';
import './StatsApp.css';
import { database as db } from '../utils/database';
import * as dice from '../utils/dice';
import { wsClient } from '../utils/websocket';

export default function StatsApp() {
  const [character, setCharacter] = useState(null);
  const [selectedDice, setSelectedDice] = useState([]);
  const [selectedBonuses, setSelectedBonuses] = useState([]);
  const [recentRolls, setRecentRolls] = useState([]);

  useEffect(() => {
    loadCharacter();
    loadRecentRolls();
  }, []);

  const loadCharacter = () => {
    const currentCharId = db.getCurrentCharacterId();
    if (currentCharId) {
      const char = db.getCharacter(currentCharId);
      if (char) {
        setCharacter(char);
      }
    }
  };

  const loadRecentRolls = () => {
    const saved = localStorage.getItem('statsapp_recent_rolls');
    if (saved) {
      setRecentRolls(JSON.parse(saved).slice(0, 10));
    }
  };

  const saveRecentRoll = (roll) => {
    const updated = [roll, ...recentRolls].slice(0, 10);
    setRecentRolls(updated);
    localStorage.setItem('statsapp_recent_rolls', JSON.stringify(updated));
  };

  const getModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (mod) => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleStatClick = (statName, statValue) => {
    const modifier = getModifier(statValue);
    const bonus = { stat: statName, value: modifier };
    
    // Add to bonuses if not already there
    if (!selectedBonuses.find(b => b.stat === statName)) {
      setSelectedBonuses([...selectedBonuses, bonus]);
    }
  };

  const handleStatRightClick = (e, statName) => {
    e.preventDefault();
    // Remove bonus
    setSelectedBonuses(selectedBonuses.filter(b => b.stat !== statName));
  };

  const handleDiceClick = (diceType) => {
    setSelectedDice([...selectedDice, diceType]);
  };

  const handleDiceRightClick = (e, index) => {
    e.preventDefault();
    const newDice = [...selectedDice];
    newDice.splice(index, 1);
    setSelectedDice(newDice);
  };

  const handleRoll = () => {
    if (selectedDice.length === 0) {
      alert('Please select at least one die to roll');
      return;
    }

    const results = [];
    let total = 0;

    // Roll each die
    selectedDice.forEach(diceType => {
      const result = dice.rollDice(diceType, 1);
      results.push({ dice: diceType, value: result.values[0] });
      total += result.total;
    });

    // Add bonuses
    const bonusTotal = selectedBonuses.reduce((sum, b) => sum + b.value, 0);
    total += bonusTotal;

    const roll = {
      id: Date.now(),
      timestamp: Date.now(),
      dice: selectedDice,
      bonuses: selectedBonuses,
      results,
      bonusTotal,
      total,
      character: character?.name || 'Unknown'
    };

    saveRecentRoll(roll);

    // Send to server
    if (wsClient && wsClient.isConnected()) {
      wsClient.sendDiceRoll({
        ...roll,
        player: character?.name || 'Unknown'
      });
    }

    // Clear selection
    setSelectedDice([]);
    setSelectedBonuses([]);
  };

  const getTotalBonus = () => {
    return selectedBonuses.reduce((sum, b) => sum + b.value, 0);
  };

  if (!character) {
    return (
      <div className="stats-app">
        <div className="no-character">
          <p>No character selected</p>
          <p>Go to Character app to select or create one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-app">
      <div className="stats-header">
        <h2>📊 Stats & Dice Roller</h2>
        <div className="character-name">{character.name}</div>
      </div>

      <div className="stats-section">
        <h3>Character Stats (Click to add bonus)</h3>
        <div className="stats-grid">
          <div 
            className={`stat-box ${selectedBonuses.find(b => b.stat === 'STR') ? 'selected' : ''}`}
            onClick={() => handleStatClick('STR', character.stats.str)}
            onContextMenu={(e) => handleStatRightClick(e, 'STR')}
          >
            <div className="stat-label">STR</div>
            <div className="stat-value">{character.stats.str}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.str))}</div>
          </div>

          <div 
            className={`stat-box ${selectedBonuses.find(b => b.stat === 'DEX') ? 'selected' : ''}`}
            onClick={() => handleStatClick('DEX', character.stats.dex)}
            onContextMenu={(e) => handleStatRightClick(e, 'DEX')}
          >
            <div className="stat-label">DEX</div>
            <div className="stat-value">{character.stats.dex}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.dex))}</div>
          </div>

          <div 
            className={`stat-box ${selectedBonuses.find(b => b.stat === 'CON') ? 'selected' : ''}`}
            onClick={() => handleStatClick('CON', character.stats.con)}
            onContextMenu={(e) => handleStatRightClick(e, 'CON')}
          >
            <div className="stat-label">CON</div>
            <div className="stat-value">{character.stats.con}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.con))}</div>
          </div>

          <div 
            className={`stat-box ${selectedBonuses.find(b => b.stat === 'INT') ? 'selected' : ''}`}
            onClick={() => handleStatClick('INT', character.stats.int)}
            onContextMenu={(e) => handleStatRightClick(e, 'INT')}
          >
            <div className="stat-label">INT</div>
            <div className="stat-value">{character.stats.int}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.int))}</div>
          </div>

          <div 
            className={`stat-box ${selectedBonuses.find(b => b.stat === 'WIS') ? 'selected' : ''}`}
            onClick={() => handleStatClick('WIS', character.stats.wis)}
            onContextMenu={(e) => handleStatRightClick(e, 'WIS')}
          >
            <div className="stat-label">WIS</div>
            <div className="stat-value">{character.stats.wis}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.wis))}</div>
          </div>

          <div 
            className={`stat-box ${selectedBonuses.find(b => b.stat === 'CHA') ? 'selected' : ''}`}
            onClick={() => handleStatClick('CHA', character.stats.cha)}
            onContextMenu={(e) => handleStatRightClick(e, 'CHA')}
          >
            <div className="stat-label">CHA</div>
            <div className="stat-value">{character.stats.cha}</div>
            <div className="stat-modifier">{formatModifier(getModifier(character.stats.cha))}</div>
          </div>
        </div>
        <div className="stats-hint">💡 Right-click to remove bonus</div>
      </div>

      <div className="dice-section">
        <h3>Dice Selection (Click to add, Right-click to remove)</h3>
        <div className="dice-buttons">
          <button onClick={() => handleDiceClick(6)} className="btn-dice">🎲 D6</button>
          <button onClick={() => handleDiceClick(10)} className="btn-dice">🎲 D10</button>
          <button onClick={() => handleDiceClick(20)} className="btn-dice">🎲 D20</button>
          <button onClick={() => handleDiceClick(100)} className="btn-dice">🎲 D100</button>
        </div>

        <div className="selected-dice">
          <h4>Selected Dice:</h4>
          {selectedDice.length === 0 ? (
            <div className="empty-selection">No dice selected</div>
          ) : (
            <div className="dice-queue">
              {selectedDice.map((d, index) => (
                <div 
                  key={index} 
                  className="dice-chip"
                  onContextMenu={(e) => handleDiceRightClick(e, index)}
                >
                  🎲 D{d}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="selected-bonuses">
          <h4>Selected Bonuses:</h4>
          {selectedBonuses.length === 0 ? (
            <div className="empty-selection">No bonuses selected</div>
          ) : (
            <div className="bonus-list">
              {selectedBonuses.map((bonus, index) => (
                <div key={index} className="bonus-chip">
                  {bonus.stat}: {formatModifier(bonus.value)}
                </div>
              ))}
              <div className="bonus-total">
                Total Bonus: {formatModifier(getTotalBonus())}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleRoll} 
          className="btn-roll"
          disabled={selectedDice.length === 0}
        >
          🎲 Roll Dice
        </button>
      </div>

      <div className="recent-rolls-section">
        <h3>Recent Rolls</h3>
        {recentRolls.length === 0 ? (
          <div className="empty-state">No rolls yet</div>
        ) : (
          <div className="rolls-list">
            {recentRolls.map(roll => (
              <div key={roll.id} className="roll-card">
                <div className="roll-header">
                  <span className="roll-time">{new Date(roll.timestamp).toLocaleTimeString()}</span>
                  <span className="roll-total">Total: {roll.total}</span>
                </div>
                <div className="roll-details">
                  <div className="roll-dice">
                    {roll.results.map((r, i) => (
                      <span key={i} className="dice-result">D{r.dice}: {r.value}</span>
                    ))}
                  </div>
                  {roll.bonuses.length > 0 && (
                    <div className="roll-bonuses">
                      Bonuses: {roll.bonuses.map(b => `${b.stat}(${formatModifier(b.value)})`).join(', ')}
                      {' = '}{formatModifier(roll.bonusTotal)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
