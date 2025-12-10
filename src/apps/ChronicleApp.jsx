import { useState } from 'react';
import { dmMode } from '../utils/database';
import { ScrollIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, EyeIcon, CrownIcon, FlagIcon, AlertIcon } from '../components/icons/Icons';
import './ChronicleApp.css';

// Chronicle Tenets storage
const TENETS_KEY = 'hunters_chronicle_tenets';

const tenetsDatabase = {
  getTenets() {
    const data = localStorage.getItem(TENETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveTenets(tenets) {
    localStorage.setItem(TENETS_KEY, JSON.stringify(tenets));
  },
  
  addTenet(tenet) {
    const tenets = this.getTenets();
    const newTenet = {
      ...tenet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      violations: []
    };
    tenets.push(newTenet);
    this.saveTenets(tenets);
    return newTenet;
  },
  
  updateTenet(id, updates) {
    const tenets = this.getTenets();
    const index = tenets.findIndex(t => t.id === id);
    if (index >= 0) {
      tenets[index] = { ...tenets[index], ...updates };
      this.saveTenets(tenets);
      return tenets[index];
    }
    return null;
  },
  
  deleteTenet(id) {
    const tenets = this.getTenets();
    const filtered = tenets.filter(t => t.id !== id);
    this.saveTenets(filtered);
  },
  
  addViolation(tenetId, violation) {
    const tenets = this.getTenets();
    const tenet = tenets.find(t => t.id === tenetId);
    if (tenet) {
      tenet.violations = tenet.violations || [];
      tenet.violations.push({
        ...violation,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      this.saveTenets(tenets);
      return tenet;
    }
    return null;
  }
};

// Tenet severity levels
const TENET_SEVERITIES = [
  { id: 'guideline', label: 'Guideline', description: 'Soft rules, violations may have minor consequences', color: 'var(--color-success)' },
  { id: 'standard', label: 'Standard', description: 'Core chronicle rules, violations have normal consequences', color: 'var(--color-warning)' },
  { id: 'absolute', label: 'Absolute', description: 'Inviolable rules, violations have severe consequences', color: 'var(--color-danger)' },
];

function TenetEditor({ tenet, onSave, onCancel }) {
  const [form, setForm] = useState(tenet || {
    id: null,
    title: '',
    description: '',
    severity: 'standard',
    humanityCost: 1,
    examples: '',
    exceptions: '',
    notes: '',
    active: true
  });

  return (
    <div className="modal-overlay">
      <div className="tenet-editor-modal">
        <div className="modal-header">
          <h3>{tenet ? 'Edit Tenet' : 'Create Tenet'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Tenet Title</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="e.g., Protect the Innocent"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Describe what this tenet requires..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Severity</label>
              <select
                className="input"
                value={form.severity}
                onChange={(e) => setForm({...form, severity: e.target.value})}
              >
                {TENET_SEVERITIES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Humanity Cost</label>
              <select
                className="input"
                value={form.humanityCost}
                onChange={(e) => setForm({...form, humanityCost: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} point{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Examples of Violations</label>
            <textarea
              className="input textarea"
              value={form.examples}
              onChange={(e) => setForm({...form, examples: e.target.value})}
              placeholder="List example situations that would violate this tenet..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Exceptions</label>
            <textarea
              className="input textarea"
              value={form.exceptions}
              onChange={(e) => setForm({...form, exceptions: e.target.value})}
              placeholder="Any circumstances where this tenet may not apply..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({...form, active: e.target.checked})}
              />
              Tenet is Active
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => onSave(form)}
            disabled={!form.title.trim()}
          >
            <CheckIcon size={16} /> Save Tenet
          </button>
        </div>
      </div>
    </div>
  );
}

function ViolationModal({ tenet, onSave, onCancel }) {
  const [form, setForm] = useState({
    characterName: '',
    description: '',
    mitigating: '',
    resolved: false,
    consequence: ''
  });

  return (
    <div className="modal-overlay">
      <div className="violation-modal">
        <div className="modal-header">
          <h3>Record Violation</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="violation-tenet-info">
            <AlertIcon size={20} />
            <span>Violation of: <strong>{tenet.title}</strong></span>
          </div>

          <div className="form-group">
            <label>Character Name</label>
            <input
              type="text"
              className="input"
              value={form.characterName}
              onChange={(e) => setForm({...form, characterName: e.target.value})}
              placeholder="Who violated the tenet?"
            />
          </div>

          <div className="form-group">
            <label>What Happened?</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Describe the violation..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Mitigating Circumstances</label>
            <textarea
              className="input textarea"
              value={form.mitigating}
              onChange={(e) => setForm({...form, mitigating: e.target.value})}
              placeholder="Were there any mitigating factors?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Consequence Applied</label>
            <input
              type="text"
              className="input"
              value={form.consequence}
              onChange={(e) => setForm({...form, consequence: e.target.value})}
              placeholder="What was the consequence?"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.resolved}
                onChange={(e) => setForm({...form, resolved: e.target.checked})}
              />
              Violation Resolved
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-danger" 
            onClick={() => onSave(form)}
            disabled={!form.description.trim()}
          >
            <CheckIcon size={16} /> Record Violation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChronicleApp() {
  const [isDM] = useState(() => dmMode.isDM());
  const [tenets, setTenets] = useState(() => tenetsDatabase.getTenets());
  const [showTenetEditor, setShowTenetEditor] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [editingTenet, setEditingTenet] = useState(null);
  const [selectedTenet, setSelectedTenet] = useState(null);
  const [expandedTenet, setExpandedTenet] = useState(null);

  const reloadTenets = () => {
    setTenets(tenetsDatabase.getTenets());
  };

  const handleSaveTenet = (tenetData) => {
    if (editingTenet) {
      tenetsDatabase.updateTenet(tenetData.id, tenetData);
    } else {
      tenetsDatabase.addTenet(tenetData);
    }
    reloadTenets();
    setShowTenetEditor(false);
    setEditingTenet(null);
  };

  const handleEditTenet = (tenet) => {
    setEditingTenet(tenet);
    setShowTenetEditor(true);
  };

  const handleDeleteTenet = (tenetId) => {
    if (window.confirm('Delete this tenet? This cannot be undone.')) {
      tenetsDatabase.deleteTenet(tenetId);
      reloadTenets();
    }
  };

  const handleToggleTenet = (tenetId) => {
    const tenet = tenets.find(t => t.id === tenetId);
    if (tenet) {
      tenetsDatabase.updateTenet(tenetId, { active: !tenet.active });
      reloadTenets();
    }
  };

  const handleRecordViolation = (tenet) => {
    setSelectedTenet(tenet);
    setShowViolationModal(true);
  };

  const handleSaveViolation = (violationData) => {
    tenetsDatabase.addViolation(selectedTenet.id, violationData);
    reloadTenets();
    setShowViolationModal(false);
    setSelectedTenet(null);
  };

  const getSeverityInfo = (severity) => {
    return TENET_SEVERITIES.find(s => s.id === severity) || TENET_SEVERITIES[1];
  };

  const activeTenets = tenets.filter(t => t.active);
  const inactiveTenets = tenets.filter(t => !t.active);
  const totalViolations = tenets.reduce((sum, t) => sum + (t.violations?.length || 0), 0);

  return (
    <div className="chronicle-app">
      <div className="chronicle-header">
        <h1>
          <ScrollIcon size={28} /> 
          Chronicle Tenets
        </h1>
        {isDM && (
          <button 
            className="btn btn-success btn-sm"
            onClick={() => {
              setEditingTenet(null);
              setShowTenetEditor(true);
            }}
          >
            <PlusIcon size={14} /> Add Tenet
          </button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="tenets-overview">
        <div className="tenet-stat">
          <ScrollIcon size={20} />
          <span className="stat-count">{activeTenets.length}</span>
          <span className="stat-label">Active Tenets</span>
        </div>
        <div className="tenet-stat violations">
          <AlertIcon size={20} />
          <span className="stat-count">{totalViolations}</span>
          <span className="stat-label">Violations</span>
        </div>
      </div>

      {/* Description */}
      <div className="tenets-description">
        <FlagIcon size={16} />
        <p>
          Chronicle Tenets are the moral rules that govern your hunting cell. 
          Violating these tenets may have consequences for your humanity.
        </p>
      </div>

      {/* Active Tenets */}
      <div className="tenets-section">
        <h2>Active Tenets</h2>
        
        {activeTenets.length === 0 ? (
          <div className="empty-state">
            <ScrollIcon size={48} />
            <h3>No Active Tenets</h3>
            <p>{isDM ? 'Create tenets to guide your hunters.' : 'The DM has not set any tenets yet.'}</p>
          </div>
        ) : (
          <div className="tenets-list">
            {activeTenets.map(tenet => {
              const severity = getSeverityInfo(tenet.severity);
              const isExpanded = expandedTenet === tenet.id;
              const violationCount = tenet.violations?.length || 0;
              
              return (
                <div 
                  key={tenet.id} 
                  className={`tenet-card severity-${tenet.severity}`}
                >
                  <div 
                    className="tenet-main"
                    onClick={() => setExpandedTenet(isExpanded ? null : tenet.id)}
                  >
                    <div className="tenet-header">
                      <div className="tenet-title-row">
                        <span 
                          className="severity-dot"
                          style={{ backgroundColor: severity.color }}
                        />
                        <h3>{tenet.title}</h3>
                      </div>
                      <div className="tenet-badges">
                        <span 
                          className="severity-badge"
                          style={{ backgroundColor: severity.color }}
                        >
                          {severity.label}
                        </span>
                        <span className="cost-badge">
                          −{tenet.humanityCost} Humanity
                        </span>
                        {violationCount > 0 && (
                          <span className="violations-badge">
                            {violationCount} violation{violationCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="tenet-description">{tenet.description}</p>
                    
                    <div className="expand-indicator">
                      {isExpanded ? '▲ Less' : '▼ More'}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="tenet-details">
                      {tenet.examples && (
                        <div className="detail-section">
                          <h4>Example Violations</h4>
                          <p>{tenet.examples}</p>
                        </div>
                      )}
                      
                      {tenet.exceptions && (
                        <div className="detail-section">
                          <h4>Exceptions</h4>
                          <p>{tenet.exceptions}</p>
                        </div>
                      )}

                      {violationCount > 0 && (
                        <div className="detail-section violations-list">
                          <h4>Violation History</h4>
                          {tenet.violations.map(v => (
                            <div key={v.id} className={`violation-item ${v.resolved ? 'resolved' : ''}`}>
                              <div className="violation-header">
                                <span className="violation-character">{v.characterName || 'Unknown'}</span>
                                <span className="violation-date">
                                  {new Date(v.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="violation-desc">{v.description}</p>
                              {v.consequence && (
                                <p className="violation-consequence">
                                  <strong>Consequence:</strong> {v.consequence}
                                </p>
                              )}
                              {v.resolved && <span className="resolved-badge">Resolved</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="tenet-actions">
                        {isDM && (
                          <>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecordViolation(tenet);
                              }}
                            >
                              <AlertIcon size={14} /> Record Violation
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTenet(tenet);
                              }}
                            >
                              <EditIcon size={14} /> Edit
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTenet(tenet.id);
                              }}
                            >
                              <EyeIcon size={14} /> Disable
                            </button>
                            <button 
                              className="btn btn-outline btn-sm danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTenet(tenet.id);
                              }}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inactive Tenets (DM Only) */}
      {isDM && inactiveTenets.length > 0 && (
        <div className="tenets-section inactive">
          <h2>Inactive Tenets</h2>
          <div className="tenets-list">
            {inactiveTenets.map(tenet => (
              <div key={tenet.id} className="tenet-card inactive">
                <div className="tenet-header">
                  <h3>{tenet.title}</h3>
                  <div className="tenet-actions-inline">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggleTenet(tenet.id)}
                    >
                      Enable
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDeleteTenet(tenet.id)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DM Badge */}
      {isDM && (
        <div className="dm-indicator">
          <CrownIcon size={14} />
          <span>DM Mode - You can edit tenets</span>
        </div>
      )}

      {/* Modals */}
      {showTenetEditor && (
        <TenetEditor
          tenet={editingTenet}
          onSave={handleSaveTenet}
          onCancel={() => {
            setShowTenetEditor(false);
            setEditingTenet(null);
          }}
        />
      )}

      {showViolationModal && selectedTenet && (
        <ViolationModal
          tenet={selectedTenet}
          onSave={handleSaveViolation}
          onCancel={() => {
            setShowViolationModal(false);
            setSelectedTenet(null);
          }}
        />
      )}
    </div>
  );
}
