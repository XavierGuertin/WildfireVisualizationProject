// components/LoadingOverlay.tsx

import { error } from 'console';
import '../styles/LoadingModule.css';
import React from 'react';

interface LoadingModuleProps {
  datasetBeingLoaded: string | null;
  progress: number; // Progress percentage
  isVisible: boolean; // Toggle visibility
  errorMessage?: string; // Error message to display on failure
}

const LoadingModule: React.FC<LoadingModuleProps> = ({ datasetBeingLoaded, progress, isVisible, errorMessage}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-bar-container">
      {errorMessage ? (
        <div className="error-container">
          <p className="error-text">{errorMessage}</p>
        </div>
      ) : (
        <>
          <p className="progress-text">Loading {datasetBeingLoaded} - {progress}%</p>
          <div className="progress-bar-background">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LoadingModule;