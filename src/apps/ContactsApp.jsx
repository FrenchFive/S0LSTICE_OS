import { useState, useEffect, useCallback, useMemo } from 'react';
import './ContactsApp.css';
import * as contactsDb from '../utils/sharedData';
import { database as db, dmMode } from '../utils/database';
import { wsClient } from '../utils/websocket';
import { PhoneIcon, MessageIcon, PlusIcon, TrashIcon, SendIcon } from '../components/icons/Icons';

export default function ContactsApp() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [contactsVersion, setContactsVersion] = useState(0);
  const [messagesVersion, setMessagesVersion] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    type: 'player',
    notes: '',
    visibility: 'public'
  });

  const character = db.getCharacter(db.getCurrentCharacterId());
  const isDM = dmMode.isDM();

  const contacts = useMemo(() => {
    const _version = contactsVersion; // Trigger recalculation when version changes
    const allContacts = contactsDb.contactsDatabase.getAllContacts();
    
    if (isDM) {
      // DM sees all contacts
      return allContacts;
    } else {
      // Players see their own contacts + public contacts from others
      const charId = db.getCurrentCharacterId();
      return allContacts.filter(c => 
        c.characterId === charId || c.visibility === 'public'
      );
    }
  }, [isDM, contactsVersion]);

  const messages = useMemo(() => {
    const _version = messagesVersion; // Trigger recalculation when version changes
    const allMessages = contactsDb.messagesDatabase.getAllMessages();
    const charId = db.getCurrentCharacterId();
    
    if (isDM) {
      // DM sees all messages
      return allMessages;
    } else {
      // Players see their own messages
      return allMessages.filter(m => m.characterId === charId);
    }
  }, [isDM, messagesVersion]);

  const loadContacts = useCallback(() => {
    setContactsVersion(v => v + 1);
  }, []);

  const loadMessages = useCallback(() => {
    setMessagesVersion(v => v + 1);
  }, []);

  useEffect(() => {
    // Listen for WebSocket updates
    if (wsClient) {
      const handleContactSync = () => {
        loadContacts();
      };
      const handleMessageSync = () => {
        loadMessages();
      };

      window.addEventListener('contact_synced', handleContactSync);
      window.addEventListener('message_synced', handleMessageSync);

      return () => {
        window.removeEventListener('contact_synced', handleContactSync);
        window.removeEventListener('message_synced', handleMessageSync);
      };
    }
  }, [loadContacts, loadMessages]);

  const handleAddContact = () => {
    if (!newContact.name.trim()) return;

    const contact = {
      ...newContact,
      characterId: db.getCurrentCharacterId(),
      addedBy: character?.name || 'Unknown',
      timestamp: Date.now()
    };

    contactsDb.contactsDatabase.saveContact(contact);
    
    // Sync with server
    if (wsClient && wsClient.isConnected()) {
      wsClient.syncContact(contact);
    }

    setNewContact({ name: '', type: 'player', notes: '', visibility: 'public' });
    loadContacts();
    setActiveTab('contacts');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message = {
      contactId: selectedContact.id,
      characterId: db.getCurrentCharacterId(),
      sender: character?.name || 'Unknown',
      text: newMessage,
      timestamp: Date.now()
    };

    // If sending to NPC, route to DM
    if (selectedContact.type === 'npc') {
      message.toDM = true;
    }

    contactsDb.messagesDatabase.saveMessage(message);

    // Sync with server
    if (wsClient && wsClient.isConnected()) {
      wsClient.syncMessage(message);
    }

    setNewMessage('');
    loadMessages();
  };

  const handleDeleteContact = (contactId) => {
    if (confirm('Delete this contact?')) {
      contactsDb.contactsDatabase.deleteContact(contactId);
      loadContacts();
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    }
  };

  const getContactMessages = (contactId) => {
    return messages.filter(m => m.contactId === contactId).sort((a, b) => a.timestamp - b.timestamp);
  };

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
          <PlusIcon size={16} /> Add Contact
        </button>
      </div>

      {activeTab === 'contacts' && (
        <div className="contacts-list">
          <h3>Your Contacts</h3>
          {contacts.length === 0 ? (
            <div className="empty-state">
              <p>No contacts yet</p>
              <p>Add a contact to get started!</p>
            </div>
          ) : (
            <div className="contact-cards">
              {contacts.map(contact => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-header">
                    <div className="contact-name">
                      {contact.name}
                    </div>
                    <div className="contact-actions">
                      <button 
                        onClick={() => { setSelectedContact(contact); setActiveTab('messages'); }}
                        className="btn-message"
                      >
                        <MessageIcon size={16} />
                      </button>
                      {contact.characterId === db.getCurrentCharacterId() && (
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="btn-delete"
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="contact-info">
                    <div className="contact-type">
                      Type: <span>{contact.type}</span>
                    </div>
                    <div className="contact-visibility">
                      Visibility: <span>{contact.visibility}</span>
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
            {contacts.map(contact => {
              const contactMessages = getContactMessages(contact.id);
              const unreadCount = contactMessages.length;
              return (
                <div 
                  key={contact.id}
                  className={`conversation-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="conversation-name">
                    {contact.type === 'npc' ? '🎭' : contact.type === 'dm' ? '👑' : '👤'} {contact.name}
                  </div>
                  {unreadCount > 0 && (
                    <div className="message-count">{unreadCount}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="messages-content">
            {selectedContact ? (
              <>
                <div className="messages-header">
                  <h3>
                    {selectedContact.type === 'npc' ? '🎭' : selectedContact.type === 'dm' ? '👑' : '👤'} {selectedContact.name}
                  </h3>
                  {selectedContact.type === 'npc' && (
                    <div className="npc-notice">Messages to NPCs are sent to the DM</div>
                  )}
                </div>

                <div className="messages-thread">
                  {getContactMessages(selectedContact.id).map(msg => (
                    <div key={msg.id} className="message-bubble">
                      <div className="message-sender">{msg.sender}</div>
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-input">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSendMessage} className="btn-send">
                    <SendIcon size={16} /> Send
                  </button>
                </div>
              </>
            ) : (
              <div className="no-conversation">
                <p>Select a contact to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="add-contact-form">
          <h3>Add New Contact</h3>
          
          <div className="form-field">
            <label>Name *</label>
            <input
              type="text"
              value={newContact.name}
              onChange={(e) => setNewContact({...newContact, name: e.target.value})}
              placeholder="Contact name"
            />
          </div>

          <div className="form-field">
            <label>Type</label>
            <select
              value={newContact.type}
              onChange={(e) => setNewContact({...newContact, type: e.target.value})}
            >
              <option value="player">Player</option>
              <option value="npc">NPC</option>
              <option value="dm">DM</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-field">
            <label>Visibility</label>
            <select
              value={newContact.visibility}
              onChange={(e) => setNewContact({...newContact, visibility: e.target.value})}
            >
              <option value="public">Public (Whole Party)</option>
              <option value="private">Private (Only DM and Me)</option>
            </select>
          </div>

          <div className="form-field">
            <label>Notes</label>
            <textarea
              value={newContact.notes}
              onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
              placeholder="Optional notes about this contact..."
              rows={4}
            />
          </div>

          <button onClick={handleAddContact} className="btn-add">
            ➕ Add Contact
          </button>
        </div>
      )}
    </div>
  );
}
