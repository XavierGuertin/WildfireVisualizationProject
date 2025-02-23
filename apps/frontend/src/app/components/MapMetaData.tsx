import React, { useState } from 'react';
import '../styles/MapMetaData.css';
import { IoInformationCircle } from 'react-icons/io5';
import { RiCollapseDiagonalFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { fetchItems, insertDatalayerView } from '../services/api';
import { changeLayer } from './MapView';
import { useMapLayerContext } from './MapContext';
import LoadingModule from './LoadingModule';
import { Map } from 'ol';

interface MapMetaDataProps {
  id?: string;
  name?: string;
  description?: string;
  format?: string;
  processes?: string;
  datasetSource?: string;
  onLoadDataset: () => Promise<void>;
  onClose: () => void;
  visible: boolean;
}

const MapMetaData: React.FC<MapMetaDataProps> = ({
  id = '',
  name = '',
  description = '',
  format = '',
  processes = '',
  datasetSource = '',
  visible,
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const { mapRef, setDataItems, dataItems } = useMapLayerContext();

  const onLoadDataset = async () => {
    try {
      setLoading(true); // Show loading overlay
      showLoadingBar(); // Start progress simulation
      await insertDatalayerView(id);
      const map = mapRef.current as Map;
      changeLayer(map);

      //Adding the items retrieved from the collection to the context (this is the endpoint that the loading bar will be waiting for)
      const items = await fetchItems(id);
      setDataItems(items);

      // Simulate a delay for loading (mocked)
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate a 4-second loading delay
      console.log('Dataset loaded successfully (mock)');
    } catch (error) {
      console.error('Error loading dataset:', error);
    } finally {
      setLoading(false); // Ensure loading overlay is hidden
    }
  };

  if (!visible) return null; // Return null if not visible

  const CollapsedMetaData = (
    <div
      data-testid="collapsedMetaData"
      className="metadata-container-collapsed"
      onClick={toggleCollapse}
    >
      <IoInformationCircle size={36} fill="white" />
      <span className="collapsed-name">{t('metadata')}</span>
    </div>
  );

  const NonCollapsedMetaData = (
    <div className="metadata-container">
      <div className="header" onClick={toggleCollapse} data-testid="name-div">
        {name || t('unknown_name')}
        <RiCollapseDiagonalFill size={20} />
      </div>
      <div className="content">
        {[
          {
            label: t('description'),
            value: description,
            testId: 'dataset-description',
          },
          { label: t('format'), value: format, testId: 'dataset-format' },
          {
            label: t('processes'),
            value: processes,
            testId: 'dataset-processes',
          },
          {
            label: t('dataset_source'),
            value: datasetSource,
            testId: 'dataset-datasource',
          },
        ].map(({ label, value, testId }) => (
          <div className="data-row" key={label}>
            <div className="label">{label}:</div>
            <div className="value" data-testid={testId}>
              {value || t('n_a')}
            </div>
          </div>
        ))}
        <button
          className="load-dataset-button"
          onClick={onLoadDataset}
          data-testid="load-dataset-button"
        >
          <LoadingModule
            progress={progress}
            isVisible={loading}
            datasetBeingLoaded={name}
            data-testid="loading-module"
          />
          {t('load_dataset')}
        </button>
      </div>
    </div>
  );

  return <>{isCollapsed ? CollapsedMetaData : NonCollapsedMetaData}</>;
};

export default MapMetaData;
