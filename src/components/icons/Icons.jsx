/**
 * Modern SVG Icon Library
 * Clean, crisp line art icons with thick strokes
 * Designed for Shopify-style bold UI
 */

// Base icon wrapper for consistent sizing and styling
const IconWrapper = ({ children, size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon ${className}`}
    {...props}
  >
    {children}
  </svg>
);

// Character/User icon
export const UserIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
  </IconWrapper>
);

// Friends/Group icon
export const UsersIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="9" cy="7" r="3.5" />
    <path d="M2 20v-1.5a3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5V20" />
    <circle cx="17" cy="7" r="2.5" />
    <path d="M22 20v-1a2.5 2.5 0 0 0-2.5-2.5h-1" />
  </IconWrapper>
);

// Codex/Book icon
export const BookIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </IconWrapper>
);

// ID Card icon
export const IdCardIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="8" cy="11" r="2.5" />
    <path d="M5 17v-.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
    <line x1="14" y1="9" x2="19" y2="9" />
    <line x1="14" y1="13" x2="18" y2="13" />
  </IconWrapper>
);

// Contacts/Phone icon
export const PhoneIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </IconWrapper>
);

// Stats/Chart icon
export const ChartIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="6" width="4" height="15" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </IconWrapper>
);

// Quest/Checklist icon
export const ChecklistIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 9l2 2 4-4" />
    <line x1="7" y1="15" x2="17" y2="15" />
    <line x1="7" y1="19" x2="13" y2="19" />
  </IconWrapper>
);

// Map icon
export const MapIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </IconWrapper>
);

// Inventory/Backpack icon
export const BackpackIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M6 8V6a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <rect x="4" y="8" width="16" height="14" rx="2" />
    <path d="M8 8v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8" />
    <line x1="10" y1="11" x2="14" y2="11" />
  </IconWrapper>
);

// Combat/Swords icon
export const SwordsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M14.5 3l6 6-10 10-4-4L16.5 5" />
    <path d="M4 20l4-4" />
    <path d="M19.5 3l1 1" />
    <path d="M9.5 21l-6-6 10-10 4 4L7.5 19" />
    <path d="M20 20l-4-4" />
    <path d="M4.5 3l-1 1" />
  </IconWrapper>
);

// Pets/Paw icon
export const PawIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="15" r="3.5" />
    <circle cx="7" cy="10" r="2" />
    <circle cx="17" cy="10" r="2" />
    <circle cx="5" cy="15" r="1.5" />
    <circle cx="19" cy="15" r="1.5" />
  </IconWrapper>
);

// Bank/Wallet icon
export const WalletIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="16" cy="14" r="2" />
  </IconWrapper>
);

// Notes/Edit icon
export const NotesIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="14" y2="17" />
  </IconWrapper>
);

// Settings/Cog icon
export const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

// Home icon
export const HomeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

// WiFi Connected icon
export const WifiIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1.5" fill="currentColor" />
  </IconWrapper>
);

// WiFi Disconnected icon
export const WifiOffIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1.5" fill="currentColor" />
  </IconWrapper>
);

// Battery Full icon
export const BatteryFullIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 11v2" strokeWidth="3" />
    <rect x="5" y="10" width="12" height="4" rx="1" fill="currentColor" stroke="none" />
  </IconWrapper>
);

// Battery Low icon
export const BatteryLowIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 11v2" strokeWidth="3" />
    <rect x="5" y="10" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
  </IconWrapper>
);

// Battery Medium icon
export const BatteryMediumIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 11v2" strokeWidth="3" />
    <rect x="5" y="10" width="8" height="4" rx="1" fill="currentColor" stroke="none" />
  </IconWrapper>
);

// Crown icon (for DM)
export const CrownIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M2 17l3-8 5 5 2-10 2 10 5-5 3 8z" fill="currentColor" />
    <rect x="2" y="17" width="20" height="3" rx="1" />
  </IconWrapper>
);

// Plus icon
export const PlusIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

// Minus icon
export const MinusIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

// X/Close icon
export const XIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

// Trash icon
export const TrashIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
);

// Send icon
export const SendIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </IconWrapper>
);

// Search icon
export const SearchIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconWrapper>
);

// Check icon
export const CheckIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

// Arrow Left icon
export const ArrowLeftIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </IconWrapper>
);

// Arrow Right icon
export const ArrowRightIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </IconWrapper>
);

// Dice icon (D20)
export const DiceIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <polyline points="2 8.5 12 12 22 8.5" />
    <line x1="2" y1="15.5" x2="12" y2="12" />
    <line x1="22" y1="15.5" x2="12" y2="12" />
  </IconWrapper>
);

// Message icon
export const MessageIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="12" y2="13" />
  </IconWrapper>
);

// Edit icon
export const EditIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </IconWrapper>
);

// Save icon
export const SaveIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </IconWrapper>
);

// Star icon
export const StarIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />
  </IconWrapper>
);

// Arrow Up icon
export const ArrowUpIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </IconWrapper>
);

// Shield icon (for combat)
export const ShieldIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </IconWrapper>
);

// Heart icon (for health)
export const HeartIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" />
  </IconWrapper>
);

// Clock icon (for time tracking)
export const ClockIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

// Trophy icon (for achievements)
export const TrophyIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V8a2 2 0 1 1 4 0v14" />
    <path d="M8 14h8" />
    <path d="M10 5h4" />
  </IconWrapper>
);

// Zap icon (for energy/power)
export const ZapIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
  </IconWrapper>
);

// Activity/Pulse icon (for conditions)
export const ActivityIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </IconWrapper>
);

// Bandage/FirstAid icon (for injuries)
export const BandageIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v2H7a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h3a5 5 0 0 0 5-5v-2h3a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </IconWrapper>
);

// Anchor icon (for touchstones)
export const AnchorIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </IconWrapper>
);

// Sunrise icon (for redemption)
export const SunriseIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
    <line x1="1" y1="18" x2="3" y2="18" />
    <line x1="21" y1="18" x2="23" y2="18" />
    <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
    <line x1="23" y1="22" x2="1" y2="22" />
    <polyline points="8 6 12 2 16 6" />
  </IconWrapper>
);

// Scroll icon (for tenets/chronicle)
export const ScrollIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2c0 1.1-.9 2-2 2Z" />
    <path d="M10 13V4.5A2.5 2.5 0 0 0 7.5 2H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h2" />
    <path d="M12 4h10a2 2 0 0 1 2 2v7H12V4Z" />
    <line x1="6" y1="7" x2="6" y2="7.01" />
    <line x1="14" y1="8" x2="20" y2="8" />
  </IconWrapper>
);

// Globe icon (for campaign)
export const GlobeIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </IconWrapper>
);

// Target icon (for objectives)
export const TargetIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </IconWrapper>
);

// Flag icon (for milestones)
export const FlagIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </IconWrapper>
);

// Calendar icon (for sessions)
export const CalendarIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

// Alert/Warning icon
export const AlertIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

// Lightning icon (for action economy)
export const LightningIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
  </IconWrapper>
);

// Timer icon (for reaction)
export const TimerIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M5 3L2 6" />
    <path d="M22 6l-3-3" />
    <path d="M6 19l-2 2" />
    <path d="M18 19l2 2" />
  </IconWrapper>
);

// Eye icon (for visibility)
export const EyeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </IconWrapper>
);

// Copy icon
export const CopyIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </IconWrapper>
);

// Info icon
export const InfoIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
);

// Chevron Down icon
export const ChevronDownIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
);

// Chevron Up icon
export const ChevronUpIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="18 15 12 9 6 15" />
  </IconWrapper>
);
