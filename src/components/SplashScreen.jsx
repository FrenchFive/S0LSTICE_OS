import { useState, useEffect } from 'react';
import './SplashScreen.css';

function SplashScreen({ onComplete, minimumDuration = 2000 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timers = [];

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
        {/* Title - Main branding */}
        <div className="splash-title visible">
          <h1>
            S<span className="zero-slash">0</span>LSTICE
          </h1>
          <p className="splash-subtitle">_OS</p>
        </div>

        {/* Tagline */}
        <p className="splash-tagline visible">
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
