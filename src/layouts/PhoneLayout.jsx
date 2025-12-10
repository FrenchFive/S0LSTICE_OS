import { useState, useEffect } from 'react';
import { wsClient } from '../utils/websocket';
import { database } from '../utils/database';
import './PhoneLayout.css';

function PhoneLayout({ children, currentApp, onAppChange }) {
  const [battery, setBattery] = useState(100);
  const [isConnected, setIsConnected] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showNotification, _setShowNotification] = useState(false);
  const [notification, _setNotification] = useState('');

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    // Connection status
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsConnected(wsClient.isConnected());

    // Update battery (HP) based on current character
    const updateBattery = () => {
      const char = database.getCurrentCharacter();
      if (char && char.maxHp > 0) {
        const percentage = (char.hp / char.maxHp) * 100;
        setBattery(Math.round(percentage));
      }
    };
    updateBattery();
    const batteryInterval = setInterval(updateBattery, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(batteryInterval);
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
    };
  }, []);

  // Notification system for future use
  // const showTempNotification = (message) => {
  //   setNotification(message);
  //   setShowNotification(true);
  //   setTimeout(() => setShowNotification(false), 3000);
  // };

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getBatteryIcon = () => {
    if (battery > 75) return '🔋';
    if (battery > 50) return '🔋';
    if (battery > 25) return '🪫';
    return '🪫';
  };

  const getBatteryColor = () => {
    if (battery > 50) return '#BAFFC9';
    if (battery > 25) return '#FFDFBA';
    return '#FF9AA2';
  };

  return (
    <div className="phone-layout">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-time">{formatTime()}</span>
        </div>
        <div className="status-right">
          <div className="status-wifi">
            {isConnected ? (
              <span className="wifi-connected">📶</span>
            ) : (
              <span className="wifi-disconnected">📵</span>
            )}
          </div>
          <div className="status-battery" style={{ color: getBatteryColor() }}>
            <span>{getBatteryIcon()}</span>
            <span className="battery-percent">{battery}%</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      {/* App Content */}
      <div className="phone-content">
        {children}
      </div>

      {/* Home Button (if not on home screen) */}
      {currentApp !== 'home' && (
        <div className="phone-home-bar">
          <button 
            className="home-button"
            onClick={() => onAppChange('home')}
            title="Home"
          >
            ⬤
          </button>
        </div>
      )}
    </div>
  );
}

export default PhoneLayout;
