'use client';

import React, { useState } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import MapView from './components/MapView';
import { MapLayerProvider } from './components/MapContext';
import Sidebar from './components/Sidebar';
import TopLeftButtons from './components/TopLeftButtons';
import AvailableDatasets, { Dataset } from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';
import './layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

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
  const handleDatasetClick = (dataset: Dataset) => {
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

  return (
    <MapLayerProvider>
      <html lang="en">
        <body>
          <TopLeftButtons />
          <div className="layout-container relative">
            <LoadingOverlay progress={progress} isVisible={loading} />
            <header></header>
            <main className="app-main">{children}</main>
            <AvailableDatasets onDatasetClick={handleDatasetClick} />
            <MapView />
            <Sidebar />
            {/* Map Metadata */}
            {selectedDataset && (
              <MapMetaData
                city={selectedDataset.city}
                name={selectedDataset.name}
                description={selectedDataset.description}
                format={selectedDataset.format}
                processes={selectedDataset.processes}
                datasetSource={selectedDataset.datasetSource}
                onLoadDataset={handleLoadDataset} // Click on "Load Dataset" Button in MapMetaData
              />
            )}
            <footer className="app-footer"></footer>
          </div>
        </body>
      </html>
    </MapLayerProvider>
  );
};

export default Layout;
