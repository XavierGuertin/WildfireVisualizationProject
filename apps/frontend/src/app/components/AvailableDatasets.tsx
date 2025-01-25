'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation for translations
import '../styles/AvailableDatasets.css';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaDatabase,
  FaFilter,
} from 'react-icons/fa';

export interface Dataset {
  city: string;
  date: string;
  datasetSource: string;
  description: string;
  format: string;
  latestAdded: string;
  latestUpdated: string;
  name: string;
  processes: string;
}

interface AvailableDatasetsProps {
  onDatasetClick: (dataset: Dataset) => void;
}

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({
  onDatasetClick,
}) => {
  const { t } = useTranslation(); // Initialize useTranslation for translations
  const [activeFilter, setActiveFilter] = useState<string>('Name');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  useEffect(() => {
    const mockData: Dataset[] = [
      {
        name: 'Dataset A',
        date: '2023-01-01',
        latestAdded: '2023-02-01',
        latestUpdated: '2023-03-01',
        city: 'City A',
        description: 'Description for Dataset A',
        format: 'GeoJSON',
        processes: 'Data analysis',
        datasetSource: 'Source A',
      },
      {
        name: 'Dataset B',
        date: '2023-02-15',
        latestAdded: '2023-02-16',
        latestUpdated: '2023-03-05',
        city: 'City B',
        description: 'Description for Dataset B',
        format: 'Shapefile',
        processes: 'Data cleaning',
        datasetSource: 'Source B',
      },
      {
        name: 'Dataset C',
        date: '2023-03-10',
        latestAdded: '2023-03-15',
        latestUpdated: '2023-04-01',
        city: 'City C',
        description: 'Description for Dataset C',
        format: 'GeoJSON',
        processes: 'Mapping',
        datasetSource: 'Source C',
      },
      {
        name: 'Dataset D',
        date: '2023-01-25',
        latestAdded: '2023-02-10',
        latestUpdated: '2023-02-28',
        city: 'City D',
        description: 'Description for Dataset D',
        format: 'CSV',
        processes: 'Data processing',
        datasetSource: 'Source D',
      },
    ];
    setDatasets(mockData);

    const fetchDatasets = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/datasets`);
        setDatasets(response.data);
      } catch (error) {
        console.log('Error fetching datasets:', error);
      }
    };

    fetchDatasets();
  }, []);

  const sortDatasets = (filter: string) => {
    setActiveFilter(filter);
    const sortedDatasets = [...datasets].sort((a, b) => {
      switch (filter) {
        case 'Date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'Latest Added':
          return (
            new Date(a.latestAdded).getTime() -
            new Date(b.latestAdded).getTime()
          );
        case 'Latest Updated':
          return (
            new Date(a.latestUpdated).getTime() -
            new Date(b.latestUpdated).getTime()
          );
        case 'Name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setDatasets(sortedDatasets);
  };

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const handleToggle = () => setIsToggled((prev) => !prev);

  const handleDatasetClick = (dataset: Dataset) => {
    setSelectedDataset(dataset.name); // Update selected dataset
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
              {['Name', 'Date', 'Latest Added', 'Latest Updated'].map(
                (filter) => (
                  <button
                    key={filter}
                    className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => sortDatasets(filter)}
                    data-testid={`filter-button-${filter}`}
                  >
                    {t(filter.toLowerCase().replace(/ /g, '_'))}
                  </button>
                ),
              )}
            </div>
            <div className="buttons-container" data-testid="buttons-container">
              {datasets.length > 0 ? (
                datasets.map((dataset, index) => (
                  <button
                    key={index}
                    className={`dataset-button ${selectedDataset === dataset.name ? 'selected' : ''}`}
                    onClick={() => handleDatasetClick(dataset)}
                    data-testid={`dataset-button-${index}`}
                  >
                    {dataset.name}
                  </button>
                ))
              ) : (
                <p data-testid="no-datasets-message">
                  {t('no_datasets_available')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AvailableDatasets;
