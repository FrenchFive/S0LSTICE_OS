import { useState, useEffect } from 'react';
import { notesDatabase } from '../utils/sharedData';
import { database } from '../utils/database';
import './NotesApp.css';

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const character = database.getCurrentCharacter();
    if (character) {
      const characterNotes = notesDatabase.getCharacterNotes(character.id);
      setNotes(characterNotes);
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const character = database.getCurrentCharacter();
    if (!character) {
      alert('Please select a character first');
      return;
    }

    notesDatabase.saveNote(character.id, selectedNote?.id || null, {
      title: title.trim(),
      content: content
    });

    setIsEditing(false);
    loadNotes();
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    
    if (confirm('Delete this note?')) {
      const character = database.getCurrentCharacter();
      if (character) {
        notesDatabase.deleteNote(character.id, selectedNote.id);
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setIsEditing(false);
        loadNotes();
      }
    }
  };

  return (
    <div className="notes-app">
      <div className="notes-sidebar">
        <div className="notes-header">
          <h2>📝 Notes</h2>
          <button className="btn-new-note" onClick={handleNewNote}>➕ New</button>
        </div>

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-notes">
              <p>No notes yet</p>
              <p className="empty-subtitle">Create your first note</p>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
                onClick={() => handleSelectNote(note)}
              >
                <div className="note-title">{note.title}</div>
                <div className="note-preview">
                  {note.content.substring(0, 100)}
                  {note.content.length > 100 ? '...' : ''}
                </div>
                <div className="note-date">
                  {new Date(note.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="notes-main">
        {!selectedNote && !isEditing ? (
          <div className="notes-empty-main">
            <p>📝 Select a note or create a new one</p>
          </div>
        ) : (
          <>
            <div className="notes-toolbar">
              {!isEditing ? (
                <>
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={handleDelete}>🗑️ Delete</button>
                </>
              ) : (
                <>
                  <button className="btn-save" onClick={handleSave}>💾 Save</button>
                  <button className="btn-cancel" onClick={() => {
                    if (selectedNote) {
                      handleSelectNote(selectedNote);
                    } else {
                      setIsEditing(false);
                      setTitle('');
                      setContent('');
                    }
                  }}>✖ Cancel</button>
                </>
              )}
            </div>

            <div className="notes-editor">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    className="note-title-input"
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    className="note-content-input"
                    placeholder="Start typing your note..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <h1 className="note-display-title">{title}</h1>
                  <div className="note-display-content">{content}</div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NotesApp;
