/**
 * DotRating Component
 * Displays and optionally edits a 1-5 (or 0-5) dot rating for Hunters RPG stats
 */
import './DotRating.css';

export function DotRating({ 
  value = 0, 
  max = 5, 
  min = 0,
  onChange, 
  label,
  size = 'md',
  variant = 'default',
  disabled = false,
  showEmpty: _showEmpty = true // eslint-disable-line no-unused-vars
}) {
  const dots = [];
  const isEditable = !!onChange && !disabled;

  const handleClick = (dotValue) => {
    if (!isEditable) return;
    
    // If clicking the current value and min allows 0, toggle to 0
    if (dotValue === value && min === 0) {
      onChange(0);
    } else {
      onChange(Math.max(min, Math.min(max, dotValue)));
    }
  };

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= value;
    dots.push(
      <button
        key={i}
        type="button"
        className={`dot ${isFilled ? 'filled' : 'empty'} ${isEditable ? 'editable' : ''}`}
        onClick={() => handleClick(i)}
        disabled={!isEditable}
        aria-label={`Set ${label || 'rating'} to ${i}`}
      />
    );
  }

  return (
    <div className={`dot-rating size-${size} variant-${variant}`}>
      {label && <span className="dot-label">{label}</span>}
      <div className="dots-container">
        {dots}
      </div>
    </div>
  );
}

/**
 * Health/Willpower Track Component
 * Displays boxes with superficial (/) and aggravated (X) damage
 */
export function DamageTrack({
  max = 10,
  superficial = 0,
  aggravated = 0,
  onChange,
  label,
  variant = 'health'
}) {
  const isEditable = !!onChange;
  
  // Calculate which boxes are filled and with what
  // Aggravated fills from left, superficial fills remaining slots
  const boxes = [];
  
  const handleBoxClick = (index, e) => {
    if (!isEditable) return;
    
    // Right click for aggravated
    if (e.type === 'contextmenu') {
      e.preventDefault();
      // Cycle: empty -> aggravated -> empty
      if (index < aggravated) {
        // Remove aggravated
        onChange({ superficial, aggravated: aggravated - 1 });
      } else {
        // Add aggravated (converts superficial if needed)
        const newAggravated = index + 1;
        const newSuperficial = Math.max(0, superficial - (newAggravated - aggravated));
        onChange({ superficial: newSuperficial, aggravated: newAggravated });
      }
    } else {
      // Left click for superficial
      // Cycle: empty -> superficial -> empty
      const totalDamage = aggravated + superficial;
      if (index < totalDamage) {
        // Remove superficial if in superficial range
        if (index >= aggravated) {
          onChange({ superficial: superficial - 1, aggravated });
        }
      } else {
        // Add superficial
        onChange({ superficial: superficial + 1, aggravated });
      }
    }
  };
  
  for (let i = 0; i < max; i++) {
    let state = 'empty';
    if (i < aggravated) {
      state = 'aggravated';
    } else if (i < aggravated + superficial) {
      state = 'superficial';
    }
    
    boxes.push(
      <button
        key={i}
        type="button"
        className={`damage-box ${state} ${isEditable ? 'editable' : ''}`}
        onClick={(e) => handleBoxClick(i, e)}
        onContextMenu={(e) => handleBoxClick(i, e)}
        disabled={!isEditable}
        aria-label={`Box ${i + 1}: ${state}`}
      >
        {state === 'superficial' && <span className="slash">/</span>}
        {state === 'aggravated' && <span className="cross">✕</span>}
      </button>
    );
  }
  
  return (
    <div className={`damage-track variant-${variant}`}>
      {label && <span className="track-label">{label}</span>}
      <div className="boxes-container">
        {boxes}
      </div>
      <div className="track-legend">
        <span className="legend-item">
          <span className="damage-box superficial small"><span className="slash">/</span></span>
          Superficial
        </span>
        <span className="legend-item">
          <span className="damage-box aggravated small"><span className="cross">✕</span></span>
          Aggravated
        </span>
      </div>
    </div>
  );
}

/**
 * Desperation Tracker Component
 * Shows desperation pool, danger level, and despair state
 */
export function DesperationTracker({
  pool = 0,
  danger = 0,
  despair = false,
  onChange,
  compact = false
}) {
  const isEditable = !!onChange;
  
  const handlePoolChange = (value) => {
    if (!isEditable) return;
    onChange({ pool: value, danger, despair });
  };
  
  const handleDangerChange = (value) => {
    if (!isEditable) return;
    onChange({ pool, danger: value, despair });
  };
  
  const handleDespairToggle = () => {
    if (!isEditable) return;
    onChange({ pool, danger, despair: !despair });
  };
  
  return (
    <div className={`desperation-tracker ${compact ? 'compact' : ''}`}>
      <div className="desperation-row">
        <DotRating
          value={pool}
          max={5}
          min={0}
          label="Desperation"
          onChange={isEditable ? handlePoolChange : undefined}
          variant="desperation"
        />
      </div>
      <div className="desperation-row">
        <DotRating
          value={danger}
          max={5}
          min={0}
          label="Danger"
          onChange={isEditable ? handleDangerChange : undefined}
          variant="danger"
        />
      </div>
      <div className="desperation-row despair-row">
        <span className="despair-label">Despair</span>
        <button
          type="button"
          className={`despair-toggle ${despair ? 'active' : ''}`}
          onClick={handleDespairToggle}
          disabled={!isEditable}
        >
          {despair ? 'IN DESPAIR' : 'Clear'}
        </button>
      </div>
    </div>
  );
}

export default DotRating;
