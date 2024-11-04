'use client';

import React, { useState } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import Layers from './components/Layers';
import AvailableDatasets from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';

interface Dataset {
  name: string;
  date: string;
  latestAdded: string;
  latestUpdated: string;
  city: string;
  description: string;
  format: string;
  processes: string;
  datasetSource: string;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const updateWildfireLayer = (layerName: string) => {
    setLoading(true);
    setProgress(0); // Reset progress when starting a new load

    // Mock loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false); // Hide loading overlay after loading completes
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDatasetClick = (dataset: Dataset) => {
    // Mock data for demonstration. We can replace this with actual data based on the dataset name.
    setSelectedDataset(dataset);
  };

  return (
    <html lang="en">
      <body>
        <div className="layout-container relative">
          <LoadingOverlay progress={progress} isVisible={loading} />
          <header>
            <Layers updateWildfireLayer={updateWildfireLayer} />
            <AvailableDatasets onDatasetClick={handleDatasetClick} />
          </header>
          <main className="app-main">{children}</main>
          {selectedDataset && (
            <MapMetaData
              city={selectedDataset.city}
              name={selectedDataset.name}
              description={selectedDataset.description}
              format={selectedDataset.format}
              processes={selectedDataset.processes}
              datasetSource={selectedDataset.datasetSource}
            />
          )}
          <footer className="app-footer">
            <p>&copy; 2024 Wildfire Visualization Project</p>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default Layout;
