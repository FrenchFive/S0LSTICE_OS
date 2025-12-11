import { useState } from 'react';
import { XIcon, DiceIcon } from './icons/Icons';
import './DicePopup.css';

const DICE_TYPES = [
  { type: 'd4', sides: 4, color: '#ffb3ba' },
  { type: 'd6', sides: 6, color: '#bae1ff' },
  { type: 'd8', sides: 8, color: '#baffc9' },
  { type: 'd10', sides: 10, color: '#ffffba' },
  { type: 'd12', sides: 12, color: '#d4baff' },
  { type: 'd20', sides: 20, color: '#ffdfba' },
  { type: 'd100', sides: 100, color: '#ffc9de' },
];

function DicePopup({ onRoll, onClose }) {
  const [selectedDice, setSelectedDice] = useState({});

  const addDie = (diceType) => {
    setSelectedDice(prev => ({
      ...prev,
      [diceType]: (prev[diceType] || 0) + 1
    }));
  };

  const removeDie = (diceType) => {
    setSelectedDice(prev => {
      const newCount = (prev[diceType] || 0) - 1;
      if (newCount <= 0) {
        const { [diceType]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [diceType]: newCount };
    });
  };

  const clearAll = () => {
    setSelectedDice({});
  };

  const getTotalDice = () => {
    return Object.values(selectedDice).reduce((sum, count) => sum + count, 0);
  };

  const getDiceString = () => {
    return Object.entries(selectedDice)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => `${count}${type}`)
      .join(' + ') || 'No dice selected';
  };

  const handleRoll = () => {
    if (getTotalDice() > 0) {
      onRoll(selectedDice);
    }
  };

  return (
    <div className="dice-popup-overlay">
      <div className="dice-popup">
        <div className="dice-popup-header">
          <h2><DiceIcon size={24} /> Roll Dice</h2>
          <button className="btn-close-popup" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>

        <div className="dice-popup-content">
          {/* Selected dice display */}
          <div className="selected-dice-display">
            <div className="dice-expression">{getDiceString()}</div>
            {getTotalDice() > 0 && (
              <button className="btn-clear-dice" onClick={clearAll}>
                Clear
              </button>
            )}
          </div>

          {/* Selected dice visual */}
          {getTotalDice() > 0 && (
            <div className="selected-dice-visual">
              {Object.entries(selectedDice).map(([type, count]) => {
                const diceInfo = DICE_TYPES.find(d => d.type === type);
                return Array(count).fill(null).map((__, idx) => (
                  <div 
                    key={`${type}-${idx}`} 
                    className="selected-die"
                    style={{ backgroundColor: diceInfo?.color }}
                    onClick={() => removeDie(type)}
                    title={`Remove ${type}`}
                  >
                    <span className="die-label">{type}</span>
                    <span className="die-remove">×</span>
                  </div>
                ));
              })}
            </div>
          )}

          {/* Dice selection grid */}
          <div className="dice-selection-grid">
            {DICE_TYPES.map(dice => (
              <button
                key={dice.type}
                className="dice-select-btn"
                style={{ 
                  '--dice-color': dice.color,
                  '--dice-shadow': `${dice.color}80`
                }}
                onClick={() => addDie(dice.type)}
              >
                <div className="dice-icon-wrapper">
                  <DiceIcon size={28} />
                </div>
                <span className="dice-type-name">{dice.type.toUpperCase()}</span>
                {selectedDice[dice.type] > 0 && (
                  <span className="dice-count-badge">{selectedDice[dice.type]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Quick presets */}
          <div className="quick-presets">
            <span className="preset-label">Quick:</span>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedDice({ d20: 1 })}
            >
              1d20
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedDice({ d6: 2 })}
            >
              2d6
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedDice({ d8: 1, d6: 1 })}
            >
              1d8+1d6
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedDice({ d6: 4 })}
            >
              4d6
            </button>
          </div>
        </div>

        <div className="dice-popup-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary btn-roll"
            onClick={handleRoll}
            disabled={getTotalDice() === 0}
          >
            <DiceIcon size={18} /> Roll {getTotalDice() > 0 ? `${getTotalDice()} Dice` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DicePopup;
