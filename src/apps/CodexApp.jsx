import { useState, useEffect, useCallback } from 'react';
import { codexDatabase, bestiaryDatabase } from '../utils/sharedData';
import { wsClient } from '../utils/websocket';
import { database, dmMode } from '../utils/database';
import { BookIcon, PlusIcon, EditIcon, TrashIcon, CheckIcon, XIcon } from '../components/icons/Icons';
import './CodexApp.css';

export default function CodexApp() {
  const [activeTab, setActiveTab] = useState('lore'); // 'lore' or 'bestiary'
  const [pages, setPages] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivatePages, setShowPrivatePages] = useState(false);
  const isDM = dmMode.isDM();
  const character = database.getCurrentCharacter();

  const loadData = useCallback(() => {
    const allPages = codexDatabase.getAllPages();
    const filteredPages = isDM || showPrivatePages
      ? allPages
      : allPages.filter(p => !p.isPrivate);
    setPages(filteredPages);

    const allCreatures = bestiaryDatabase.getAllEntries();
    setCreatures(allCreatures);
  }, [isDM, showPrivatePages]);

  useEffect(() => {
    loadData();

    const ws = wsClient;
    if (ws) {
      ws.on('codex_sync', (data) => {
        if (data.pages) {
          codexDatabase.syncPages(data.pages);
          loadData();
        }
      });

      ws.on('bestiary_sync', (data) => {
        if (data.creatures) {
          data.creatures.forEach(creature => {
            bestiaryDatabase.syncEntry(creature);
          });
          loadData();
        }
      });
    }

    return () => {
      if (ws) {
        ws.off('codex_sync');
        ws.off('bestiary_sync');
      }
    };
  }, [loadData]);

  const handleCreatePage = () => {
    const newPage = {
      title: 'Untitled Page',
      content: '',
      isPrivate: false,
      author: character?.name || 'Unknown'
    };
    const saved = codexDatabase.savePage(newPage);
    setSelectedPage(saved);
    setIsEditing(true);
    loadData();

    // Sync with other players
    if (wsClient.connected) {
      wsClient.syncCodex(codexDatabase.getAllPages());
    }
  };

  const handleSavePage = (page) => {
    const saved = codexDatabase.savePage(page);
    setSelectedPage(saved);
    setIsEditing(false);
    loadData();

    // Sync with other players
    if (wsClient.connected) {
      wsClient.syncCodex(codexDatabase.getAllPages());
    }
  };

  const handleDeletePage = (id) => {
    if (confirm('Are you sure you want to delete this page?')) {
      codexDatabase.deletePage(id);
      setSelectedPage(null);
      loadData();

      if (wsClient.connected) {
        wsClient.syncCodex(codexDatabase.getAllPages());
      }
    }
  };

  const handleTogglePrivate = (page) => {
    if (!isDM) return;

    const updated = {
      ...page,
      isPrivate: !page.isPrivate
    };
    handleSavePage(updated);
  };

  const handleCreateCreature = () => {
    const newCreature = {
      name: 'Unknown Creature',
      type: '',
      description: '',
      stats: '',
      addedBy: character?.name || 'Unknown'
    };
    const saved = bestiaryDatabase.saveEntry(newCreature);
    setSelectedCreature(saved);
    setIsEditing(true);
    loadData();

    if (wsClient.connected) {
      wsClient.syncBestiary(bestiaryDatabase.getAllEntries());
    }
  };

  const handleSaveCreature = (creature) => {
    const saved = bestiaryDatabase.saveEntry(creature);
    setSelectedCreature(saved);
    setIsEditing(false);
    loadData();

    if (wsClient.connected) {
      wsClient.syncBestiary(bestiaryDatabase.getAllEntries());
    }
  };

  const handleDeleteCreature = (id) => {
    if (confirm('Are you sure you want to delete this creature?')) {
      bestiaryDatabase.deleteEntry(id);
      setSelectedCreature(null);
      loadData();

      if (wsClient.connected) {
        wsClient.syncBestiary(bestiaryDatabase.getAllEntries());
      }
    }
  };

  return (
    <div className="codex-app">
      <div className="codex-header">
        <h1><BookIcon size={32} /> Codex</h1>
        <div className="codex-tabs">
          <button
            className={`codex-tab ${activeTab === 'lore' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('lore');
              setSelectedPage(null);
              setIsEditing(false);
            }}
          >
            Lore
          </button>
          <button
            className={`codex-tab ${activeTab === 'bestiary' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bestiary');
              setSelectedCreature(null);
              setIsEditing(false);
            }}
          >
            Bestiary
          </button>
        </div>
      </div>

      {activeTab === 'lore' ? (
        <div className="codex-content">
          <div className="codex-sidebar">
            <div className="sidebar-header">
              <h3>Pages</h3>
              <button className="btn-create" onClick={handleCreatePage}>
                <PlusIcon size={14} /> New Page
              </button>
            </div>
            {isDM && (
              <div className="dm-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={showPrivatePages}
                    onChange={(e) => {
                      setShowPrivatePages(e.target.checked);
                      loadData();
                    }}
                  />
                  Show DM Pages
                </label>
              </div>
            )}
            <div className="page-list">
              {pages.length === 0 ? (
                <div className="empty-state">No pages yet</div>
              ) : (
                pages.map((page) => (
                  <div
                    key={page.id}
                    className={`page-item ${selectedPage?.id === page.id ? 'active' : ''} ${page.isPrivate ? 'private' : ''}`}
                    onClick={() => {
                      setSelectedPage(page);
                      setIsEditing(false);
                    }}
                  >
                    <div className="page-title">
                      {page.isPrivate && '[Private] '}
                      {page.title}
                    </div>
                    <div className="page-author">by {page.author}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="codex-main">
            {selectedPage ? (
              isEditing ? (
                <PageEditor
                  page={selectedPage}
                  onSave={handleSavePage}
                  onCancel={() => setIsEditing(false)}
                  isDM={isDM}
                />
              ) : (
                <PageViewer
                  page={selectedPage}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDeletePage}
                  onTogglePrivate={handleTogglePrivate}
                  isDM={isDM}
                />
              )
            ) : (
              <div className="empty-main">
                <p>Select a page to view or create a new one</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="codex-content">
          <div className="codex-sidebar">
            <div className="sidebar-header">
              <h3>Creatures</h3>
              <button className="btn-create" onClick={handleCreateCreature}>
                <PlusIcon size={14} /> New Creature
              </button>
            </div>
            <div className="page-list">
              {creatures.length === 0 ? (
                <div className="empty-state">No creatures yet</div>
              ) : (
                creatures.map((creature) => (
                  <div
                    key={creature.id}
                    className={`page-item ${selectedCreature?.id === creature.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCreature(creature);
                      setIsEditing(false);
                    }}
                  >
                    <div className="page-title">{creature.name}</div>
                    <div className="page-author">by {creature.addedBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="codex-main">
            {selectedCreature ? (
              isEditing ? (
                <CreatureEditor
                  creature={selectedCreature}
                  onSave={handleSaveCreature}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <CreatureViewer
                  creature={selectedCreature}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDeleteCreature}
                />
              )
            ) : (
              <div className="empty-main">
                <p>Select a creature to view or add a new one</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageViewer({ page, onEdit, onDelete, onTogglePrivate, isDM }) {
  return (
    <div className="page-viewer">
      <div className="page-viewer-header">
        <h2>{page.title}</h2>
        <div className="page-actions">
          {isDM && (
            <button
              className="btn-toggle-private"
              onClick={() => onTogglePrivate(page)}
              title={page.isPrivate ? 'Make Public' : 'Make Private (DM Only)'}
            >
              {page.isPrivate ? 'Public' : 'Private'}
            </button>
          )}
          <button className="btn-edit" onClick={onEdit}>
            <EditIcon size={14} /> Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(page.id)}>
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      </div>
      <div className="page-meta">
        <span>Author: {page.author}</span>
        <span>Updated: {new Date(page.updatedAt).toLocaleString()}</span>
        {page.isPrivate && <span className="private-badge">DM Private</span>}
      </div>
      <div className="page-content">
        {page.content || <em>No content yet</em>}
      </div>
    </div>
  );
}

function PageEditor({ page, onSave, onCancel, isDM }) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content || '');
  const [isPrivate, setIsPrivate] = useState(page.isPrivate || false);

  const handleSubmit = () => {
    onSave({
      ...page,
      title,
      content,
      isPrivate: isDM ? isPrivate : false
    });
  };

  return (
    <div className="page-editor">
      <div className="editor-field">
        <label>Page Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title..."
        />
      </div>
      {isDM && (
        <div className="editor-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private (DM Only) - Only visible to DM until shared
          </label>
        </div>
      )}
      <div className="editor-field">
        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your lore here..."
          rows={15}
        />
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSubmit}>
          <CheckIcon size={14} /> Save Page
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          <XIcon size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

function CreatureViewer({ creature, onEdit, onDelete }) {
  return (
    <div className="page-viewer">
      <div className="page-viewer-header">
        <h2>{creature.name}</h2>
        <div className="page-actions">
          <button className="btn-edit" onClick={onEdit}>
            <EditIcon size={14} /> Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(creature.id)}>
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      </div>
      <div className="page-meta">
        <span>Added by: {creature.addedBy}</span>
        <span>Updated: {new Date(creature.updatedAt).toLocaleString()}</span>
      </div>
      <div className="creature-details">
        {creature.type && (
          <div className="creature-field">
            <strong>Type:</strong> {creature.type}
          </div>
        )}
        {creature.description && (
          <div className="creature-field">
            <strong>Description:</strong>
            <p>{creature.description}</p>
          </div>
        )}
        {creature.stats && (
          <div className="creature-field">
            <strong>Stats & Abilities:</strong>
            <pre>{creature.stats}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function CreatureEditor({ creature, onSave, onCancel }) {
  const [name, setName] = useState(creature.name);
  const [type, setType] = useState(creature.type || '');
  const [description, setDescription] = useState(creature.description || '');
  const [stats, setStats] = useState(creature.stats || '');

  const handleSubmit = () => {
    onSave({
      ...creature,
      name,
      type,
      description,
      stats
    });
  };

  return (
    <div className="page-editor">
      <div className="editor-field">
        <label>Creature Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter creature name..."
        />
      </div>
      <div className="editor-field">
        <label>Type</label>
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Anomaly, Monster, Beast..."
        />
      </div>
      <div className="editor-field">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the creature..."
          rows={6}
        />
      </div>
      <div className="editor-field">
        <label>Stats & Abilities</label>
        <textarea
          value={stats}
          onChange={(e) => setStats(e.target.value)}
          placeholder="HP, AC, attacks, abilities, weaknesses, etc."
          rows={8}
        />
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSubmit}>
          <CheckIcon size={14} /> Save Creature
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          <XIcon size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}
