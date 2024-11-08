'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';
import '../styles/AvailableDatasets.css';

export interface Dataset {
  name: string;
  date: string;
  latestAdded: string;
  latestUpdated: string;
  city: string;
  description: string;
  format: string;
  processes: string;
  datasetSource: string;
}

interface AvailableDatasetsProps {
  onDatasetClick: (dataset: Dataset) => void;
}

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({ onDatasetClick }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Name');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const mockData: Dataset[] = [
      { name: 'Dataset A', date: '2023-01-01', latestAdded: '2023-02-01', latestUpdated: '2023-03-01', city: 'City A', description: 'Description for Dataset A', format: 'GeoJSON', processes: 'Data analysis', datasetSource: 'Source A' },
      { name: 'Dataset B', date: '2023-02-15', latestAdded: '2023-02-16', latestUpdated: '2023-03-05', city: 'City B', description: 'Description for Dataset B', format: 'Shapefile', processes: 'Data cleaning', datasetSource: 'Source B' },
      { name: 'Dataset C', date: '2023-03-10', latestAdded: '2023-03-15', latestUpdated: '2023-04-01', city: 'City C', description: 'Description for Dataset C', format: 'GeoJSON', processes: 'Mapping', datasetSource: 'Source C' },
      { name: 'Dataset D', date: '2023-01-25', latestAdded: '2023-02-10', latestUpdated: '2023-02-28', city: 'City D', description: 'Description for Dataset D', format: 'CSV', processes: 'Data processing', datasetSource: 'Source D' },
    ];
    setDatasets(mockData);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchDatasets = async () => {
      try {
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
        case 'Name': return a.name.localeCompare(b.name);
        case 'Date': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'Latest Added': return new Date(a.latestAdded).getTime() - new Date(b.latestAdded).getTime();
        case 'Latest Updated': return new Date(a.latestUpdated).getTime() - new Date(b.latestUpdated).getTime();
        default: return 0;
      }
    });
    setDatasets(sortedDatasets);
  };

  const handleDatasetClick = (dataset: Dataset) => {
    setIsLoading(true);
    setProgress(0);
    setSelectedDataset(dataset.name);
    onDatasetClick(dataset);
    setProgress(100);
    setIsLoading(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggle = () => {
    setIsToggled((prevIsToggled) => !prevIsToggled);
    console.log('Toggled state:', !isToggled);
  };

  return (
    <>
      <LoadingOverlay progress={progress} isVisible={isLoading} />
      <div className={`datasets-container ${isCollapsed ? 'collapsed' : ''}`}>
        <button className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`} onClick={toggleCollapse}>
          {isCollapsed ? (
            <svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6757 19L26 28.9667L23.1622 32L11 19L23.1622 6L26 9.03333L16.6757 19Z" fill="#00447E" />
            </svg>
          ) : (
            <svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="39" height="38" rx="2" />
              <path d="M22.3243 19L13 9.03333L15.8378 6L28 19L15.8378 32L13 28.9667L22.3243 19Z" fill="#00447E" />
            </svg>
          )}
        </button>
        {isCollapsed ? (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M42 10C42 13.3137 33.9411 16 24 16C14.0589 16 6 13.3137 6 10M42 10C42 6.68629 33.9411 4 24 4C14.0589 4 6 6.68629 6 10M42 10V38C42 41.32 34 44 24 44C14 44 6 41.32 6 38V10M42 24C42 27.32 34 30 24 30C14 30 6 27.32 6 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <>
            <div className="top-bar">
              <h2 className="sidebar-title">Available Datasets</h2>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={isToggled} onChange={handleToggle} style={{ display: 'none' }} />
                <div className={`toggle-button ${isToggled ? 'toggled' : ''}`}></div>
              </label>
            </div>
            {!isCollapsed && (
              <>
                <div className="filter-container">
                  <div className="filter-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5H21V7H3V5ZM6 11H18V13H6V11ZM10 17H14V19H10V17Z" fill="currentColor" />
                    </svg>
                  </div>
                  {['Name', 'Date', 'Latest Added', 'Latest Updated'].map((filter) => (
                    <button
                      key={filter}
                      className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
                      onClick={() => sortDatasets(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="buttons-container">
                  {datasets.length > 0 ? (
                    datasets.map((dataset, index) => (
                      <button
                        key={index}
                        className={`dataset-button ${selectedDataset === dataset.name ? 'selected' : ''}`}
                        onClick={() => handleDatasetClick(dataset)}
                      >
                        {dataset.name}
                      </button>
                    ))
                  ) : (
                    <p style={{ fontFamily: 'inherit', color: '#333', textAlign: 'center' }}>No datasets available.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AvailableDatasets;