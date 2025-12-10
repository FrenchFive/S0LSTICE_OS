import { useState } from 'react';
import { database } from '../utils/database';
import {
  getAllEdges,
  getEdgeById,
  getPerksForEdge,
  EDGE_CATEGORIES,
  formatActivationCost
} from '../data/huntersEdges';
import {
  LightningIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  StarIcon,
  BookIcon,
  EyeIcon,
  TargetIcon,
  ShieldIcon,
  SearchIcon,
  InfoIcon
} from '../components/icons/Icons';
import './EdgesApp.css';

// Activation type icons and colors
const ACTIVATION_INFO = {
  passive: { label: 'Passive', color: 'var(--color-success)', icon: '∞' },
  reflexive: { label: 'Reflexive', color: 'var(--color-info)', icon: '⚡' },
  simple: { label: 'Simple Action', color: 'var(--color-warning)', icon: '→' },
  standard: { label: 'Standard Action', color: 'var(--color-primary)', icon: '●' },
  extended: { label: 'Extended Action', color: 'var(--color-danger)', icon: '◐' }
};

// Edge type colors
const TYPE_COLORS = {
  asset: 'var(--color-success)',
  aptitude: 'var(--color-warning)',
  endowment: 'var(--color-primary)'
};

/**
 * Edge Card Component - Displays a single edge
 */
function EdgeCard({ edge, owned, active, onAdd, onRemove, onActivate, onDeactivate, onViewDetails }) {
  const activationType = edge.activation?.type || 'passive';
  const activationInfo = ACTIVATION_INFO[activationType];
  const perks = getPerksForEdge(edge.id);
  
  return (
    <div className={`edge-card ${owned ? 'owned' : ''} ${active ? 'active' : ''}`}>
      <div className="edge-header">
        <div className="edge-type-badge" style={{ background: TYPE_COLORS[edge.type] }}>
          {edge.type}
        </div>
        <div className="edge-level">
          {Array.from({ length: edge.level }).map((_, i) => (
            <span key={i} className="level-dot filled">●</span>
          ))}
          {Array.from({ length: 5 - edge.level }).map((_, i) => (
            <span key={i} className="level-dot">○</span>
          ))}
        </div>
      </div>
      
      <h3 className="edge-name">{edge.name}</h3>
      
      <p className="edge-description">{edge.description}</p>
      
      <div className="edge-effect">
        <strong>Effect:</strong> {edge.effect}
      </div>
      
      <div className="edge-meta">
        <div 
          className="activation-badge" 
          style={{ borderColor: activationInfo.color, color: activationInfo.color }}
          title={activationInfo.label}
        >
          <span className="activation-icon">{activationInfo.icon}</span>
          <span>{formatActivationCost(edge.activation)}</span>
        </div>
        
        {edge.desperationBonus && (
          <div className="desperation-badge" title="Desperation Bonus">
            <LightningIcon size={12} />
            <span>Desp. Bonus</span>
          </div>
        )}
        
        {perks.length > 0 && (
          <div className="perks-badge" title={`${perks.length} Perk(s) available`}>
            <StarIcon size={12} />
            <span>{perks.length}</span>
          </div>
        )}
      </div>
      
      <div className="edge-tags">
        {edge.tags.map(tag => (
          <span key={tag} className="edge-tag">{tag}</span>
        ))}
      </div>
      
      <div className="edge-actions">
        {owned ? (
          <>
            {activationType !== 'passive' && (
              active ? (
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => onDeactivate(edge.id)}
                >
                  <XIcon size={14} /> Deactivate
                </button>
              ) : (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => onActivate(edge.id)}
                >
                  <LightningIcon size={14} /> Activate
                </button>
              )
            )}
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => onViewDetails(edge)}
            >
              <InfoIcon size={14} /> Details
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => onRemove(edge.id)}
            >
              <TrashIcon size={14} />
            </button>
          </>
        ) : (
          <>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => onViewDetails(edge)}
            >
              <EyeIcon size={14} /> View
            </button>
            <button 
              className="btn btn-sm btn-success"
              onClick={() => onAdd(edge)}
            >
              <PlusIcon size={14} /> Learn
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Edge Details Modal
 */
