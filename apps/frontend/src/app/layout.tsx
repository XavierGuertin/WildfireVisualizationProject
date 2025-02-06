'use client';

import React, { useState } from 'react';
import MapView from './components/MapView';
import { MapProvider } from './components/MapContext';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import AvailableDatasets, { DatasetMetadata } from './components/AvailableDatasets';
import MapMetaData from './components/MapMetaData';
import { I18nextProvider } from 'react-i18next';
import i18n from './resources/i18n';
import './layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetMetadata | null>(null);

  // Handle dataset selection (no loading bar here)
  const handleDatasetClick = (dataset: DatasetMetadata) => {
    setSelectedDataset(dataset); // Just update the selected dataset
  };

  return (
    <I18nextProvider i18n={i18n}>
      <MapProvider>
        <html lang="en">
          <body>
            <SettingsPanel />
            <div className="layout-container relative">
              
              <main className="app-main">{children}</main>
              <AvailableDatasets onDatasetClick={handleDatasetClick} />
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
