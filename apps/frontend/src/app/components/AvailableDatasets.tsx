'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation for translations
import '../styles/AvailableDatasets.css';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaDatabase,
  FaFilter,
} from 'react-icons/fa';
import { fetchCollectionsFromEndpoint, fetchCollectionsFromEndpointByName, fetchCollectionsFromEndpointByDate, fetchMetaData } from '../services/api';

export interface DatasetMetadata {
  date: string;
  datasetSource: string;
  description: string;     
  format: string;
  latestAdded: string;
  latestUpdated: string;
  name: string;
  processes: string;
  id: string;
}

interface AvailableDatasetsProps {
  onDatasetClick: (dataset: DatasetMetadata) => void;
}

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({
  onDatasetClick,
}) => {
  const { t } = useTranslation(); // Initialize useTranslation for translations
  const [activeFilter, setActiveFilter] = useState<string>('Name');
  const [datasets, setDatasets] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const datasetList: string[] | null = []
        const response: any = await fetchCollectionsFromEndpoint()
        for(let i = 0; i < response.length; i++){
          datasetList.push(response[i].id);
        }
        setDatasets(datasetList);
      } catch (error) {
        console.log('Error fetching datasets:', error);
        setFetchError('Failed to load datasets.');
      }
    };
    fetchDatasets();
  }, []);

  // Handle filter changes
  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
    
    try {
      let datasetList: string[] = [];
      let response: any;

      // Call appropriate API based on the selected filter
      if(filter === 'Name'){
        response = await fetchCollectionsFromEndpointByName();
      } else if (filter === 'Date'){
        response = await fetchCollectionsFromEndpointByDate();
      } else if (filter === 'Latest Added'){
        response = await fetchCollectionsFromEndpoint();
        //TODO: call latestAdded endpoint, once we have Latest Added attribute
      } else if (filter === 'Latest Updated'){
        response = await fetchCollectionsFromEndpoint();
        //TODO: call latestUpdated endpoint, once we have Latest Added attribute
      }

      for(let i = 0; i < response.length; i++){
        datasetList.push(response[i].id);
      } 

      setDatasets(datasetList);
      
    } catch(error){
      console.log(`Error fetching datasets for filter ${filter}:`, error);
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
    <>
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
              {['Name', 'Date', 'Latest Added', 'Latest Updated'].map(
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
              {fetchError ? ( 
                <p data-testid="no-datasets-message">{fetchError}</p>
              ) : (
                  datasets.length > 0 ? (
                    datasets.map((id, index) => (
                      <button
                        key={index}
                        className={`dataset-button ${selectedDataset === id ? 'selected' : ''}`}
                        onClick={() => handleDatasetClick(id)}
                        data-testid={`dataset-button-${index}`}
                      >
                        {id}
                      </button>
                    ))
                  ) : (
                    <p data-testid="no-datasets-message">{t('no_datasets_available')}</p>
                  )
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AvailableDatasets;
