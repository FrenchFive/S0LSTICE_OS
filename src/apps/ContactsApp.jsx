import { useState, useEffect, useCallback } from 'react';
import './ContactsApp.css';
import { contactsDatabase, messagesDatabase } from '../utils/sharedData';
import { database as db } from '../utils/database';
import { PhoneIcon, MessageIcon, PlusIcon, TrashIcon, SendIcon } from '../components/icons/Icons';

export default function ContactsApp() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    type: 'player',
    notes: '',
    visibility: 'public'
  });

  const character = db.getCurrentCharacter();
  const characterId = db.getCurrentCharacterId();

  const loadContacts = useCallback(() => {
    if (!characterId) {
      setContacts([]);
      return;
    }
    const characterContacts = contactsDatabase.getContacts(characterId);
    setContacts(characterContacts);
  }, [characterId]);

  const loadMessages = useCallback(() => {
    if (!characterId || !selectedContact) {
      setMessages([]);
      return;
    }
    const contactMessages = messagesDatabase.getMessages(characterId, selectedContact.id);
    setMessages(contactMessages);
  }, [characterId, selectedContact]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
  }, [loadMessages]);

  const handleAddContact = () => {
    if (!newContact.name.trim() || !characterId) return;

    const contact = {
      ...newContact,
      addedBy: character?.name || character?.identity?.name || 'Unknown',
      timestamp: Date.now()
    };

    contactsDatabase.saveContact(characterId, contact);
    
    setNewContact({ name: '', type: 'player', notes: '', visibility: 'public' });
    loadContacts();
    setActiveTab('contacts');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !characterId) return;

    const message = {
      text: newMessage,
      sender: character?.name || character?.identity?.name || 'Unknown'
    };

    messagesDatabase.sendMessage(characterId, selectedContact.id, message);

    setNewMessage('');
    loadMessages();
  };

  const handleDeleteContact = (contactId) => {
    if (window.confirm('Delete this contact?')) {
      contactsDatabase.deleteContact(characterId, contactId);
      loadContacts();
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    }
  };

  if (!character) {
    return (
      <div className="contacts-app">
        <div className="no-character">
          <PhoneIcon size={48} />
          <p>No character selected</p>
          <p className="hint">Select a character to manage contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-app">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <PhoneIcon size={16} /> Contacts
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageIcon size={16} /> Messages
        </button>
        <button 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <PlusIcon size={16} /> Add
        </button>
      </div>

      {activeTab === 'contacts' && (
        <div className="contacts-list">
          <h3>Your Contacts</h3>
          {contacts.length === 0 ? (
            <div className="empty-state">
              <p>No contacts yet</p>
              <p className="hint">Add a contact to get started!</p>
            </div>
          ) : (
            <div className="contact-cards">
              {contacts.map(contact => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-header">
                    <div className="contact-name">
                      {contact.type === 'npc' ? '🎭' : contact.type === 'dm' ? '👑' : '👤'} {contact.name}
                    </div>
                    <div className="contact-actions">
                      <button 
                        onClick={() => { setSelectedContact(contact); setActiveTab('messages'); }}
                        className="btn-message"
                        title="Message"
                      >
                        <MessageIcon size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteContact(contact.id)}
                        className="btn-delete"
                        title="Delete"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="contact-info">
                    <div className="contact-type">
                      <span className="label">Type:</span> {contact.type}
                    </div>
                    {contact.notes && (
                      <div className="contact-notes">{contact.notes}</div>
                    )}
                    <div className="contact-meta">
                      Added by {contact.addedBy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-view">
          <div className="messages-sidebar">
            <h4>Conversations</h4>
            {contacts.map(contact => (
              <div 
                key={contact.id}
                className={`conversation-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="conversation-name">
                  {contact.type === 'npc' ? '🎭' : contact.type === 'dm' ? '👑' : '👤'} {contact.name}
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="no-contacts-hint">
                Add contacts first
              </div>
            )}
          </div>

          <div className="messages-content">
            {selectedContact ? (
              <>
                <div className="messages-header">
                  <h3>
                    {selectedContact.type === 'npc' ? '🎭' : selectedContact.type === 'dm' ? '👑' : '👤'} {selectedContact.name}
                  </h3>
                  {selectedContact.type === 'npc' && (
                    <div className="npc-notice">Messages to NPCs are for your notes</div>
                  )}
                </div>

                <div className="messages-thread">
                  {messages.length === 0 ? (
                    <div className="no-messages">No messages yet</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className="message-bubble">
                        <div className="message-sender">{msg.sender}</div>
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="message-input">
                  <input
                    type="text"
                    className="input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSendMessage} className="btn btn-primary btn-send">
                    <SendIcon size={16} /> Send
                  </button>
                </div>
              </>
            ) : (
              <div className="no-conversation">
                <MessageIcon size={48} />
                <p>Select a contact to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="add-contact-form">
          <h3>Add New Contact</h3>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              className="input"
              value={newContact.name}
              onChange={(e) => setNewContact({...newContact, name: e.target.value})}
              placeholder="Contact name"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              className="input"
              value={newContact.type}
              onChange={(e) => setNewContact({...newContact, type: e.target.value})}
            >
              <option value="player">Player</option>
              <option value="npc">NPC</option>
              <option value="dm">DM</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="input"
              value={newContact.notes}
              onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
              placeholder="Optional notes about this contact..."
              rows={4}
            />
          </div>

          <button onClick={handleAddContact} className="btn btn-primary btn-add" disabled={!newContact.name.trim()}>
            <PlusIcon size={16} /> Add Contact
          </button>
        </div>
      )}
    </div>
  );
}
