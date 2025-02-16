import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/AvailableDatasets.css';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaDatabase,
  FaFilter,
} from 'react-icons/fa';
import { 
  fetchCollectionsFromEndpointByName, 
  fetchCollectionsFromEndpointByDate, 
  fetchMetaData, 
  returnListOfCollectionsFromEndpoint,
} from '../services/api';

interface DatasetEntry {
  key: number;
  id: string;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  date: string;
  enddate?: string;
  datasetSource: string;
  description: string;
  format: string;
  latestAdded?: string;
  latestUpdated?: string;
  processes?: string;
}

interface AvailableDatasetsProps {
  onDatasetClick: (dataset: DatasetMetadata) => void;
  refreshKey: number; // Add refresh key prop
}

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({
  onDatasetClick,
  refreshKey,
}) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [datasets, setDatasets] = useState<DatasetEntry[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const datasetList: string[] = [];
        const response: any = await returnListOfCollectionsFromEndpoint();

        setDatasets(response);
        setFetchError(null);
      } catch (error) {
        console.log('Error fetching datasets:', error);
        setDatasets([]);
        setFetchError('Failed to load datasets.');
      }
    };

    fetchDatasets();
  }, [refreshKey]); // Re-fetch datasets when refresh key changes

  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
    
    try {
      let response;

      if (filter === 'Name') {
        response = await fetchCollectionsFromEndpointByName();
      } else {
        response = await fetchCollectionsFromEndpointByDate();
      }

      if (!Array.isArray(response)) {
        setFetchError(response.error || 'Unknown error occurred');
        setDatasets([]); 
        return;
      }

      setDatasets(response);
      setFetchError(null);
    } catch (error) {
      console.log(`Error fetching datasets for filter ${filter}:`, error);
      setDatasets([]);
      setFetchError('Failed to load datasets.');
    }
  };

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const handleToggle = () => setIsToggled((prev) => !prev);

  const handleDatasetClick = async (id: string) => {
    setSelectedDataset(id); // Update selected dataset
    const dataset = await fetchMetaData(id);
    onDatasetClick(dataset); // Pass dataset to parent component
  };

  return (
    <div
      className={`datasets-container ${isCollapsed ? 'collapsed' : ''}`}
      data-testid="datasets-container"
    >
      <button
        className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleCollapse}
        data-testid="collapse-button"
      >
        {isCollapsed ? (
          <FaChevronCircleLeft size={24} />
        ) : (
          <FaChevronCircleRight size={24} />
        )}
      </button>
      {isCollapsed ? (
        <FaDatabase fill="white" size={24} />
      ) : (
        <>
          <div className="top-bar" data-testid="top-bar">
            <h2 className="sidebar-title">{t('available_datasets')}</h2>
            <label
              style={{ display: 'flex', alignItems: 'center' }}
              aria-label={t('toggle_datasets')}
            >
              <input
                type="checkbox"
                checked={isToggled}
                onChange={handleToggle}
                style={{ display: 'none' }}
                data-testid="toggle-checkbox"
              />
              <div
                className={`toggle-button ${isToggled ? 'toggled' : ''}`}
                data-testid="toggle-button"
              ></div>
            </label>
          </div>
          <div className="filter-container" data-testid="filter-container">
            <div className="filter-icon">
              <FaFilter size={24} />
            </div>
            {['Name', 'Date'].map(
              (filter) => (
                <button
                  key={filter}
                  className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filter)}
                  data-testid={`filter-button-${filter}`}
                >
                  {t(filter.toLowerCase().replace(/ /g, '_'))}
                </button>
              ),
            )}
          </div>
          <div className="buttons-container" data-testid="buttons-container">
            {datasets.length > 0 ? (
              datasets.map((dataset) => (
                <button
                  key={dataset.id}
                  className={`dataset-button ${selectedDataset === dataset.id ? 'selected' : ''}`}
                  onClick={() => handleDatasetClick(dataset.id)}
                  data-testid={`dataset-button-${dataset.id}`}
                >
                  {dataset.id}
                </button>
              ))
            ) : (
              <p className="no-datasets-message" data-testid="no-datasets-message">
                {t('no_datasets_available')}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableDatasets;