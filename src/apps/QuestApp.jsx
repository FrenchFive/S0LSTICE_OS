import { useState, useEffect } from 'react';
import { questDatabase } from '../utils/sharedData';
import { wsClient } from '../utils/websocket';
import './QuestApp.css';

function QuestApp() {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Main Quest',
    priority: 'Medium',
    completed: false
  });

  useEffect(() => {
    loadQuests();

    // Listen for quest updates from server
    const handleQuestSync = (data) => {
      if (data.action === 'update') {
        loadQuests();
      }
    };

    if (wsClient.ws) {
      wsClient.ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'quest_sync') {
          handleQuestSync(data);
        }
      });
    }
  }, []);

  const loadQuests = () => {
    const allQuests = questDatabase.getAllQuests();
    setQuests(allQuests);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a quest title');
      return;
    }

    const quest = questDatabase.saveQuest(null, formData);
    
    // Sync with server
    if (wsClient.isConnected()) {
      wsClient.syncQuest(quest);
    }

    setFormData({
      title: '',
      description: '',
      category: 'Main Quest',
      priority: 'Medium',
      completed: false
    });
    setShowAddForm(false);
    loadQuests();
  };

  const handleToggleComplete = (quest) => {
    const updated = questDatabase.saveQuest(quest.id, {
      ...quest,
      completed: !quest.completed
    });

    if (wsClient.isConnected()) {
      wsClient.syncQuest(updated);
    }

    loadQuests();
    if (selectedQuest && selectedQuest.id === quest.id) {
      setSelectedQuest(updated);
    }
  };

  const handleDeleteQuest = (questId) => {
    if (confirm('Delete this quest?')) {
      questDatabase.deleteQuest(questId);
      
      if (wsClient.isConnected()) {
        wsClient.syncQuest({ id: questId, deleted: true });
      }

      if (selectedQuest && selectedQuest.id === questId) {
        setSelectedQuest(null);
      }
      loadQuests();
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Main Quest': '🎯',
      'Side Quest': '📌',
      'Personal Goal': '⭐',
      'Party Objective': '👥'
    };
    return icons[category] || '📋';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  const stats = {
    total: quests.length,
    completed: quests.filter(q => q.completed).length,
    pending: quests.filter(q => !q.completed).length,
    percentage: quests.length > 0 ? Math.round((quests.filter(q => q.completed).length / quests.length) * 100) : 0
  };

  return (
    <div className="quest-app">
      <div className="quest-header">
        <h1>✅ Quest Log</h1>
        <button className="btn-add-quest" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✖ Cancel' : '➕ Add Quest'}
        </button>
      </div>

      <div className="quest-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Quests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.percentage}%</div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      {showAddForm && (
        <form className="quest-form" onSubmit={handleSubmit}>
          <h3>New Quest</h3>
          
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Quest title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Quest description and objectives"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Main Quest</option>
                <option>Side Quest</option>
                <option>Personal Goal</option>
                <option>Party Objective</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit">💾 Save Quest</button>
        </form>
      )}

      <div className="quest-list">
        {quests.length === 0 ? (
          <div className="empty-state">
            <p>📝 No quests yet</p>
            <p className="empty-subtitle">Add a quest to track your party's objectives</p>
          </div>
        ) : (
          quests.map(quest => (
            <div
              key={quest.id}
              className={`quest-card ${quest.completed ? 'completed' : ''} ${getPriorityClass(quest.priority)}`}
              onClick={() => setSelectedQuest(quest)}
            >
              <div className="quest-checkbox">
                <input
                  type="checkbox"
                  checked={quest.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(quest);
                  }}
                />
              </div>

              <div className="quest-content">
                <div className="quest-title">
                  {getCategoryIcon(quest.category)} {quest.title}
                </div>
                <div className="quest-meta">
                  <span className="quest-category">{quest.category}</span>
                  <span className={`quest-priority ${getPriorityClass(quest.priority)}`}>
                    {quest.priority}
                  </span>
                  <span className="quest-author">by {quest.addedBy}</span>
                </div>
                {quest.description && (
                  <div className="quest-description">{quest.description}</div>
                )}
              </div>

              <div className="quest-actions">
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuest(quest.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedQuest && (
        <div className="quest-modal" onClick={() => setSelectedQuest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedQuest(null)}>✖</button>
            
            <h2>{getCategoryIcon(selectedQuest.category)} {selectedQuest.title}</h2>
            
            <div className="modal-meta">
              <span className={`badge ${getPriorityClass(selectedQuest.priority)}`}>
                {selectedQuest.priority} Priority
              </span>
              <span className="badge">{selectedQuest.category}</span>
              <span className="badge">
                {selectedQuest.completed ? '✅ Completed' : '🔄 In Progress'}
              </span>
            </div>

            {selectedQuest.description && (
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedQuest.description}</p>
              </div>
            )}

            <div className="modal-section">
              <p className="modal-info">Added by: <strong>{selectedQuest.addedBy}</strong></p>
              <p className="modal-info">Created: {new Date(selectedQuest.timestamp).toLocaleString()}</p>
              {selectedQuest.version && (
                <p className="modal-info">Version: {selectedQuest.version}</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className={`btn-toggle ${selectedQuest.completed ? 'btn-uncomplete' : 'btn-complete'}`}
                onClick={() => {
                  handleToggleComplete(selectedQuest);
                  setSelectedQuest(null);
                }}
              >
                {selectedQuest.completed ? '🔄 Mark Incomplete' : '✅ Mark Complete'}
              </button>
              <button
                className="btn-delete-large"
                onClick={() => {
                  handleDeleteQuest(selectedQuest.id);
                  setSelectedQuest(null);
                }}
              >
                🗑️ Delete Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestApp;
