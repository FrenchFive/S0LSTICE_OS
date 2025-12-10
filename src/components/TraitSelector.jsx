/**
 * TraitSelector Component
 * For selecting and managing Backgrounds, Merits, and Flaws
 */
import { useState } from 'react';
import { DotRating } from './DotRating';
import { 
  BACKGROUNDS, 
  MERITS, 
  FLAWS, 
  getTraitById 
} from '../data/huntersTraits';
import { 
  PlusIcon, 
  TrashIcon
} from './icons/Icons';
import './TraitSelector.css';

// Create ChevronDownIcon if it doesn't exist
const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/**
 * Single Trait Card - displays a trait that has been selected
 */
function SelectedTraitCard({ 
  trait, 
  selectedLevel, 
  detail, 
  onLevelChange, 
  onDetailChange, 
  onRemove,
  readOnly = false 
}) {
  const [expanded, setExpanded] = useState(false);
  const traitData = getTraitById(trait.id);
  
  if (!traitData) return null;

  const currentLevelData = traitData.levels?.find(l => l.level === selectedLevel);

  return (
    <div className={`selected-trait-card ${traitData.type}`}>
      <div className="trait-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="trait-title-section">
          <span className={`trait-type-badge ${traitData.type}`}>
            {traitData.type === 'background' ? 'BG' : traitData.type === 'merit' ? 'M' : 'F'}
          </span>
          <h4 className="trait-name">{traitData.name}</h4>
          {traitData.requiresLevel && (
            <span className="trait-level-badge">●{selectedLevel}</span>
          )}
        </div>
        <div className="trait-card-actions">
          {!readOnly && (
            <button 
              className="btn-remove-trait" 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title="Remove trait"
            >
              <TrashIcon size={14} />
            </button>
          )}
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="trait-card-content">
          <p className="trait-description">{traitData.description}</p>
          
          {/* Level selector */}
          {traitData.requiresLevel && !readOnly && (
            <div className="trait-level-selector">
              <label>Level</label>
              <DotRating
                value={selectedLevel}
                max={traitData.maxLevel}
                min={1}
                onChange={onLevelChange}
                size="md"
              />
            </div>
          )}

          {/* Current level effect */}
          {currentLevelData && (
            <div className="trait-level-info">
              <span className="level-label">{currentLevelData.label}</span>
              <p className="level-description">{currentLevelData.description}</p>
              <p className="level-effect"><strong>Effect:</strong> {currentLevelData.effect}</p>
            </div>
          )}

          {/* Detail input */}
          {traitData.requiresDetail && traitData.detail && (
            <div className="trait-detail-input">
              <label>{traitData.detail.label}</label>
              {traitData.detail.inputType === 'text' && (
                <input
                  type="text"
                  className="input"
                  value={detail || ''}
                  onChange={(e) => onDetailChange(e.target.value)}
                  placeholder={traitData.detail.description}
                  disabled={readOnly}
                />
              )}
              {traitData.detail.inputType === 'select' && (
                <select
                  className="input"
                  value={detail || ''}
                  onChange={(e) => onDetailChange(e.target.value)}
                  disabled={readOnly}
                >
                  <option value="">Select...</option>
                  {traitData.detail.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {traitData.detail.inputType === 'multiSelect' && (
                <div className="multi-select">
                  {traitData.detail.options.map(opt => {
                    const selected = (detail || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`multi-option ${selected ? 'selected' : ''}`}
                        onClick={() => {
                          if (readOnly) return;
                          const current = detail || [];
                          if (selected) {
                            onDetailChange(current.filter(d => d !== opt));
                          } else {
                            onDetailChange([...current, opt]);
                          }
                        }}
                        disabled={readOnly}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {traitData.notes && (
            <p className="trait-notes"><em>Note: {traitData.notes}</em></p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Trait Browser - for browsing and adding new traits
 */
function TraitBrowser({ type, onAdd, excludeIds = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  let traits;
  switch (type) {
    case 'background':
      traits = BACKGROUNDS;
      break;
    case 'merit':
      traits = MERITS;
      break;
    case 'flaw':
      traits = FLAWS;
      break;
    default:
      traits = [];
  }

  // Get unique categories
  const categories = ['all', ...new Set(traits.map(t => t.category))];

  // Filter traits
  const filteredTraits = traits.filter(t => {
    if (excludeIds.includes(t.id)) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="trait-browser">
      <div className="browser-filters">
        <input
          type="text"
          className="input search-input"
          placeholder={`Search ${type}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="input category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="trait-list">
        {filteredTraits.map(trait => (
          <div key={trait.id} className="trait-option">
            <div className="trait-option-info">
              <span className="trait-option-name">{trait.name}</span>
              {trait.maxLevel && (
                <span className="trait-option-levels">●{trait.maxLevel}</span>
              )}
              <span className="trait-option-category">{trait.category}</span>
            </div>
            <p className="trait-option-desc">{trait.description}</p>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => onAdd(trait)}
            >
              <PlusIcon size={14} /> Add
            </button>
          </div>
        ))}
        {filteredTraits.length === 0 && (
          <div className="no-traits">
            No {type}s found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main TraitSelector Component
 */
export function TraitSelector({ 
  selectedTraits = [], 
  onChange,
  readOnly = false 
}) {
  const [activeTab, setActiveTab] = useState('backgrounds');
  const [showBrowser, setShowBrowser] = useState(null); // 'background' | 'merit' | 'flaw' | null

  const backgrounds = selectedTraits.filter(t => getTraitById(t.id)?.type === 'background');
  const merits = selectedTraits.filter(t => getTraitById(t.id)?.type === 'merit');
  const flaws = selectedTraits.filter(t => getTraitById(t.id)?.type === 'flaw');

  const handleAddTrait = (trait) => {
    const newTrait = {
      id: trait.id,
      level: trait.requiresLevel ? 1 : null,
      detail: trait.requiresDetail ? (trait.detail?.inputType === 'multiSelect' ? [] : '') : null
    };
    onChange([...selectedTraits, newTrait]);
    setShowBrowser(null);
  };

  const handleRemoveTrait = (traitId) => {
    onChange(selectedTraits.filter(t => t.id !== traitId));
  };

  const handleUpdateTrait = (traitId, updates) => {
    onChange(selectedTraits.map(t => 
      t.id === traitId ? { ...t, ...updates } : t
    ));
  };

  const renderTraitList = (traits, type) => {
    if (traits.length === 0) {
      return (
        <div className="empty-traits">
          <p>No {type}s selected</p>
          {!readOnly && (
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowBrowser(type)}
            >
              <PlusIcon size={14} /> Add {type}
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        {traits.map(trait => (
          <SelectedTraitCard
            key={trait.id}
            trait={trait}
            selectedLevel={trait.level}
            detail={trait.detail}
            onLevelChange={(level) => handleUpdateTrait(trait.id, { level })}
            onDetailChange={(detail) => handleUpdateTrait(trait.id, { detail })}
            onRemove={() => handleRemoveTrait(trait.id)}
            readOnly={readOnly}
          />
        ))}
        {!readOnly && (
          <button 
            className="btn btn-outline btn-sm add-more-btn"
            onClick={() => setShowBrowser(type)}
          >
            <PlusIcon size={14} /> Add {type}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="trait-selector">
      {/* Tabs */}
      <div className="trait-tabs">
        <button
          className={`trait-tab ${activeTab === 'backgrounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('backgrounds')}
        >
          Backgrounds ({backgrounds.length})
        </button>
        <button
          className={`trait-tab ${activeTab === 'merits' ? 'active' : ''}`}
          onClick={() => setActiveTab('merits')}
        >
          Merits ({merits.length})
        </button>
        <button
          className={`trait-tab ${activeTab === 'flaws' ? 'active' : ''}`}
          onClick={() => setActiveTab('flaws')}
        >
          Flaws ({flaws.length})
        </button>
      </div>

      {/* Content */}
      <div className="trait-content">
        {activeTab === 'backgrounds' && renderTraitList(backgrounds, 'background')}
        {activeTab === 'merits' && renderTraitList(merits, 'merit')}
        {activeTab === 'flaws' && renderTraitList(flaws, 'flaw')}
      </div>

      {/* Browser Modal */}
      {showBrowser && (
        <div className="trait-browser-modal">
          <div className="trait-browser-content">
            <div className="browser-header">
              <h3>Add {showBrowser.charAt(0).toUpperCase() + showBrowser.slice(1)}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowBrowser(null)}
              >
                ✕
              </button>
            </div>
            <TraitBrowser 
              type={showBrowser}
              onAdd={handleAddTrait}
              excludeIds={selectedTraits.map(t => t.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Traits Display - for character sheets
 */
export function TraitsDisplay({ traits = [], compact = false }) {
  if (!traits || traits.length === 0) {
    return (
      <div className="traits-display empty">
        <p>No traits</p>
      </div>
    );
  }

  const backgrounds = traits.filter(t => getTraitById(t.id)?.type === 'background');
  const merits = traits.filter(t => getTraitById(t.id)?.type === 'merit');
  const flaws = traits.filter(t => getTraitById(t.id)?.type === 'flaw');

  const renderCompactTrait = (trait) => {
    const data = getTraitById(trait.id);
    if (!data) return null;

    return (
      <div key={trait.id} className={`compact-trait ${data.type}`}>
        <span className="compact-trait-name">{data.name}</span>
        {trait.level && <span className="compact-trait-dots">●{trait.level}</span>}
        {trait.detail && (
          <span className="compact-trait-detail">
            ({Array.isArray(trait.detail) ? trait.detail.join(', ') : trait.detail})
          </span>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="traits-display compact">
        {traits.map(renderCompactTrait)}
      </div>
    );
  }

  return (
    <div className="traits-display">
      {backgrounds.length > 0 && (
        <div className="trait-group">
          <h4>Backgrounds</h4>
          {backgrounds.map(renderCompactTrait)}
        </div>
      )}
      {merits.length > 0 && (
        <div className="trait-group">
          <h4>Merits</h4>
          {merits.map(renderCompactTrait)}
        </div>
      )}
      {flaws.length > 0 && (
        <div className="trait-group">
          <h4>Flaws</h4>
          {flaws.map(renderCompactTrait)}
        </div>
      )}
    </div>
  );
}

export default TraitSelector;
