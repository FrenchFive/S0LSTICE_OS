import { useState, useEffect } from 'react';
import './SplashScreen.css';

function SplashScreen({ onComplete, minimumDuration = 2000 }) {
  const [phase, setPhase] = useState('logo'); // logo, text, fade
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timers = [];

    // Show text after logo animation
    timers.push(setTimeout(() => {
      setPhase('text');
    }, 800));

    // Start fade out
    timers.push(setTimeout(() => {
      setIsExiting(true);
    }, minimumDuration - 500));

    // Complete
    timers.push(setTimeout(() => {
      onComplete();
    }, minimumDuration));

    return () => timers.forEach(clearTimeout);
  }, [onComplete, minimumDuration]);

  return (
    <div className={`splash-screen ${isExiting ? 'exiting' : ''}`}>
      <div className="splash-content">
        {/* Logo */}
        <div className={`splash-logo ${phase !== 'logo' ? 'shrink' : ''}`}>
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Stylized S0LSTICE sun/eclipse logo */}
              <circle cx="50" cy="50" r="35" fill="currentColor" className="logo-circle" />
              <circle cx="50" cy="50" r="25" fill="var(--color-bg)" className="logo-inner" />
              <path 
                d="M50 10 L53 20 L50 18 L47 20 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
              <path 
                d="M50 90 L53 80 L50 82 L47 80 Z" 
                fill="currentColor" 
                className="logo-ray"
                style={{ transform: 'rotate(180deg)', transformOrigin: '50px 50px' }}
              />
              <path 
                d="M10 50 L20 53 L18 50 L20 47 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
              <path 
                d="M90 50 L80 53 L82 50 L80 47 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
              {/* Diagonal rays */}
              <path 
                d="M21.7 21.7 L28 31 L26 28 L31 28 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
              <path 
                d="M78.3 78.3 L72 69 L74 72 L69 72 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
              <path 
                d="M78.3 21.7 L69 28 L72 26 L72 31 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
              <path 
                d="M21.7 78.3 L31 72 L28 74 L28 69 Z" 
                fill="currentColor" 
                className="logo-ray"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className={`splash-title ${phase === 'text' ? 'visible' : ''}`}>
          <h1>S0LSTICE</h1>
          <p className="splash-subtitle">_OS</p>
        </div>

        {/* Tagline */}
        <p className={`splash-tagline ${phase === 'text' ? 'visible' : ''}`}>
          Your Hunter&apos;s Digital Companion
        </p>
      </div>

      {/* Loading indicator */}
      <div className="splash-loader">
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
