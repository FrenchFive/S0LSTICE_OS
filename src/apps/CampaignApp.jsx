import { useState } from 'react';
import { database, dmMode } from '../utils/database';
import { GlobeIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, CalendarIcon, UsersIcon, FlagIcon, TargetIcon, StarIcon, CrownIcon, BookIcon } from '../components/icons/Icons';
import './CampaignApp.css';

// Campaign storage
const CAMPAIGN_KEY = 'hunters_campaign';
const SESSIONS_KEY = 'hunters_sessions';

const campaignDatabase = {
  getCampaign() {
    const data = localStorage.getItem(CAMPAIGN_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  saveCampaign(campaign) {
    const updated = {
      ...campaign,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(updated));
    return updated;
  },
  
  getSessions() {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveSession(session) {
    const sessions = this.getSessions();
    const newSession = {
      ...session,
      id: session.id || Date.now().toString(),
      createdAt: session.createdAt || new Date().toISOString()
    };
    
    const existingIndex = sessions.findIndex(s => s.id === newSession.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = newSession;
    } else {
      sessions.push(newSession);
    }
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return newSession;
  },
  
  deleteSession(id) {
    const sessions = this.getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  }
};

// Session status options
const SESSION_STATUSES = [
  { id: 'planned', label: 'Planned', color: 'var(--color-info)' },
  { id: 'completed', label: 'Completed', color: 'var(--color-success)' },
  { id: 'cancelled', label: 'Cancelled', color: 'var(--color-text-muted)' },
];

function CampaignEditor({ campaign, onSave, onCancel }) {
  const [form, setForm] = useState(campaign || {
    name: '',
    description: '',
    setting: '',
    startDate: '',
    currentArc: '',
    themes: '',
    notes: '',
    playerCount: 0,
    sessionFrequency: 'weekly'
  });

  return (
    <div className="modal-overlay">
      <div className="campaign-editor-modal">
        <div className="modal-header">
          <h3>{campaign ? 'Edit Campaign' : 'Create Campaign'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Campaign Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="e.g., Chronicles of the Night"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="What is this campaign about?"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Setting</label>
              <input
                type="text"
                className="input"
                value={form.setting}
                onChange={(e) => setForm({...form, setting: e.target.value})}
                placeholder="e.g., Modern day Chicago"
              />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({...form, startDate: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Session Frequency</label>
              <select
                className="input"
                value={form.sessionFrequency}
                onChange={(e) => setForm({...form, sessionFrequency: e.target.value})}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 Weeks</option>
                <option value="monthly">Monthly</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>

            <div className="form-group">
              <label>Player Count</label>
              <input
                type="number"
                className="input"
                value={form.playerCount}
                onChange={(e) => setForm({...form, playerCount: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Current Story Arc</label>
            <input
              type="text"
              className="input"
              value={form.currentArc}
              onChange={(e) => setForm({...form, currentArc: e.target.value})}
              placeholder="The current major story arc"
            />
          </div>

          <div className="form-group">
            <label>Themes</label>
            <input
              type="text"
              className="input"
              value={form.themes}
              onChange={(e) => setForm({...form, themes: e.target.value})}
              placeholder="e.g., Redemption, Sacrifice, Trust"
            />
          </div>

          <div className="form-group">
            <label>DM Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              placeholder="Private notes for the campaign..."
              rows={3}
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
            <CheckIcon size={16} /> Save Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionEditor({ session, onSave, onCancel }) {
  const [form, setForm] = useState(session || {
    number: 1,
    title: '',
    date: new Date().toISOString().split('T')[0],
    status: 'planned',
    summary: '',
    highlights: '',
    npcsIntroduced: '',
    locationsVisited: '',
    xpAwarded: 0,
    loot: '',
    hooks: '',
    notes: ''
  });

  return (
    <div className="modal-overlay">
      <div className="session-editor-modal">
        <div className="modal-header">
          <h3>{session ? 'Edit Session' : 'Log Session'}</h3>
          <button className="btn-close" onClick={onCancel}>
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Session #</label>
              <input
                type="number"
                className="input"
                value={form.number}
                onChange={(e) => setForm({...form, number: parseInt(e.target.value) || 1})}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value})}
              >
                {SESSION_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Session Title</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="A memorable title for this session"
            />
          </div>

          <div className="form-group">
            <label>Summary</label>
            <textarea
              className="input textarea"
              value={form.summary}
              onChange={(e) => setForm({...form, summary: e.target.value})}
              placeholder="What happened in this session?"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Highlights</label>
            <textarea
              className="input textarea"
              value={form.highlights}
              onChange={(e) => setForm({...form, highlights: e.target.value})}
              placeholder="Key moments, epic rolls, great roleplay..."
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>NPCs Introduced</label>
              <input
                type="text"
                className="input"
                value={form.npcsIntroduced}
                onChange={(e) => setForm({...form, npcsIntroduced: e.target.value})}
                placeholder="New NPCs met"
              />
            </div>

            <div className="form-group">
              <label>Locations Visited</label>
              <input
                type="text"
                className="input"
                value={form.locationsVisited}
                onChange={(e) => setForm({...form, locationsVisited: e.target.value})}
                placeholder="Places explored"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>XP Awarded</label>
              <input
                type="number"
                className="input"
                value={form.xpAwarded}
                onChange={(e) => setForm({...form, xpAwarded: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Loot Found</label>
              <input
                type="text"
                className="input"
                value={form.loot}
                onChange={(e) => setForm({...form, loot: e.target.value})}
                placeholder="Items, money, etc."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Plot Hooks / Cliffhangers</label>
            <textarea
              className="input textarea"
              value={form.hooks}
              onChange={(e) => setForm({...form, hooks: e.target.value})}
              placeholder="Unresolved threads for next session..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>DM Notes</label>
            <textarea
              className="input textarea"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              placeholder="Private notes about what to remember..."
              rows={2}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => onSave(form)}
          >
            <CheckIcon size={16} /> Save Session
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestoneTracker({ campaign, onUpdate }) {
  const [newMilestone, setNewMilestone] = useState('');
  const milestones = campaign?.milestones || [];

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const updated = {
      ...campaign,
      milestones: [
        ...milestones,
        {
          id: Date.now().toString(),
          text: newMilestone,
          completed: false,
          createdAt: new Date().toISOString()
        }
      ]
    };
    onUpdate(updated);
    setNewMilestone('');
  };

  const toggleMilestone = (id) => {
    const updated = {
      ...campaign,
      milestones: milestones.map(m => 
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    };
    onUpdate(updated);
  };

  const removeMilestone = (id) => {
    const updated = {
      ...campaign,
      milestones: milestones.filter(m => m.id !== id)
    };
    onUpdate(updated);
  };

  return (
    <div className="milestone-tracker">
      <h4><FlagIcon size={16} /> Campaign Milestones</h4>
      
      <div className="add-milestone">
        <input
          type="text"
          className="input"
          value={newMilestone}
          onChange={(e) => setNewMilestone(e.target.value)}
          placeholder="Add a campaign milestone..."
          onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
        />
        <button 
          className="btn btn-success btn-sm"
          onClick={addMilestone}
          disabled={!newMilestone.trim()}
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {milestones.length === 0 ? (
        <p className="empty-milestones">No milestones set yet.</p>
      ) : (
        <div className="milestones-list">
          {milestones.map(milestone => (
            <div 
              key={milestone.id}
              className={`milestone-item ${milestone.completed ? 'completed' : ''}`}
            >
              <button 
                className={`milestone-check ${milestone.completed ? 'checked' : ''}`}
                onClick={() => toggleMilestone(milestone.id)}
              >
                {milestone.completed && <CheckIcon size={12} />}
              </button>
              <span className="milestone-text">{milestone.text}</span>
              <button 
                className="btn-remove"
                onClick={() => removeMilestone(milestone.id)}
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CampaignApp() {
  const [isDM] = useState(() => dmMode.isDM());
  const [campaign, setCampaign] = useState(() => campaignDatabase.getCampaign());
  const [sessions, setSessions] = useState(() => campaignDatabase.getSessions().sort((a, b) => b.number - a.number));
  const [activeTab, setActiveTab] = useState('overview');
  const [showCampaignEditor, setShowCampaignEditor] = useState(false);
  const [showSessionEditor, setShowSessionEditor] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [characters, setCharacters] = useState(() => database.getAllCharacters());

  const reloadData = () => {
    setCampaign(campaignDatabase.getCampaign());
    setSessions(campaignDatabase.getSessions().sort((a, b) => b.number - a.number));
    setCharacters(database.getAllCharacters());
  };

  const handleSaveCampaign = (campaignData) => {
    const saved = campaignDatabase.saveCampaign(campaignData);
    setCampaign(saved);
    setShowCampaignEditor(false);
  };

  const handleUpdateCampaign = (updated) => {
    const saved = campaignDatabase.saveCampaign(updated);
    setCampaign(saved);
  };

  const handleSaveSession = (sessionData) => {
    campaignDatabase.saveSession(sessionData);
    reloadData();
    setShowSessionEditor(false);
    setEditingSession(null);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowSessionEditor(true);
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Delete this session log?')) {
      campaignDatabase.deleteSession(sessionId);
      reloadData();
    }
  };

  const getNextSessionNumber = () => {
    if (sessions.length === 0) return 1;
    return Math.max(...sessions.map(s => s.number)) + 1;
  };

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const plannedSessions = sessions.filter(s => s.status === 'planned');
  const totalXP = completedSessions.reduce((sum, s) => sum + (s.xpAwarded || 0), 0);

  if (!isDM) {
    return (
      <div className="campaign-app">
        <div className="not-dm">
          <CrownIcon size={48} />
          <h2>DM Only</h2>
          <p>Campaign management tools are only available for the Game Master.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-app">
      <div className="campaign-header">
        <h1>
          <GlobeIcon size={28} /> 
          Campaign
        </h1>
        {!campaign && (
          <button 
            className="btn btn-success"
            onClick={() => setShowCampaignEditor(true)}
          >
            <PlusIcon size={16} /> Create Campaign
          </button>
        )}
      </div>

      {/* No Campaign State */}
      {!campaign && (
        <div className="no-campaign">
          <GlobeIcon size={64} />
          <h2>No Campaign Created</h2>
          <p>Create a campaign to start tracking your chronicle.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCampaignEditor(true)}
          >
            <PlusIcon size={16} /> Create Campaign
          </button>
        </div>
      )}

      {/* Campaign Exists */}
      {campaign && (
        <>
          {/* Campaign Banner */}
          <div className="campaign-banner">
            <div className="banner-content">
              <h2>{campaign.name}</h2>
              <p className="campaign-setting">{campaign.setting}</p>
              {campaign.currentArc && (
                <p className="current-arc">
                  <TargetIcon size={14} /> {campaign.currentArc}
                </p>
              )}
            </div>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowCampaignEditor(true)}
            >
              <EditIcon size={14} /> Edit
            </button>
          </div>

          {/* Stats */}
          <div className="campaign-stats">
            <div className="stat-box">
              <CalendarIcon size={20} />
              <span className="stat-value">{completedSessions.length}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-box">
              <UsersIcon size={20} />
              <span className="stat-value">{characters.length}</span>
              <span className="stat-label">Characters</span>
            </div>
            <div className="stat-box">
              <StarIcon size={20} />
              <span className="stat-value">{totalXP}</span>
              <span className="stat-label">Total XP</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
            <button 
              className={`tab ${activeTab === 'characters' ? 'active' : ''}`}
              onClick={() => setActiveTab('characters')}
            >
              Characters
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-content">
              {campaign.description && (
                <div className="info-section">
                  <h4>Description</h4>
                  <p>{campaign.description}</p>
                </div>
              )}

              {campaign.themes && (
                <div className="info-section">
                  <h4>Themes</h4>
                  <div className="themes-list">
                    {campaign.themes.split(',').map((theme, idx) => (
                      <span key={idx} className="theme-tag">{theme.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <MilestoneTracker 
                campaign={campaign}
                onUpdate={handleUpdateCampaign}
              />

              {campaign.notes && (
                <div className="info-section dm-notes">
                  <h4><BookIcon size={16} /> DM Notes</h4>
                  <p>{campaign.notes}</p>
                </div>
              )}

              {plannedSessions.length > 0 && (
                <div className="info-section">
                  <h4>Upcoming Sessions</h4>
                  <div className="upcoming-sessions">
                    {plannedSessions.slice(0, 3).map(session => (
                      <div key={session.id} className="upcoming-session">
                        <span className="session-number">#{session.number}</span>
                        <span className="session-title">{session.title || 'Untitled'}</span>
                        <span className="session-date">{session.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="sessions-content">
              <div className="sessions-header">
                <h3>Session Log</h3>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    setEditingSession({ number: getNextSessionNumber() });
                    setShowSessionEditor(true);
                  }}
                >
                  <PlusIcon size={14} /> New Session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-sessions">
                  <CalendarIcon size={48} />
                  <h4>No Sessions Logged</h4>
                  <p>Log your first session to start tracking your campaign history.</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {sessions.map(session => {
                    const statusInfo = SESSION_STATUSES.find(s => s.id === session.status);
                    return (
                      <div key={session.id} className={`session-card status-${session.status}`}>
                        <div className="session-header">
                          <div className="session-number-title">
                            <span className="session-num">#{session.number}</span>
                            <h4>{session.title || 'Untitled Session'}</h4>
                          </div>
                          <span 
                            className="session-status"
                            style={{ backgroundColor: statusInfo?.color }}
                          >
                            {statusInfo?.label}
                          </span>
                        </div>

                        <div className="session-date">{session.date}</div>

                        {session.summary && (
                          <p className="session-summary">{session.summary}</p>
                        )}

                        {session.highlights && (
                          <div className="session-highlights">
                            <strong>Highlights:</strong> {session.highlights}
                          </div>
                        )}

                        <div className="session-meta">
                          {session.xpAwarded > 0 && (
                            <span className="meta-item">
                              <StarIcon size={12} /> {session.xpAwarded} XP
                            </span>
                          )}
                          {session.loot && (
                            <span className="meta-item">
                              Loot: {session.loot}
                            </span>
                          )}
                        </div>

                        {session.hooks && (
                          <div className="session-hooks">
                            <strong>Hooks:</strong> {session.hooks}
                          </div>
                        )}

                        <div className="session-actions">
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditSession(session)}
                          >
                            <EditIcon size={14} /> Edit
                          </button>
                          <button 
                            className="btn btn-outline btn-sm danger"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Characters Tab */}
          {activeTab === 'characters' && (
            <div className="characters-content">
              <h3>Player Characters</h3>
              
              {characters.length === 0 ? (
                <div className="empty-characters">
                  <UsersIcon size={48} />
                  <h4>No Characters</h4>
                  <p>Characters created by players will appear here.</p>
                </div>
              ) : (
                <div className="characters-grid">
                  {characters.map(char => (
                    <div key={char.id} className="character-overview-card">
                      <div className="char-avatar">
                        {char.identity?.portraitUrl || char.image ? (
                          <img 
                            src={char.identity?.portraitUrl || char.image} 
                            alt={char.identity?.name || char.name} 
                          />
                        ) : (
                          <span>{(char.identity?.name || char.name)?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="char-info">
                        <h4>{char.identity?.name || char.name}</h4>
                        <p className="char-creed">{char.identity?.creed || 'Hunter'}</p>
                        <div className="char-stats">
                          <span>XP: {char.experience?.total || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCampaignEditor && (
        <CampaignEditor
          campaign={campaign}
          onSave={handleSaveCampaign}
          onCancel={() => setShowCampaignEditor(false)}
        />
      )}

      {showSessionEditor && (
        <SessionEditor
          session={editingSession}
          onSave={handleSaveSession}
          onCancel={() => {
            setShowSessionEditor(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
}
