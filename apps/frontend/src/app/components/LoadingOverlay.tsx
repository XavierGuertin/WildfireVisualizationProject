// components/LoadingOverlay.tsx

import React from 'react';
import '../styles/LoadingOverlay.css';

interface LoadingOverlayProps {
  progress: number; // Progress percentage
  isVisible: boolean; // Toggle visibility
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="overlay" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="loading-container">
        <p className="loading-text" aria-live="polite">Loading Dataset...</p>
        <div className="progress-bar-background" aria-hidden="true">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="progress-text" aria-live="polite">{progress}%</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
