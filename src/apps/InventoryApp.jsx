import { useState, useEffect } from 'react';
import { inventoryDatabase } from '../utils/sharedData';
import { database } from '../utils/database';
import './InventoryApp.css';

function InventoryApp() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'Misc',
    quantity: 1,
    weight: 0,
    rarity: 'Common',
    description: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const character = database.getCurrentCharacter();
    if (character) {
      const characterItems = inventoryDatabase.getCharacterItems(character.id);
      setItems(characterItems);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    const character = database.getCurrentCharacter();
    if (!character) {
      alert('Please select a character first');
      return;
    }

    inventoryDatabase.saveItem(character.id, null, formData);
    
    setFormData({
      name: '',
      type: 'Misc',
      quantity: 1,
      weight: 0,
      rarity: 'Common',
      description: ''
    });
    setShowAddForm(false);
    loadInventory();
  };

  const handleQuantityChange = (item, delta) => {
    const character = database.getCurrentCharacter();
    if (!character) return;

    const newQuantity = Math.max(0, item.quantity + delta);
    
    if (newQuantity === 0) {
      if (confirm('Remove this item from inventory?')) {
        inventoryDatabase.deleteItem(character.id, item.id);
        loadInventory();
      }
    } else {
      inventoryDatabase.saveItem(character.id, item.id, {
        ...item,
        quantity: newQuantity
      });
      loadInventory();
    }
  };

  const handleDeleteItem = (itemId) => {
    if (confirm('Delete this item?')) {
      const character = database.getCurrentCharacter();
      if (character) {
        inventoryDatabase.deleteItem(character.id, itemId);
        loadInventory();
      }
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Weapon': '⚔️',
      'Armor': '🛡️',
      'Consumable': '🧪',
      'Tool': '🔧',
      'Quest Item': '📜',
      'Misc': '📦'
    };
    return icons[type] || '📦';
  };

  const getRarityClass = (rarity) => {
    return `rarity-${rarity.toLowerCase().replace(' ', '-')}`;
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.type === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalWeight: items.reduce((sum, item) => sum + (item.weight * item.quantity), 0).toFixed(1),
    uniqueItems: items.length
  };

  const categories = ['All', 'Weapon', 'Armor', 'Consumable', 'Tool', 'Quest Item', 'Misc'];

  return (
    <div className="inventory-app">
      <div className="inventory-header">
        <h1>🎒 Inventory</h1>
        <button className="btn-add-item" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✖ Cancel' : '➕ Add Item'}
        </button>
      </div>

      <div className="inventory-stats">
        <div className="stat-box">
          <div className="stat-value">{stats.uniqueItems}</div>
          <div className="stat-label">Unique Items</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.totalItems}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.totalWeight}</div>
          <div className="stat-label">Weight (lbs)</div>
        </div>
      </div>

      {showAddForm && (
        <form className="item-form" onSubmit={handleSubmit}>
          <h3>New Item</h3>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Item name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Weapon</option>
                <option>Armor</option>
                <option>Consumable</option>
                <option>Tool</option>
                <option>Quest Item</option>
                <option>Misc</option>
              </select>
            </div>

            <div className="form-group">
              <label>Rarity</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              >
                <option>Common</option>
                <option>Uncommon</option>
                <option>Rare</option>
                <option>Epic</option>
                <option>Legendary</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Item description"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit">💾 Add to Inventory</button>
        </form>
      )}

      <div className="inventory-filters">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? '📋' : getTypeIcon(cat)} {cat}
            </button>
          ))}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="item-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>📦 No items found</p>
            <p className="empty-subtitle">
              {items.length === 0 ? 'Add items to your inventory' : 'Try a different filter or search'}
            </p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className={`item-card ${getRarityClass(item.rarity)}`}>
              <div className="item-header">
                <div className="item-icon">{getTypeIcon(item.type)}</div>
                <div className="item-rarity">{item.rarity}</div>
              </div>
              
              <div className="item-name">{item.name}</div>
              
              <div className="item-type">{item.type}</div>
              
              {item.description && (
                <div className="item-description">{item.description}</div>
              )}
              
              <div className="item-details">
                <div className="item-stat">
                  <span className="stat-label">Qty:</span>
                  <span className="stat-value">{item.quantity}</span>
                </div>
                <div className="item-stat">
                  <span className="stat-label">Weight:</span>
                  <span className="stat-value">{item.weight} lbs</span>
                </div>
              </div>

              <div className="item-actions">
                <button
                  className="btn-quantity"
                  onClick={() => handleQuantityChange(item, -1)}
                  title="Decrease quantity"
                >
                  −
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button
                  className="btn-quantity"
                  onClick={() => handleQuantityChange(item, 1)}
                  title="Increase quantity"
                >
                  +
                </button>
                <button
                  className="btn-delete-item"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete item"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InventoryApp;
