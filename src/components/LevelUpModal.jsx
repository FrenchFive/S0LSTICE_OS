/**
 * LevelUpModal Component
 * A beautiful, visual experience for leveling up characters
 * Note: XP Awards are now DM-only via the DMRewardsApp
 */
import { useState, useEffect } from 'react';
import {
  calculateLevel,
  getXPToNextLevel,
  getAvailableXP,
  getAvailableUpgrades,
  applyUpgrade,
  formatXPCost,
  getTraitCost
} from '../utils/levelUp';
import {
  calculateHealth,
  calculateWillpower
} from '../utils/huntersData';
import { 
  BACKGROUNDS, 
  MERITS
} from '../data/huntersTraits';
import { DotRating } from './DotRating';
import {
  PlusIcon,
  CheckIcon,
  StarIcon
} from './icons/Icons';
import './LevelUpModal.css';

// Sparkle icon for celebrations
const SparkleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
  </svg>
);

// Arrow up icon
const ArrowUpIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

/**
 * XP Progress Bar Component
 */
function XPProgressBar({ character }) {
  const level = calculateLevel(character.experience?.total || 0);
  const { needed, nextLevel, progress } = getXPToNextLevel(character.experience?.total || 0);
  const availableXP = getAvailableXP(character);
  
  return (
    <div className="xp-progress-container">
      <div className="xp-level-display">
        <div className="current-level">
          <span className="level-number">{level.level}</span>
          <span className="level-title">{level.title}</span>
        </div>
        <div className="xp-stats">
          <div className="xp-stat">
            <span className="xp-label">Available XP</span>
            <span className="xp-value available">{availableXP}</span>
          </div>
          <div className="xp-stat">
            <span className="xp-label">Total XP</span>
            <span className="xp-value">{character.experience?.total || 0}</span>
          </div>
        </div>
      </div>
      
      {nextLevel && (
        <div className="xp-bar-wrapper">
          <div className="xp-bar">
            <div 
              className="xp-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="xp-bar-labels">
            <span>Level {level.level}</span>
            <span>{needed} XP to Level {nextLevel.level}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Level Up Celebration Overlay
 */
// Pre-defined sparkle sizes to avoid Math.random during render
const SPARKLE_SIZES = [24, 32, 28, 36, 26, 30, 34, 24];

function LevelUpCelebration({ fromLevel, toLevel, onClose }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);
  
  return (
    <div className={`level-up-celebration ${show ? 'show' : ''}`}>
      <div className="celebration-content">
        <div className="celebration-sparkles">
          {SPARKLE_SIZES.map((size, i) => (
            <SparkleIcon key={i} size={size} />
          ))}
        </div>
        <div className="celebration-badge">
          <span className="level-up-text">LEVEL UP!</span>
          <div className="level-transition">
            <span className="old-level">{fromLevel.level}</span>
            <ArrowUpIcon size={32} />
            <span className="new-level">{toLevel.level}</span>
          </div>
          <span className="new-title">{toLevel.title}</span>
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          <SparkleIcon size={16} /> Awesome!
        </button>
      </div>
    </div>
  );
}

/**
 * Upgrade Card Component
 */
function UpgradeCard({ upgrade, type, onPurchase, disabled }) {
  const [purchasing, setPurchasing] = useState(false);
  
  const handlePurchase = async () => {
    setPurchasing(true);
    await onPurchase(type, upgrade);
    setPurchasing(false);
  };
  
  const getTypeColor = () => {
    switch (type) {
      case 'attribute': return 'primary';
      case 'skill': return 'secondary';
      case 'trait': return upgrade.type === 'merit' ? 'success' : 'info';
      default: return 'primary';
    }
  };
  
  return (
    <div className={`upgrade-card ${getTypeColor()}`}>
      <div className="upgrade-info">
        <span className="upgrade-name">{upgrade.label}</span>
        <div className="upgrade-dots">
          <DotRating 
            value={upgrade.currentValue} 
            max={5} 
            size="sm" 
          />
          <span className="upgrade-arrow">→</span>
          <DotRating 
            value={upgrade.newValue} 
            max={5} 
            size="sm" 
          />
        </div>
      </div>
      <button 
        className={`btn btn-sm btn-${getTypeColor()}`}
        onClick={handlePurchase}
        disabled={disabled || purchasing}
      >
        {purchasing ? '...' : formatXPCost(upgrade.cost)}
      </button>
    </div>
  );
}

/**
 * New Trait Selector
 */
function NewTraitSelector({ onAdd, availableXP, existingTraitIds }) {
  const [selectedType, setSelectedType] = useState('background');
  const [selectedTrait, setSelectedTrait] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [detail, setDetail] = useState('');
  
  const traits = selectedType === 'background' ? BACKGROUNDS : MERITS;
  const availableTraits = traits.filter(t => !existingTraitIds.includes(t.id));
  
  const cost = selectedTrait ? getTraitCost(selectedTrait.id, 0) * selectedLevel : 0;
  const canAfford = cost <= availableXP;
  
  const handleAdd = () => {
    if (selectedTrait && canAfford) {
      onAdd({
        traitId: selectedTrait.id,
        level: selectedLevel,
        detail: selectedTrait.requiresDetail ? detail : null,
        cost
      });
      setSelectedTrait(null);
      setSelectedLevel(1);
      setDetail('');
    }
  };
  
  return (
    <div className="new-trait-selector">
      <h4>Add New Trait</h4>
      
      <div className="trait-type-tabs">
        <button 
          className={`trait-type-tab ${selectedType === 'background' ? 'active' : ''}`}
          onClick={() => { setSelectedType('background'); setSelectedTrait(null); }}
        >
          Backgrounds
        </button>
        <button 
          className={`trait-type-tab ${selectedType === 'merit' ? 'active' : ''}`}
          onClick={() => { setSelectedType('merit'); setSelectedTrait(null); }}
        >
          Merits
        </button>
      </div>
      
      <div className="trait-select-grid">
        {availableTraits.slice(0, 12).map(trait => (
          <button
            key={trait.id}
            className={`trait-select-btn ${selectedTrait?.id === trait.id ? 'selected' : ''}`}
            onClick={() => setSelectedTrait(trait)}
          >
            <span className="trait-select-name">{trait.name}</span>
            <span className="trait-select-category">{trait.category}</span>
          </button>
        ))}
      </div>
      
      {selectedTrait && (
        <div className="trait-config">
          <p className="trait-description">{selectedTrait.description}</p>
          
          {selectedTrait.requiresLevel && (
            <div className="trait-level-select">
              <label>Level</label>
              <DotRating
                value={selectedLevel}
                max={selectedTrait.maxLevel}
                min={1}
                onChange={setSelectedLevel}
                size="md"
              />
            </div>
          )}
          
          {selectedTrait.requiresDetail && selectedTrait.detail && (
            <div className="trait-detail-input">
              <label>{selectedTrait.detail.label}</label>
              {selectedTrait.detail.inputType === 'text' && (
                <input
                  type="text"
                  className="input"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder={selectedTrait.detail.description}
                />
              )}
              {selectedTrait.detail.inputType === 'select' && (
                <select
                  className="input"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                >
                  <option value="">Select...</option>
                  {selectedTrait.detail.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          
          <div className="trait-add-action">
            <span className={`trait-cost ${!canAfford ? 'too-expensive' : ''}`}>
              Cost: {formatXPCost(cost)}
            </span>
            <button 
              className="btn btn-success"
              onClick={handleAdd}
              disabled={!canAfford || (selectedTrait.requiresDetail && !detail)}
            >
              <PlusIcon size={16} /> Add Trait
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// XP Award Section removed - now handled by DM-only DMRewardsApp

/**
 * Main Level Up Modal Component
 */
export default function LevelUpModal({ character, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('upgrades');
  const [celebration, setCelebration] = useState(null);
  const [recentUpgrades, setRecentUpgrades] = useState([]);
  
  const availableXP = getAvailableXP(character);
  const upgrades = getAvailableUpgrades(character, availableXP);
  
  const handlePurchaseUpgrade = (type, upgrade) => {
    const { character: updated, changeLog } = applyUpgrade(character, type, upgrade);
    
    // Update derived stats
    updated.health = { ...updated.health, max: calculateHealth(updated) };
    updated.willpower = { ...updated.willpower, max: calculateWillpower(updated) };
    
    // Track recent upgrade for highlighting
    setRecentUpgrades(prev => [...prev, changeLog]);
    
    // Check for level up
    if (changeLog.levelUp) {
      setCelebration(changeLog.levelUp);
    }
    
    onUpdate(updated);
  };
  
  const handleAddNewTrait = (traitData) => {
    const { character: updated, changeLog } = applyUpgrade(character, 'newTrait', traitData);
    setRecentUpgrades(prev => [...prev, changeLog]);
    onUpdate(updated);
  };
  
  const existingTraitIds = (character.traits || []).map(t => t.id);
  
  return (
    <div className="level-up-modal-overlay">
      <div className="level-up-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <StarIcon size={24} />
            <h2>Character Advancement</h2>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        {/* XP Progress */}
        <XPProgressBar character={character} />
        
        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'upgrades' ? 'active' : ''}`}
            onClick={() => setActiveTab('upgrades')}
          >
            <ArrowUpIcon size={16} /> Upgrades
            {upgrades.attributes.length + upgrades.skills.length + upgrades.traits.length > 0 && (
              <span className="tab-badge">
                {upgrades.attributes.length + upgrades.skills.length + upgrades.traits.length}
              </span>
            )}
          </button>
          <button 
            className={`modal-tab ${activeTab === 'traits' ? 'active' : ''}`}
            onClick={() => setActiveTab('traits')}
          >
            <PlusIcon size={16} /> New Traits
          </button>
        </div>
        
        {/* Content */}
        <div className="modal-content">
          {/* Upgrades Tab */}
          {activeTab === 'upgrades' && (
            <div className="upgrades-tab">
              {availableXP === 0 ? (
                <div className="no-xp-message">
                  <SparkleIcon size={48} />
                  <h3>No XP Available</h3>
                  <p>Play more sessions to earn experience points!</p>
                </div>
              ) : (
                <>
                  {/* Attributes */}
                  {upgrades.attributes.length > 0 && (
                    <div className="upgrade-section">
                      <h4 className="upgrade-section-title">Attributes</h4>
                      <div className="upgrade-grid">
                        {upgrades.attributes.map(upgrade => (
                          <UpgradeCard
                            key={`${upgrade.category}-${upgrade.attr}`}
                            upgrade={upgrade}
                            type="attribute"
                            onPurchase={handlePurchaseUpgrade}
                            disabled={upgrade.cost > availableXP}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills */}
                  {upgrades.skills.length > 0 && (
                    <div className="upgrade-section">
                      <h4 className="upgrade-section-title">Skills</h4>
                      <div className="upgrade-grid">
                        {upgrades.skills.map(upgrade => (
                          <UpgradeCard
                            key={`${upgrade.category}-${upgrade.skill}`}
                            upgrade={upgrade}
                            type="skill"
                            onPurchase={handlePurchaseUpgrade}
                            disabled={upgrade.cost > availableXP}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Traits */}
                  {upgrades.traits.length > 0 && (
                    <div className="upgrade-section">
                      <h4 className="upgrade-section-title">Traits</h4>
                      <div className="upgrade-grid">
                        {upgrades.traits.map(upgrade => (
                          <UpgradeCard
                            key={upgrade.traitId}
                            upgrade={upgrade}
                            type="trait"
                            onPurchase={handlePurchaseUpgrade}
                            disabled={upgrade.cost > availableXP}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {upgrades.attributes.length === 0 && 
                   upgrades.skills.length === 0 && 
                   upgrades.traits.length === 0 && (
                    <div className="no-upgrades-message">
                      <CheckIcon size={48} />
                      <h3>All Maxed Out!</h3>
                      <p>Your character is at maximum potential in all areas you can afford.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* New Traits Tab */}
          {activeTab === 'traits' && (
            <NewTraitSelector
              onAdd={handleAddNewTrait}
              availableXP={availableXP}
              existingTraitIds={existingTraitIds}
            />
          )}
        </div>
        
        {/* DM Rewards Note */}
        <div className="dm-rewards-note">
          <SparkleIcon size={14} />
          <span>XP is awarded by the DM via the Rewards panel</span>
        </div>
        
        {/* Recent Upgrades */}
        {recentUpgrades.length > 0 && (
          <div className="recent-upgrades">
            <h4>Recent Changes</h4>
            <div className="recent-list">
              {recentUpgrades.slice(-5).reverse().map((upgrade, i) => (
                <div key={i} className="recent-item">
                  <CheckIcon size={14} />
                  <span>{upgrade.description}</span>
                  <span className="recent-cost">-{upgrade.cost} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Level Up Celebration */}
      {celebration && (
        <LevelUpCelebration
          fromLevel={celebration.from}
          toLevel={celebration.to}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

export { XPProgressBar, LevelUpCelebration };
