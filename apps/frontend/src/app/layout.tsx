"use client";

import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import AvailableDatasets, { DatasetMetadata } from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';
import { I18nextProvider } from 'react-i18next';
import i18n from './resources/i18n';
import './layout.css';
import LoadingModule from './components/LoadingModule';
import { MapProvider } from './context/MapContext';
import { fetchMetaData } from './services/api';
import { ToastContainer } from 'react-toastify';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<DatasetMetadata | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add state for refresh key
  const [isMetadataVisible, setMetadataVisible] = useState(false); // Add state for metadata visibility
  const [currentBbox, setCurrentBbox] = useState<[number, number, number, number] | undefined>(undefined);
  const [loadedDatasetName, setLoadedDatasetName] = useState<string | null>(null);

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
    const selectedDatasetId = localStorage.getItem('selectedDatasetId')
    if(selectedDatasetId !== dataset.id){
      setSelectedDataset(dataset); // Just update the selected dataset
      setMetadataVisible(true); // Show metadata container
    } else {
      setMetadataVisible(false)
    }
  };

  // Handles loading the metadata if dataset is already selected on load
  useEffect(() => {
    const onLoadDataset = async () => {
      const selectedDatasetId = localStorage.getItem('selectedDatasetId')
      if(selectedDatasetId !== null && selectedDatasetId !== ''){
        const dataset = await fetchMetaData(selectedDatasetId)
        setSelectedDataset(dataset)
        setMetadataVisible(true)
      }
    }

    onLoadDataset();
  }, [])

  // Handle dataset loading from MapMetaData
  const handleLoadDataset = async () => {
    if (!selectedDataset) return;

    try {
      setLoading(true); // Show loading overlay
      setLoadedDatasetName(null); // Reset loaded dataset name
      showLoadingBar(); // Start progress simulation

      // Simulate a delay for loading (mocked)
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate a 4-second loading delay

      setLoadedDatasetName(selectedDataset.id); // set the successfully loaded dataset name
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
        <ToastContainer/>
        <SettingsPanel refreshDatasets={refreshDatasets} setMetadataVisible={setMetadataVisible} />
        <div className="layout-container relative">
          <LoadingModule
            progress={progress}
            isVisible={loading}
            datasetBeingLoaded={selectedDataset?.id}
          />
          <main className="app-main">{children}</main>
          <AvailableDatasets 
              onDatasetClick={handleDatasetClick}
              refreshKey={refreshKey} 
              currentBbox={currentBbox ?? undefined}
              loadedDatasetName={loadedDatasetName} />
          <MapView onBboxChange={(bbox) => {
              if (bbox && bbox.length === 4) {
                setCurrentBbox(bbox as [number, number, number, number]);
              }
            }} />
          <Sidebar />
          {selectedDataset && (
            <MapMetaData
              id={selectedDataset.id}
              name={selectedDataset.name}
              description={selectedDataset.description}
              format={selectedDataset.format}
              processes={selectedDataset.processes}
              datasetSource={selectedDataset.datasetSource}
              onDatasetLoaded={handleLoadDataset}
              onClose={() => setMetadataVisible(false)}
              visible={isMetadataVisible} // Pass visibility state
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
