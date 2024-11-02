// components/LoadingOverlay.tsx

import '../styles/LoadingOverlay.css';
import React from 'react';

interface LoadingOverlayProps {
  progress: number; // Progress percentage
  isVisible: boolean; // Toggle visibility
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="overlay">
      <div className="loading-container">
        <p className="loading-text">Loading Dataset...</p>
        <div className="progress-bar-background">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="progress-text">{progress}%</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
