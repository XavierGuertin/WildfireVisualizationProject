'use client';

import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import AvailableDatasets, {
  DatasetMetadata,
} from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';
import { I18nextProvider } from 'react-i18next';
import i18n from './resources/i18n';
import './layout.css';
import { MapProvider } from './context/MapContext';
import { fetchMetaData } from './services/api';
import { ToastContainer } from 'react-toastify';
import { StorageServer } from './model/storage';

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedDataset, setSelectedDataset] =
    useState<DatasetMetadata | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add state for refresh key
  const [isMetadataVisible, setMetadataVisible] = useState(false); // Add state for metadata visibility
  const [currentBbox, setCurrentBbox] = useState<
    [number, number, number, number] | undefined
  >(undefined);
  const WORLD_BBOX: [number, number, number, number] = [-180, -90, 180, 90];

  // Handle dataset selection (no loading bar here)
  const handleDatasetClick = (dataset: DatasetMetadata) => {
    // const selectedDatasetId = localStorage.getItem('selectedDatasetId');
    const selectedDatasetId = StorageServer.getSelectedDatasetId();
    if (selectedDatasetId !== dataset.id) {
      setSelectedDataset(dataset); // Just update the selected dataset
      setMetadataVisible(true); // Show metadata container
    } else {
      setMetadataVisible(false);
    }
  };

  // Handles loading the metadata if dataset is already selected on load
  useEffect(() => {
    const onLoadDataset = async () => {
      // const selectedDatasetId = localStorage.getItem('selectedDatasetId');
      const selectedDatasetId = StorageServer.getSelectedDatasetId();
      if (selectedDatasetId !== null && selectedDatasetId !== '') {
        const dataset = await fetchMetaData(selectedDatasetId);
        setSelectedDataset(dataset);
        setMetadataVisible(true);
      }
    };

    onLoadDataset();
  }, []);

  const refreshDatasets = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Increment refresh key to trigger re-render
  };

  return (
    <I18nextProvider i18n={i18n}>
      <MapProvider>
        <html lang="en">
          <body>
            <ToastContainer />
            <SettingsPanel
              refreshDatasets={refreshDatasets}
              setMetadataVisible={setMetadataVisible}
            />
            <div className="layout-container relative">
              <main className="app-main">{children}</main>
              <AvailableDatasets
                onDatasetClick={handleDatasetClick}
                refreshKey={refreshKey}
                currentBbox={currentBbox ?? undefined}
                onResetBbox={() => setCurrentBbox(WORLD_BBOX)}
              />
              <MapView
                onBboxChange={(bbox) => {
                  if (bbox && bbox.length === 4) {
                    setCurrentBbox(bbox as [number, number, number, number]);
                  }
                }}
              />
              <Sidebar />
              {selectedDataset && (
                <MapMetaData
                  id={selectedDataset.id}
                  name={selectedDataset.name}
                  description={selectedDataset.description}
                  format={selectedDataset.format}
                  processes={selectedDataset.processes}
                  datasetSource={selectedDataset.datasetSource}
                  onClose={() => setMetadataVisible(false)}
                  visible={isMetadataVisible} // Pass visibility state
                  refreshDatasets={refreshDatasets}
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

export default ClientLayout;
