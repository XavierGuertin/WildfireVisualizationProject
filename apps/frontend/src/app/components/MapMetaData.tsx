import React, { useState } from 'react';
import '../styles/MapMetaData.css';
import { IoInformationCircle } from 'react-icons/io5';
import { RiCollapseDiagonalFill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io'; // Added close icon
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
  onClose, 
})  => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { mapRef, setDataItems } = useMapLayerContext();

  // Renamed to handleLoadDataset to avoid confusion with the prop name
  const handleLoadDataset = async () => {
    try {
      setLoading(true);
      setProgress(0);
  
      await insertDatalayerView(id);
      const map = mapRef.current as Map;
      changeLayer(map);
  
      // Fetch items with progress updates
      const items = await fetchItems(id, (progress) => {
        setProgress(progress); // Update progress in real time
      });
  
      setDataItems(items);
      setProgress(100); // Ensure it hits 100% when complete
      setTimeout(() => setLoading(false), 1000); // Hide loading after short delay
    } catch (error) {
      console.error("Error loading dataset:", error);
      setLoading(false);
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
      <div className="header" data-testid="name-div">
        <div className="header-left" onClick={toggleCollapse}>
          {name || t('unknown_name')}
          <RiCollapseDiagonalFill size={20} />
        </div>
        <div className="header-right">
          <IoMdClose 
            size={20} 
            onClick={onClose} 
            data-testid="close-button"
            className="close-button"
          />
        </div>
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
          onClick={handleLoadDataset}
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