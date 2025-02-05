"use client";

import React, { useState } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import AvailableDatasets, { DatasetMetadata } from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';
import { I18nextProvider } from 'react-i18next';
import i18n from './resources/i18n';
import './layout.css';
import LoadingModule from './components/LoadingModule';
import { MapProvider } from './components/MapContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<DatasetMetadata | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add state for refresh key

  // Function to show loading bar with progress
  const showLoadingBar = () => {
    setProgress(0); // Reset progress
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressInterval); // Stop auto-progress at 100%
          return 100;
        }
        return prevProgress + 10; // Increment progress
      });
    }, 300); // Update every 300ms
  };

  // Handle dataset selection (no loading bar here)
  const handleDatasetClick = (dataset: DatasetMetadata) => {
    setSelectedDataset(dataset); // Just update the selected dataset
  };

  // Handle dataset loading from MapMetaData
  const handleLoadDataset = async () => {
    if (!selectedDataset) return;

    try {
      setLoading(true); // Show loading overlay
      showLoadingBar(); // Start progress simulation

      // Simulate a delay for loading (mocked)
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate a 4-second loading delay
      console.log('Dataset loaded successfully (mock)');
    } catch (error) {
      console.error('Error loading dataset:', error);
    } finally {
      setLoading(false); // Ensure loading overlay is hidden
    }
  };

  const refreshDatasets = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Increment refresh key to trigger re-render
  };

  return (
    <I18nextProvider i18n={i18n}>
      <MapProvider>
        <html lang="en">
        <body>
        <SettingsPanel refreshDatasets={refreshDatasets} />
        <div className="layout-container relative">
          <LoadingModule
            progress={progress}
            isVisible={loading}
            datasetBeingLoaded={selectedDataset?.name}
          />
          <main className="app-main">{children}</main>
          <AvailableDatasets onDatasetClick={handleDatasetClick} refreshKey={refreshKey} />
          <MapView />
          <Sidebar />
          {selectedDataset && (
            <MapMetaData
              id={selectedDataset.id}
              name={selectedDataset.name}
              description={selectedDataset.description}
              format={selectedDataset.format}
              processes={selectedDataset.processes}
              datasetSource={selectedDataset.datasetSource}
              onLoadDataset={handleLoadDataset}
            />
          )}
          <footer className="app-footer"></footer>
        </div>
        </body>
        </html>
      </MapProvider>
    </I18nextProvider>
  );
};

export default Layout;