function EdgeDetailsModal({ edge, owned, onClose, onAdd, onRemove }) {
  const perks = getPerksForEdge(edge.id);
  const activationType = edge.activation?.type || 'passive';
  const activationInfo = ACTIVATION_INFO[activationType];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edge-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="edge-type-badge large" style={{ background: TYPE_COLORS[edge.type] }}>
              {edge.type}
            </div>
            <h2>{edge.name}</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="level-display">
            <span className="label">Level:</span>
            <div className="level-dots">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`level-dot ${i < edge.level ? 'filled' : ''}`}>
                  {i < edge.level ? '●' : '○'}
                </span>
              ))}
            </div>
          </div>
          
          <div className="section description-section">
            <h4>Description</h4>
            <p>{edge.description}</p>
          </div>
          
          <div className="section effect-section">
            <h4>Effect</h4>
            <p>{edge.effect}</p>
          </div>
          
          <div className="section activation-section">
            <h4>Activation</h4>
            <div className="activation-details">
              <div className="activation-type">
                <span 
                  className="activation-badge large" 
                  style={{ borderColor: activationInfo.color, color: activationInfo.color }}
                >
                  <span className="activation-icon">{activationInfo.icon}</span>
                  {activationInfo.label}
                </span>
              </div>
              <div className="activation-cost">
                <strong>Cost:</strong> {formatActivationCost(edge.activation)}
              </div>
              {edge.activation?.duration && (
                <div className="activation-duration">
                  <strong>Duration:</strong> {edge.activation.duration}
                </div>
              )}
              {edge.activation?.trigger && (
                <div className="activation-trigger">
                  <strong>Trigger:</strong> {edge.activation.trigger}
                </div>
              )}
            </div>
          </div>
          
          {edge.desperationBonus && (
            <div className="section desperation-section">
              <h4><LightningIcon size={16} /> Desperation Bonus</h4>
              <p>{edge.desperationBonus}</p>
            </div>
          )}
          
          {edge.prerequisites && edge.prerequisites.length > 0 && (
            <div className="section prereq-section">
              <h4>Prerequisites</h4>
              <ul className="prereq-list">
                {edge.prerequisites.map((prereq, i) => (
                  <li key={i}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
          
          {edge.notes && (
            <div className="section notes-section">
              <h4>Notes</h4>
              <p className="notes-text">{edge.notes}</p>
            </div>
          )}
          
          {perks.length > 0 && (
            <div className="section perks-section">
              <h4><StarIcon size={16} /> Available Perks</h4>
              <div className="perks-list">
                {perks.map(perk => (
                  <div key={perk.id} className="perk-item">
                    <div className="perk-name">{perk.name}</div>
                    <div className="perk-effect">{perk.effect}</div>
                    <div className="perk-description">{perk.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="section tags-section">
            <h4>Tags</h4>
            <div className="edge-tags">
              {edge.tags.map(tag => (
                <span key={tag} className="edge-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          {owned ? (
            <button className="btn btn-danger" onClick={() => { onRemove(edge.id); onClose(); }}>
              <TrashIcon size={16} /> Remove Edge
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => { onAdd(edge); onClose(); }}>
              <PlusIcon size={16} /> Learn Edge
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Active Edge Tracker - Shows currently active edges
 */
function ActiveEdgeTracker({ activeEdges, characterEdges, onDeactivate }) {
  const activeEdgeData = activeEdges.map(id => {
    const edge = getEdgeById(id);
    const charEdge = characterEdges.find(e => e.id === id);
    return { ...edge, activatedAt: charEdge?.activatedAt };
  }).filter(Boolean);
  
  if (activeEdgeData.length === 0) {
    return (
      <div className="active-tracker empty">
        <LightningIcon size={24} />
        <p>No active edges</p>
      </div>
    );
  }
  
  return (
    <div className="active-tracker">
      <h4><LightningIcon size={16} /> Active Edges</h4>
      <div className="active-edges-list">
        {activeEdgeData.map(edge => (
          <div key={edge.id} className="active-edge-item">
            <div className="active-edge-info">
              <span className="active-edge-name">{edge.name}</span>
              <span className="active-edge-duration">
                {edge.activation?.duration || 'Until deactivated'}
              </span>
            </div>
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => onDeactivate(edge.id)}
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Edges App Component
 */
export default function EdgesApp() {
  // Initialize character state lazily
  const [character, setCharacter] = useState(() => {
    const currentCharId = database.getCurrentCharacterId();
    if (currentCharId) {
      const char = database.getCharacter(currentCharId);
      if (char) {
        if (!char.edges) char.edges = [];
        if (!char.perks) char.perks = [];
        return char;
      }
    }
    return null;
  });
  
  const [activeTab, setActiveTab] = useState('owned');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [activeEdges, setActiveEdges] = useState(() => {
    // Load active edges from character
    if (character?.edges) {
      return character.edges.filter(e => e.active).map(e => e.id);
    }
    return [];
  });
  
  const allEdges = getAllEdges();
  const ownedEdgeIds = character?.edges?.map(e => e.id) || [];
  
  // Filter edges based on type and search
  const filteredEdges = allEdges.filter(edge => {
    // Type filter
    if (selectedType !== 'all' && edge.type !== selectedType) {
      return false;
    }
    
    // Tab filter
    if (activeTab === 'owned' && !ownedEdgeIds.includes(edge.id)) {
      return false;
    }
    if (activeTab === 'catalog' && ownedEdgeIds.includes(edge.id)) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        edge.name.toLowerCase().includes(query) ||
        edge.description.toLowerCase().includes(query) ||
        edge.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group edges by type for display
  const groupedEdges = {
    asset: filteredEdges.filter(e => e.type === 'asset'),
    aptitude: filteredEdges.filter(e => e.type === 'aptitude'),
    endowment: filteredEdges.filter(e => e.type === 'endowment')
  };
  
  const saveCharacter = (updated) => {
    database.saveCharacter(updated);
    setCharacter(updated);
  };
  
  const handleAddEdge = (edge) => {
    if (!character) return;
    
    const newEdge = {
      id: edge.id,
      acquiredAt: new Date().toISOString(),
      active: false,
      usesRemaining: null
    };
    
    const updated = {
      ...character,
      edges: [...(character.edges || []), newEdge]
    };
    
    saveCharacter(updated);
  };
  
  const handleRemoveEdge = (edgeId) => {
    if (!character) return;
    
    if (!window.confirm('Remove this edge? This cannot be undone.')) {
      return;
    }
    
    const updated = {
      ...character,
      edges: character.edges.filter(e => e.id !== edgeId)
    };
    
    // Also remove from active edges
    setActiveEdges(prev => prev.filter(id => id !== edgeId));
    
    saveCharacter(updated);
  };
  
  const handleActivateEdge = (edgeId) => {
    const edge = getEdgeById(edgeId);
    if (!edge || !character) return;
    
    // Check activation cost
    const cost = edge.activation?.cost;
    if (cost) {
      let canActivate = true;
      let warnings = [];
      
      if (cost.willpower) {
        const availableWP = character.willpower.max - character.willpower.superficial - character.willpower.aggravated;
        if (availableWP < cost.willpower) {
          warnings.push(`Requires ${cost.willpower} Willpower (you have ${availableWP})`);
          canActivate = false;
        }
      }
      
      if (cost.desperation) {
        if ((character.desperation?.pool || 0) < cost.desperation) {
          warnings.push(`Requires ${cost.desperation} Desperation (you have ${character.desperation?.pool || 0})`);
          canActivate = false;
        }
      }
      
      if (!canActivate) {
        alert(`Cannot activate ${edge.name}:\n${warnings.join('\n')}`);
        return;
      }
      
      // Spend costs
      const updated = { ...character };
      
      if (cost.willpower) {
        updated.willpower = {
          ...updated.willpower,
          superficial: updated.willpower.superficial + cost.willpower
        };
      }
      
      if (cost.desperation) {
        updated.desperation = {
          ...updated.desperation,
          pool: Math.max(0, updated.desperation.pool - cost.desperation)
        };
      }
      
      // Update edge as active
      updated.edges = updated.edges.map(e => 
        e.id === edgeId ? { ...e, active: true, activatedAt: new Date().toISOString() } : e
      );
      
      saveCharacter(updated);
    } else {
      // No cost, just activate
      const updated = {
        ...character,
        edges: character.edges.map(e => 
          e.id === edgeId ? { ...e, active: true, activatedAt: new Date().toISOString() } : e
        )
      };
      
      saveCharacter(updated);
    }
    
    setActiveEdges(prev => [...prev, edgeId]);
  };
  
  const handleDeactivateEdge = (edgeId) => {
    if (!character) return;
    
    const updated = {
      ...character,
      edges: character.edges.map(e => 
        e.id === edgeId ? { ...e, active: false, activatedAt: null } : e
      )
    };
    
    saveCharacter(updated);
    setActiveEdges(prev => prev.filter(id => id !== edgeId));
  };
  
  if (!character) {
    return (
      <div className="edges-app">
        <div className="no-character">
          <ShieldIcon size={48} />
          <h2>No Character Selected</h2>
          <p>Select a character to manage their Edges</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="edges-app">
      <header className="edges-header">
        <h1><ShieldIcon size={24} /> Hunter Edges</h1>
        <div className="edges-summary">
          <span className="edge-count">{ownedEdgeIds.length} Edges</span>
          <span className="active-count">{activeEdges.length} Active</span>
        </div>
      </header>
      
      {/* Active Edge Tracker */}
      <ActiveEdgeTracker 
        activeEdges={activeEdges}
        characterEdges={character.edges || []}
        onDeactivate={handleDeactivateEdge}
      />
      
      {/* Tabs */}
      <div className="edges-tabs">
        <button 
          className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          <BookIcon size={16} /> My Edges ({ownedEdgeIds.length})
        </button>
        <button 
          className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <SearchIcon size={16} /> Catalog ({allEdges.length - ownedEdgeIds.length})
        </button>
      </div>
      
      {/* Filters */}
      <div className="edges-filters">
        <div className="search-box">
          <SearchIcon size={16} />
          <input
            type="text"
            placeholder="Search edges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
        
        <div className="type-filters">
          <button 
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All
          </button>
          {Object.entries(EDGE_CATEGORIES).map(([type, info]) => (
            <button 
              key={type}
              className={`filter-btn ${selectedType === type ? 'active' : ''}`}
              style={selectedType === type ? { background: TYPE_COLORS[type] } : {}}
              onClick={() => setSelectedType(type)}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Edge Grid */}
      <div className="edges-content">
        {filteredEdges.length === 0 ? (
          <div className="no-edges">
            {activeTab === 'owned' ? (
              <>
                <TargetIcon size={48} />
                <h3>No Edges Yet</h3>
                <p>Browse the catalog to learn new edges</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('catalog')}
                >
                  Browse Catalog
                </button>
              </>
            ) : (
              <>
                <SearchIcon size={48} />
                <h3>No Matching Edges</h3>
                <p>Try adjusting your search or filters</p>
              </>
            )}
          </div>
        ) : (
          selectedType === 'all' ? (
            // Show grouped by type
            Object.entries(groupedEdges).map(([type, edges]) => {
              if (edges.length === 0) return null;
              return (
                <div key={type} className="edge-group">
                  <h3 className="group-title" style={{ color: TYPE_COLORS[type] }}>
                    {EDGE_CATEGORIES[type].label} Edges
                    <span className="group-count">({edges.length})</span>
                  </h3>
                  <div className="edges-grid">
                    {edges.map(edge => (
                      <EdgeCard
                        key={edge.id}
                        edge={edge}
                        owned={ownedEdgeIds.includes(edge.id)}
                        active={activeEdges.includes(edge.id)}
                        onAdd={handleAddEdge}
                        onRemove={handleRemoveEdge}
                        onActivate={handleActivateEdge}
                        onDeactivate={handleDeactivateEdge}
                        onViewDetails={setSelectedEdge}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show flat list for single type
            <div className="edges-grid">
              {filteredEdges.map(edge => (
                <EdgeCard
                  key={edge.id}
                  edge={edge}
                  owned={ownedEdgeIds.includes(edge.id)}
                  active={activeEdges.includes(edge.id)}
                  onAdd={handleAddEdge}
                  onRemove={handleRemoveEdge}
                  onActivate={handleActivateEdge}
                  onDeactivate={handleDeactivateEdge}
                  onViewDetails={setSelectedEdge}
                />
              ))}
            </div>
          )
        )}
      </div>
      
      {/* Edge Details Modal */}
      {selectedEdge && (
        <EdgeDetailsModal
          edge={selectedEdge}
          owned={ownedEdgeIds.includes(selectedEdge.id)}
          onClose={() => setSelectedEdge(null)}
          onAdd={handleAddEdge}
          onRemove={handleRemoveEdge}
        />
      )}
    </div>
  );
}
