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
import debounce from 'lodash/debounce';

export interface DatasetEntry {
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
  refreshKey: number;
  currentBbox?: [number, number, number, number]; // [west, south, east, north]
}

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({
  onDatasetClick,
  refreshKey,
  currentBbox = [],
}) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [datasets, setDatasets] = useState<DatasetEntry[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDatasets = debounce(async () => {
    setIsLoading(true);
    try {
      let response;
      const params = {
        bbox: isToggled && currentBbox ? currentBbox as [number, number, number, number] : undefined
      };
  
      if (activeFilter === 'Name') {
        response = await fetchCollectionsFromEndpointByName(params.bbox);
      } else if (activeFilter === 'Date') {
        response = await fetchCollectionsFromEndpointByDate(params.bbox);
      } else {
        response = await returnListOfCollectionsFromEndpoint(params.bbox); // Fetch all datasets if bbox is undefined
      }
  
      if (!Array.isArray(response)) {
        console.error("Invalid response format:", response);
        setFetchError(response.error || "Failed to load datasets.");
        setDatasets([]);
        return;
      }
  
      setDatasets(response);
      setFetchError(null);
    } catch (error) {
      console.log('Error fetching datasets:', error);
      setDatasets([]);
      setFetchError('Failed to load datasets.');
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    // Always fetch when refreshKey or activeFilter changes
    fetchDatasets();
    return () => fetchDatasets.cancel();
  }, [refreshKey, activeFilter]);
  
  useEffect(() => {
    // Only fetch when isToggled is true and bbox changes
    if (isToggled) {
      fetchDatasets();
    }
  }, [isToggled, currentBbox.join(',')]); // Ensures fixed dependency size
  
  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
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
            <h2 className="sidebar-title" data-testid="sidebar-title">{t('available_datasets')}</h2>
            <div className="toggle-control-group">
              <label
                className="toggle-label"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                aria-label={t('toggle_datasets')}
              >
                <span className="toggle-status-text" data-testid="toggle-status-text">
                  {currentBbox 
                    ? t(isToggled ? 'filtering_by_map_view' : 'showing_all_datasets')
                    : t('map_required')
                  }
                </span>
                <input
                  type="checkbox"
                  checked={isToggled}
                  onChange={handleToggle}
                  disabled={!currentBbox}
                  style={{ display: 'none' }}
                  data-testid="toggle-checkbox"
                  aria-describedby="toggle-status"
                />
                <div
                  className={`toggle-button ${isToggled ? 'toggled' : ''}`}
                  data-testid="toggle-button"
                  role="switch"
                  aria-checked={isToggled}
                >
                  {!currentBbox && (
                    <span className="toggle-warning">{t('Load map first')}</span>
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="filter-container" data-testid="filter-container">
            <div className="filter-icon" data-testid="filter-icon">
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

          {fetchError && (
            <div className="error-message" data-testid="error-message">
              {fetchError}
            </div>
          )}

          <div className="buttons-container" data-testid="buttons-container">
            {isLoading ? (
              <p className="loading-message" data-testid="loading-message">
                {t('loading_datasets')}
              </p>
            ) : datasets.length > 0 ? (
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
              <div className="no-datasets-container" data-testid="no-datasets-container">
                <p className="no-datasets-message" data-testid="no-datasets-message">
                  {t('no_datasets_available')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableDatasets;