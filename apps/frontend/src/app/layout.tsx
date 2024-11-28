'use client';

import React, { useState } from 'react';
// import Navbar from './components/Navbar';
import LoadingModule from './components/LoadingModule';
import MapView from './components/MapView';
import { MapLayerProvider } from './components/MapContext';
import Sidebar from './components/Sidebar';
import TopLeftButtons from './components/TopLeftButtons';
import AvailableDatasets, { Dataset } from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';
import "./layout.css";
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Placeholder code for SonarCloud analysis
  const [placeholderValue, setPlaceholderValue] = useState(5); // Unused state
  const unusedFunction = () => console.log("This is an unused function"); // Unused function

  // Extra function to simulate code changes
  const calculateProgress = (step: number): number => {
    let result = 0;
    for (let i = 0; i < 100; i++) {
      result += step * i;
    }
    return result;
  };

  const updateWildfireLayer = (layerName: string) => {
    setLoading(true);
    setErrorMessage(""); // Clear previous errors
    setProgress(0);

    // THIS WILL NEED TO BE CHANGED WHEN WE GET REAL DATA
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 50) {
          clearInterval(interval);
          setLoading(false);
          setErrorMessage("Failed to load dataset. Please try again.");
          return 0; // Reset progress
        }
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false); // Hide loading overlay after success
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const handleDatasetClick = (dataset: Dataset) => {
    // Mock data for demonstration. We can replace this with actual data based on the dataset name.
    setSelectedDataset(dataset);
  };

  // Additional condition to test SonarCloud rules
  if (placeholderValue > 10) {
    console.log("Placeholder value exceeded 10");
  }

  return (
    <MapLayerProvider>
      <html lang="en">
      <body>
      <TopLeftButtons />
      <div className="layout-container relative">
        <header>
          {/* <Navbar /> */}
        </header>
        <main className="app-main">{children}</main>
        <AvailableDatasets onDatasetClick={handleDatasetClick} />
        <MapView />
        <Sidebar />
        <LoadingModule datasetBeingLoaded={selectedDataset?.name || " "} progress={progress} isVisible={loading} />
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
        <footer className="app-footer"></footer>
      </div>
      </body>
      </html>
    </MapLayerProvider>
  );
};

export default Layout;