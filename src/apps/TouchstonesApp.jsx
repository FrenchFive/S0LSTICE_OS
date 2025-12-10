import { useState } from 'react';
import { database } from '../utils/database';
import { AnchorIcon, SunriseIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, HeartIcon, StarIcon } from '../components/icons/Icons';
import './TouchstonesApp.css';

// Touchstone relationship types
const RELATIONSHIP_TYPES = [
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { id: 'friend', label: 'Friend', icon: '🤝' },
  { id: 'mentor', label: 'Mentor', icon: '📚' },
  { id: 'lover', label: 'Lover', icon: '❤️' },
  { id: 'rival', label: 'Rival', icon: '⚔️' },
  { id: 'colleague', label: 'Colleague', icon: '💼' },
  { id: 'community', label: 'Community', icon: '🏘️' },
  { id: 'cause', label: 'Cause', icon: '🎯' },
];

// Redemption step status
const STEP_STATUS = {
  incomplete: { label: 'Incomplete', color: 'var(--color-text-muted)' },
  in_progress: { label: 'In Progress', color: 'var(--color-warning)' },
  completed: { label: 'Completed', color: 'var(--color-success)' },
  failed: { label: 'Failed', color: 'var(--color-danger)' },
};

function TouchstoneEditor({ touchstone, onSave, onCancel }) {
  const [form, setForm] = useState(touchstone || {
    id: null,
    name: '',
    relationship: 'friend',
    description: '',
    conviction: '',
    humanity: 1,
    status: 'active',
    notes: ''
  });

  return (
    <div className="modal-overlay">
      <div className="touchstone-editor-modal">
        <div className="modal-header">
          <h3>{touchstone ? 'Edit Touchstone' : 'Add Touchstone'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Who is your touchstone?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Relationship Type</label>
              <select
                className="input"
                value={form.relationship}
                onChange={(e) => setForm({...form, relationship: e.target.value})}
              >
                {RELATIONSHIP_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Humanity Connection</label>
              <select
                className="input"
                value={form.humanity}
                onChange={(e) => setForm({...form, humanity: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>Level {n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Conviction</label>
            <input
              type="text"
              className="input"
              value={form.conviction}
              onChange={(e) => setForm({...form, conviction: e.target.value})}
              placeholder="What belief does this touchstone represent?"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Describe your relationship with this touchstone..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="strained">Strained</option>
                <option value="endangered">Endangered</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              placeholder="Additional notes about this touchstone..."
              rows={2}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
          >
            <CheckIcon size={16} /> Save Touchstone
          </button>
        </div>
      </div>
    </div>
  );
}

function RedemptionEditor({ redemption, onSave, onCancel }) {
  const [form, setForm] = useState(redemption || {
    id: null,
    title: '',
    description: '',
    motivation: '',
    steps: [],
    progress: 0,
    status: 'active',
    notes: ''
  });
  const [newStep, setNewStep] = useState('');

  const handleAddStep = () => {
    if (newStep.trim()) {
      setForm({
        ...form,
        steps: [...form.steps, { id: Date.now().toString(), text: newStep.trim(), status: 'incomplete' }]
      });
      setNewStep('');
    }
  };

  const handleRemoveStep = (stepId) => {
    setForm({
      ...form,
      steps: form.steps.filter(s => s.id !== stepId)
    });
  };

  const handleStepStatusChange = (stepId, status) => {
    setForm({
      ...form,
      steps: form.steps.map(s => s.id === stepId ? {...s, status} : s)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="redemption-editor-modal">
        <div className="modal-header">
          <h3>{redemption ? 'Edit Redemption Path' : 'Create Redemption Path'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="What are you seeking redemption for?"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Describe what you did and why you seek redemption..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Motivation</label>
            <input
              type="text"
              className="input"
              value={form.motivation}
              onChange={(e) => setForm({...form, motivation: e.target.value})}
              placeholder="Why is this redemption important to you?"
            />
          </div>

          <div className="form-group">
            <label>Redemption Steps</label>
            <div className="steps-list">
              {form.steps.map((step, idx) => (
                <div key={step.id} className="step-item">
                  <span className="step-number">{idx + 1}</span>
                  <span className="step-text">{step.text}</span>
                  <select
                    className="step-status-select"
                    value={step.status}
                    onChange={(e) => handleStepStatusChange(step.id, e.target.value)}
                  >
                    <option value="incomplete">Incomplete</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button 
                    className="btn-icon-sm danger"
                    onClick={() => handleRemoveStep(step.id)}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-step-row">
              <input
                type="text"
                className="input"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="Add a redemption step..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
              />
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleAddStep}
                disabled={!newStep.trim()}
              >
                <PlusIcon size={14} /> Add
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => onSave(form)}
            disabled={!form.title.trim()}
          >
            <CheckIcon size={16} /> Save Path
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TouchstonesApp() {
  // Initialize character state lazily
  const [character, setCharacter] = useState(() => {
    const currentCharId = database.getCurrentCharacterId();
    if (currentCharId) {
      const char = database.getCharacter(currentCharId);
      if (char) {
        if (!char.touchstones) char.touchstones = [];
        if (!char.redemption) char.redemption = [];
        return char;
      }
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState('touchstones');
  const [showTouchstoneEditor, setShowTouchstoneEditor] = useState(false);
  const [showRedemptionEditor, setShowRedemptionEditor] = useState(false);
  const [editingTouchstone, setEditingTouchstone] = useState(null);
  const [editingRedemption, setEditingRedemption] = useState(null);

  const saveCharacter = (updated) => {
    database.saveCharacter(updated);
    setCharacter(updated);
  };

  // Touchstone handlers
  const handleSaveTouchstone = (touchstoneData) => {
    let updated;
    
    if (editingTouchstone) {
      updated = {
        ...character,
        touchstones: character.touchstones.map(t => 
          t.id === touchstoneData.id ? touchstoneData : t
        )
      };
    } else {
      const newTouchstone = {
        ...touchstoneData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      updated = {
        ...character,
        touchstones: [...(character.touchstones || []), newTouchstone]
      };
    }
    
    saveCharacter(updated);
    setShowTouchstoneEditor(false);
    setEditingTouchstone(null);
  };

  const handleEditTouchstone = (touchstone) => {
    setEditingTouchstone(touchstone);
    setShowTouchstoneEditor(true);
  };

  const handleRemoveTouchstone = (touchstoneId) => {
    if (window.confirm('Remove this touchstone? This may have consequences for your humanity.')) {
      const updated = {
        ...character,
        touchstones: character.touchstones.filter(t => t.id !== touchstoneId)
      };
      saveCharacter(updated);
    }
  };

  // Redemption handlers
  const handleSaveRedemption = (redemptionData) => {
    // Calculate progress based on completed steps
    const completedSteps = redemptionData.steps.filter(s => s.status === 'completed').length;
    const totalSteps = redemptionData.steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    const updatedRedemption = { ...redemptionData, progress };
    let updated;
    
    if (editingRedemption) {
      updated = {
        ...character,
        redemption: character.redemption.map(r => 
          r.id === updatedRedemption.id ? updatedRedemption : r
        )
      };
    } else {
      const newRedemption = {
        ...updatedRedemption,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      updated = {
        ...character,
        redemption: [...(character.redemption || []), newRedemption]
      };
    }
    
    saveCharacter(updated);
    setShowRedemptionEditor(false);
    setEditingRedemption(null);
  };

  const handleEditRedemption = (redemption) => {
    setEditingRedemption(redemption);
    setShowRedemptionEditor(true);
  };

  const handleRemoveRedemption = (redemptionId) => {
    if (window.confirm('Abandon this redemption path?')) {
      const updated = {
        ...character,
        redemption: character.redemption.filter(r => r.id !== redemptionId)
      };
      saveCharacter(updated);
    }
  };

  const handleStepToggle = (redemptionId, stepId) => {
    const updated = {
      ...character,
      redemption: character.redemption.map(r => {
        if (r.id === redemptionId) {
          const updatedSteps = r.steps.map(s => {
            if (s.id === stepId) {
              const newStatus = s.status === 'completed' ? 'incomplete' : 'completed';
              return { ...s, status: newStatus };
            }
            return s;
          });
          const completedSteps = updatedSteps.filter(s => s.status === 'completed').length;
          const progress = Math.round((completedSteps / updatedSteps.length) * 100);
          return { ...r, steps: updatedSteps, progress };
        }
        return r;
      })
    };
    saveCharacter(updated);
  };

  if (!character) {
    return (
      <div className="touchstones-app">
        <div className="no-character">
          <AnchorIcon size={48} />
          <p>No Hunter selected</p>
          <p>Go to Character app to select or create one</p>
        </div>
      </div>
    );
  }

  const touchstones = character.touchstones || [];
  const redemptions = character.redemption || [];
  
  const getRelationshipIcon = (relationship) => {
    const type = RELATIONSHIP_TYPES.find(t => t.id === relationship);
    return type ? type.icon : '👤';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'strained': return 'status-strained';
      case 'endangered': return 'status-endangered';
      case 'lost': return 'status-lost';
      default: return '';
    }
  };

  return (
    <div className="touchstones-app">
      <div className="touchstones-header">
        <h1>
          <AnchorIcon size={28} /> 
          Humanity
        </h1>
      </div>

      {/* Summary Stats */}
      <div className="humanity-overview">
        <div className="humanity-stat">
          <HeartIcon size={20} />
          <span className="stat-count">{touchstones.filter(t => t.status === 'active').length}</span>
          <span className="stat-label">Active Touchstones</span>
        </div>
        <div className="humanity-stat">
          <SunriseIcon size={20} />
          <span className="stat-count">{redemptions.filter(r => r.status === 'active').length}</span>
          <span className="stat-label">Redemption Paths</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button 
          className={`tab ${activeTab === 'touchstones' ? 'active' : ''}`}
          onClick={() => setActiveTab('touchstones')}
        >
          <AnchorIcon size={16} /> Touchstones
        </button>
        <button 
          className={`tab ${activeTab === 'redemption' ? 'active' : ''}`}
          onClick={() => setActiveTab('redemption')}
        >
          <SunriseIcon size={16} /> Redemption
        </button>
      </div>

      {/* Touchstones Tab */}
      {activeTab === 'touchstones' && (
        <div className="touchstones-content">
          <div className="content-header">
            <p className="content-description">
              Touchstones are people, places, or ideals that anchor your humanity and remind you of who you were.
            </p>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingTouchstone(null);
                setShowTouchstoneEditor(true);
              }}
            >
              <PlusIcon size={14} /> Add Touchstone
            </button>
          </div>

          {touchstones.length === 0 ? (
            <div className="empty-state">
              <AnchorIcon size={48} />
              <h3>No Touchstones</h3>
              <p>Add people or ideals that keep you grounded.</p>
            </div>
          ) : (
            <div className="touchstones-grid">
              {touchstones.map(touchstone => (
                <div 
                  key={touchstone.id} 
                  className={`touchstone-card ${getStatusClass(touchstone.status)}`}
                >
                  <div className="touchstone-icon">
                    {getRelationshipIcon(touchstone.relationship)}
                  </div>
                  
                  <div className="touchstone-content">
                    <div className="touchstone-header">
                      <h4>{touchstone.name}</h4>
                      <span className={`status-badge ${touchstone.status}`}>
                        {touchstone.status}
                      </span>
                    </div>
                    
                    <div className="touchstone-type">
                      {RELATIONSHIP_TYPES.find(t => t.id === touchstone.relationship)?.label || 'Connection'}
                    </div>
                    
                    {touchstone.conviction && (
                      <div className="touchstone-conviction">
                        <StarIcon size={14} />
                        <span>"{touchstone.conviction}"</span>
                      </div>
                    )}
                    
                    {touchstone.description && (
                      <p className="touchstone-description">{touchstone.description}</p>
                    )}
                    
                    <div className="humanity-level">
                      Humanity Level: {touchstone.humanity}
                    </div>
                  </div>

                  <div className="touchstone-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditTouchstone(touchstone)}
                      title="Edit"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleRemoveTouchstone(touchstone.id)}
                      title="Remove"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Redemption Tab */}
      {activeTab === 'redemption' && (
        <div className="redemption-content">
          <div className="content-header">
            <p className="content-description">
              Redemption paths are journeys to atone for past sins and regain lost humanity.
            </p>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingRedemption(null);
                setShowRedemptionEditor(true);
              }}
            >
              <PlusIcon size={14} /> New Path
            </button>
          </div>

          {redemptions.length === 0 ? (
            <div className="empty-state">
              <SunriseIcon size={48} />
              <h3>No Redemption Paths</h3>
              <p>Begin your journey toward redemption.</p>
            </div>
          ) : (
            <div className="redemption-list">
              {redemptions.map(redemption => (
                <div 
                  key={redemption.id} 
                  className={`redemption-card status-${redemption.status}`}
                >
                  <div className="redemption-header">
                    <div className="redemption-title">
                      <SunriseIcon size={20} />
                      <h4>{redemption.title}</h4>
                    </div>
                    <span className={`redemption-status ${redemption.status}`}>
                      {redemption.status}
                    </span>
                  </div>

                  {redemption.description && (
                    <p className="redemption-description">{redemption.description}</p>
                  )}

                  {redemption.motivation && (
                    <div className="redemption-motivation">
                      <strong>Motivation:</strong> {redemption.motivation}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="redemption-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{redemption.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${redemption.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  {redemption.steps && redemption.steps.length > 0 && (
                    <div className="redemption-steps">
                      <h5>Steps to Redemption</h5>
                      <div className="steps-checklist">
                        {redemption.steps.map((step, idx) => (
                          <div 
                            key={step.id}
                            className={`step-checkbox ${step.status}`}
                            onClick={() => handleStepToggle(redemption.id, step.id)}
                          >
                            <div className={`checkbox ${step.status === 'completed' ? 'checked' : ''}`}>
                              {step.status === 'completed' && <CheckIcon size={12} />}
                            </div>
                            <span className="step-index">{idx + 1}.</span>
                            <span className={`step-label ${step.status === 'completed' ? 'completed' : ''}`}>
                              {step.text}
                            </span>
                            <span 
                              className="step-status-indicator"
                              style={{ color: STEP_STATUS[step.status]?.color }}
                            >
                              {STEP_STATUS[step.status]?.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="redemption-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditRedemption(redemption)}
                      title="Edit"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleRemoveRedemption(redemption.id)}
                      title="Remove"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showTouchstoneEditor && (
        <TouchstoneEditor
          touchstone={editingTouchstone}
          onSave={handleSaveTouchstone}
          onCancel={() => {
            setShowTouchstoneEditor(false);
            setEditingTouchstone(null);
          }}
        />
      )}

      {showRedemptionEditor && (
        <RedemptionEditor
          redemption={editingRedemption}
          onSave={handleSaveRedemption}
          onCancel={() => {
            setShowRedemptionEditor(false);
            setEditingRedemption(null);
          }}
        />
      )}
    </div>
  );
}
