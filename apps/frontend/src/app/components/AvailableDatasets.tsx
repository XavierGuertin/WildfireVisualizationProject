import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/AvailableDatasets.css';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaDatabase,
  FaFilter,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
  FaTimes,
} from 'react-icons/fa';
import {
  fetchCollectionsFromEndpointByName,
  fetchCollectionsFromEndpointByDate,
  fetchMetaData,
  returnListOfCollectionsFromEndpoint,
  insertDatalayerView,
  resetDatalayerView,
} from '../services/api';
import { useMapLayerContext } from '../context/MapContext';
import { changeLayer } from './MapView';
import { Map } from 'ol';
import { getConfig } from '../services/configApi';
import { useQuery } from '@tanstack/react-query';

export interface DatasetEntry {
  key: number;
  id: string;
  title: string;
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
  currentBbox?: [number, number, number, number];
  onResetBbox: () => void;
}

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({
                                                               onDatasetClick,
                                                               refreshKey,
                                                               currentBbox = [],
                                                               onResetBbox,
                                                             }) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { mapRef, loadedDataset, setLoadedDataset } = useMapLayerContext();

  // Query key factory
  const getQueryKey = () => [
    'datasets',
    activeFilter,
    sortDirection,
    isToggled ? currentBbox.join(',') : 'no-bbox',
    refreshKey, // Include refreshKey to force refetch when it changes
  ];

  // Fetch function for react-query
  const fetchDatasetsQuery = async () => {
    const params = {
      bbox: isToggled && currentBbox ? currentBbox as [number, number, number, number] : undefined,
      sortDirection,
    };

    let response;
    if (activeFilter === 'Name') {
      response = await fetchCollectionsFromEndpointByName(params.bbox, params.sortDirection);
    } else if (activeFilter === 'Date') {
      response = await fetchCollectionsFromEndpointByDate(params.bbox, params.sortDirection);
    } else {
      response = await returnListOfCollectionsFromEndpoint(params.bbox);
    }

    if (!Array.isArray(response)) {
      throw new Error(response.error || 'Invalid response');
    }

    const config = await getConfig();
    if (config?.loadedDataset) {
      setLoadedDataset({
        id: config.loadedDataset.id || '',
        title: config.loadedDataset.title || ''
      });
    } else {
      setLoadedDataset({ id: '', title: '' });
    }

    return response;
  };

  // Use react-query
  const {
    data: datasets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: getQueryKey(),
    queryFn: fetchDatasetsQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle initial selected dataset
  useEffect(() => {
    const selectedDatasetId = localStorage.getItem('selectedDatasetId');
    if (selectedDatasetId !== null) {
      setSelectedDataset(selectedDatasetId);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    if (activeFilter === filter) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setActiveFilter(filter);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setActiveFilter('');
    setSortDirection('asc');
  };

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  const handleToggle = () => {
    setIsToggled(prev => !prev);
    if (!isToggled) onResetBbox();
  };

  const handleDatasetClick = async (id: string) => {
    const dataset = await fetchMetaData(id);
    onDatasetClick(dataset);
    await handleLocalStorageOnDatasetClick(id);
    const map = mapRef.current as Map;
    changeLayer(map, true);
  };

  const handleLocalStorageOnDatasetClick = async (id: string) => {
    const selectedDatasetId = localStorage.getItem('selectedDatasetId');
    if (selectedDatasetId === null || selectedDatasetId !== id) {
      await insertDatalayerView(id);
      localStorage.setItem('selectedDatasetId', id);
      setSelectedDataset(id);
    } else {
      await resetDatalayerView();
      localStorage.setItem('selectedDatasetId', '');
      setSelectedDataset(null);
    }
  };

  const getTranslatedErrorMessageKey = (rawError: string): string => {
    switch (rawError) {
      case 'Failed to fetch data by name':
        return 'error_fetching_data_by_name';
      case 'Failed to fetch data by date':
        return 'error_fetching_data_by_date';
      case 'Failed to fetch data':
        return 'error_fetching_data';
      case '':
      case undefined:
        return 'error_fetching_data';
      default:
        return rawError;
    }
  };

  const renderDatasetContent = () => {
    if (isLoading) {
      return <p className="loading-message" data-testid="loading-message">{t('loading_datasets')}</p>;
    }

    if (error) {
      return (
        <div className="error-message" data-testid="error-message">
          {t(getTranslatedErrorMessageKey((error as Error).message))}
        </div>
      );
    }

    if (datasets.length > 0) {
      return datasets.map((dataset) => {
        const isLoaded = dataset.id === loadedDataset.id;
        return (
          <button
            key={dataset.id}
            className={`dataset-button ${selectedDataset === dataset.id ? 'selected' : ''}`}
            onClick={() => handleDatasetClick(dataset.id)}
            data-testid={`dataset-button-${dataset.id}`}
          >
            {dataset.title}{' '}
            {isLoaded && <span className="loaded-tag">{t('loaded')}</span>}
          </button>
        );
      });
    }

    return (
      <div className="no-datasets-container" data-testid="no-datasets-container">
        <p className="no-datasets-message" data-testid="no-datasets-message">
          {t('no_datasets_available')}
        </p>
      </div>
    );
  };

  const getToggleStatusText = () => {
    if (!currentBbox || currentBbox.length === 0) {
      return t('map_required');
    }
    return t('filtering_by_map_view');
  };

  return (
    <div className={`datasets-container ${isCollapsed ? 'collapsed' : ''}`} data-testid="datasets-container">
      <button
        className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleCollapse}
        data-testid="collapse-button"
      >
        {isCollapsed ? <FaChevronCircleLeft size={24} /> : <FaChevronCircleRight size={24} />}
      </button>
      {isCollapsed ? (
        <FaDatabase fill="white" size={24} />
      ) : (
        <>
          <div className="top-bar" data-testid="top-bar">
            <h2 className="sidebar-title" data-testid="sidebar-title">
              {t('available_datasets')}
            </h2>
            <div className="toggle-control-group">
              <label
                className="toggle-label"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                aria-label={t('toggle_datasets')}
              >
                <span className="toggle-status-text" data-testid="toggle-status-text">
                  {getToggleStatusText()}
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
                  {!currentBbox && <span className="toggle-warning">{t('Load map first')}</span>}
                </div>
              </label>
            </div>
          </div>
          <div className="filter-container" data-testid="filter-container">
            <div className="filter-icon" data-testid="filter-icon">
              <FaFilter size={24} />
            </div>
            <button
              className={`filter-button ${activeFilter === 'Name' ? 'active' : ''}`}
              onClick={() => handleFilterChange('Name')}
              data-testid="filter-button-Name"
            >
              {t('name')}{' '}
              {activeFilter === 'Name' &&
                (sortDirection === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            </button>
            <button
              className={`filter-button ${activeFilter === 'Date' ? 'active' : ''}`}
              onClick={() => handleFilterChange('Date')}
              data-testid="filter-button-Date"
            >
              {t('date')}{' '}
              {activeFilter === 'Date' &&
                (sortDirection === 'asc' ? <FaSortNumericDown /> : <FaSortNumericUp />)}
            </button>
            <button
              className="filter-button reset-button"
              onClick={resetFilters}
              data-testid="filter-button-reset"
            >
              <FaTimes /> {t('reset')}
            </button>
          </div>
          <div className="buttons-container" data-testid="buttons-container">
            {renderDatasetContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableDatasets;
