# 🎯 Hunters RPG - Character Management App

A modern, playful character management application for Hunters role-playing game. Built with React and featuring a vibrant flat UI design with thick black outlines, offset shadows, and pastel colors.

![Character Main](https://github.com/user-attachments/assets/cbaad8c9-cdee-4743-b657-83b0110f56a2)

## ✨ Features

### 🎭 Character Management
- **Create Characters**: Build your hunter with custom name, image, stats, and HP
- **Multiple Characters**: Manage unlimited characters with easy switching
- **Edit & Delete**: Update character details or remove characters with confirmation
- **Persistent Storage**: All data saved locally in your browser

### 📊 Character Display
- **Character Portrait**: Upload and display custom character images
- **Life Points Management**: 
  - Visual HP bar with color coding (green → yellow → red)
  - Quick action buttons (+1, -1, +10, -10)
  - Click-to-edit HP values
- **Character Stats**: View all 6 core stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma) with automatic modifier calculation

### 🎲 Dice Roller
- **Multiple Dice Types**: D6, D10, D20, D100
- **Roll Multiple Dice**: Configure number of dice to roll
- **Roll History**: See last 10 rolls with timestamps and totals
- **Individual Results**: View each die result separately

### 🏦 Bank System
- **Financial Tracking**: Separate bank account for each character
- **Transactions**: Make deposits and withdrawals with descriptions
- **Transaction History**: View last 50 transactions with timestamps
- **Quick Actions**: Fast buttons for common amounts (+$100, +$500, -$50, -$200)
- **Beautiful UI**: Banking app-style interface with gradient balance card

### 🎨 Playful Flat UI
- Vibrant pastel colors (pink, blue, yellow, green, purple)
- Thick 4px black borders for definition
- Hard offset shadows (6px) for depth
- Comic Sans MS font for playful feel
- Smooth animations and hover effects
- Fully responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/FrenchFive/Role_Play.git
cd Role_Play
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎮 How to Use

### Creating Your First Character

1. **Launch the App**: Open the application in your browser
2. **Click "Create New Character"**: On the welcome screen
3. **Enter Character Details**:
   - Character Name (required)
   - Upload an image (optional)
   - Set Level and HP
   - Adjust character stats (1-20)
4. **Click "Save Character"**: Your character is now created!

### Managing Characters

- **View Characters**: The character select screen shows all your characters
- **Switch Characters**: Click on any character card to select it
- **Edit Character**: Click the "Edit" button in the navigation
- **Delete Character**: Click the trash icon on a character card

### Using the Main Page

**Life Points:**
- Click on HP value to edit directly
- Use +/- buttons for quick adjustments
- HP bar changes color based on health percentage

**Dice Roller:**
1. Select dice type (D6, D10, D20, D100)
2. Enter number of dice to roll
3. Click "Roll" button
4. View results in history below

### Using the Bank

1. **Navigate to Bank**: Click the "Bank" button
2. **Choose Transaction Type**: Deposit or Withdraw
3. **Enter Amount**: Type in the amount
4. **Add Description**: Optional note for the transaction
5. **Confirm**: Click "Make Deposit" or "Make Withdrawal"
6. **Quick Actions**: Use preset amount buttons for faster transactions

## 🛠️ Technical Details

### Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Storage**: Browser LocalStorage API
- **Linting**: ESLint with React plugins

### Project Structure
```
Role_Play/
├── src/
│   ├── pages/              # Main application pages
│   │   ├── CharacterSelect.jsx
│   │   ├── CharacterCreator.jsx
│   │   ├── CharacterMain.jsx
│   │   └── BankPage.jsx
│   ├── utils/              # Utility functions
│   │   ├── database.js     # LocalStorage database
│   │   └── dice.js         # Dice rolling logic
│   ├── styles/             # Global styles
│   │   └── theme.css       # Theme variables and base styles
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

### Data Storage

All data is stored in browser LocalStorage:
- **Characters**: `hunters_characters` key
- **Current Character**: `hunters_current_character` key  
- **Bank Data**: `hunters_character_bank_{characterId}` keys

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6+ and LocalStorage support

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `src/styles/theme.css`:

```css
:root {
  --color-primary: #FFB3BA;     /* Main accent color */
  --color-secondary: #BAE1FF;   /* Secondary accent */
  --color-accent: #FFFFBA;      /* Highlight color */
  --color-success: #BAFFC9;     /* Success/positive */
  --color-warning: #FFDFBA;     /* Warning/caution */
  --color-danger: #FF9AA2;      /* Danger/negative */
}
```

### Adjusting Borders and Shadows

```css
:root {
  --outline-width: 4px;    /* Border thickness */
  --shadow-offset: 6px;    /* Shadow distance */
  --shadow-blur: 0px;      /* Shadow blur (0 for hard shadows) */
}
```

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Follow React best practices
- Use functional components with hooks
- Keep components focused and single-purpose
- Comment complex logic
- Use meaningful variable names

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available for personal and educational use.

## 🎯 Future Enhancements

Potential features for future versions:
- Export/import characters (JSON)
- Inventory management system
- Skills and abilities tracking
- Combat tracker
- Note-taking system
- Dark mode theme
- Mobile app version
- Multiplayer/sharing features
- Character templates
- Backup to cloud storage

## 👥 Credits

Created as a character management solution for Hunters RPG enthusiasts.

---

**Have fun managing your Hunters! 🎲🎯**
