import '../styles/LoadingModule.css';
import { useTranslation } from 'react-i18next';
import React from 'react';

/**
 * Props for the LoadingModule component.
 */
interface LoadingModuleProps {
  datasetBeingLoaded: string | undefined;
  progress: number; // Progress percentage
  isVisible: boolean; // Toggle visibility
  errorMessage?: string; // Error message to display on failure
}

/**
 * Displays a loading progress bar with an optional error message.
 * Used during dataset loading to indicate current progress or failure.
 *
 * @component
 * @param {LoadingModuleProps} props - Component props
 * @returns {JSX.Element | null} The rendered loading module or null if hidden
 */
const LoadingModule: React.FC<LoadingModuleProps> = ({ datasetBeingLoaded, progress, isVisible, errorMessage }) => {
  const { t } = useTranslation();
  if (!isVisible) return null;

  return (
    <div className="loading-bar-container">
      {errorMessage ? (
        <div className="error-container">
          <p className="error-text">{errorMessage}</p>
        </div>
      ) : (
        <>
          <p className="progress-text">
            {`${t('loading')} ${datasetBeingLoaded} - ${progress}%`}
          </p>
          <div className="progress-bar-background">
            <div
              className="progress-bar"
              style={{ width: `${progress}%`, transition: "width 0.3s ease-in-out" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LoadingModule;
