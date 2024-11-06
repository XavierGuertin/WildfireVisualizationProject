'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';

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

const DatasetsContainer = styled.div<{ isCollapsed: boolean }>`
  font-family: 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  width: ${({ isCollapsed }) => (isCollapsed ? '75px' : '550px')};
  height: ${({ isCollapsed }) => (isCollapsed ? '75px' : '350px')};
  background: ${({ isCollapsed }) => (isCollapsed ? '#00447E' : '#ffffff')};
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 1000;
  overflow: visible;
  transition: width 0.3s ease;
  display: ${({ isCollapsed }) => (isCollapsed ? 'flex' : 'block')};
  justify-content: center;
  align-items: center;
`;

const TopBar = styled.div`
  background: #00447E;
  color: white;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const SidebarTitle = styled.h2`
  font-size: 1.2em;
  margin: 0;
  color: white;
  display: 'block';
`;

const ToggleButton = styled.div`
  position: relative;
  width: 40px; /* Increased width */
  height: 22px; /* Increased height */
  background: white;
  border-radius: 11px;
  border: 2px solid #00447E;
  cursor: pointer;
  margin-right: 12px;
  transition: background 0.3s;

  &::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background: #00447E;
    border-radius: 50%;
    top: 2.4px;
    left: 1px;
    transition: 0.3s;
  }

  input:checked + &::after {
    left: 20px; /* Adjusted for the new size */
  }
`;

const CollapseButton = styled.button<{ isCollapsed: boolean }>`
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.2em;
  position: absolute;
  left: -15px;
  top: ${({ isCollapsed }) => (isCollapsed ? '50%' : '13%')};
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1100;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 15px; /* Add vertical space below TopBar */
  padding: 0 20px; /* Add horizontal padding */
  flex-wrap: wrap;
`;

const FilterIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  flex-shrink: 0;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  min-width: 80px;
  padding: 8px;
  background: ${({ isActive }) => (isActive ? '#00447E' : '#ddd')};
  color: ${({ isActive }) => (isActive ? 'white' : '#333')};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive }) => (isActive ? '#003355' : '#ccc')};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const DatasetButton = styled.button<{ isSelected: boolean }>`
  width: calc(100% - 40px);
  padding: 10px;
  margin: 0 auto 10px; /* Center align and spacing between buttons */
  background: ${({ isSelected }) => (isSelected ? '#00447E' : '#ffffff')};
  color: ${({ isSelected }) => (isSelected ? '#ffffff' : '#00447E')};
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-family: inherit;
  text-align: left;
  box-sizing: border-box;

  &:hover {
    background: ${({ isSelected }) => (isSelected ? '#003355' : '#f1f1f1')};
  }
`;

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({ onDatasetClick }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Name');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Mock data for testing purposes
    const mockData: Dataset[] = [
      { name: 'Dataset A', date: '2023-01-01', latestAdded: '2023-02-01', latestUpdated: '2023-03-01', city: 'City A', description: 'Description for Dataset A', format: 'GeoJSON', processes: 'Data analysis', datasetSource: 'Source A' },
      { name: 'Dataset B', date: '2023-02-15', latestAdded: '2023-02-16', latestUpdated: '2023-03-05', city: 'City B', description: 'Description for Dataset B', format: 'Shapefile', processes: 'Data cleaning', datasetSource: 'Source B' },
      { name: 'Dataset C', date: '2023-03-10', latestAdded: '2023-03-15', latestUpdated: '2023-04-01', city: 'City C', description: 'Description for Dataset C', format: 'GeoJSON', processes: 'Mapping', datasetSource: 'Source C' },
      { name: 'Dataset D', date: '2023-01-25', latestAdded: '2023-02-10', latestUpdated: '2023-02-28', city: 'City D', description: 'Description for Dataset D', format: 'CSV', processes: 'Data processing', datasetSource: 'Source D' },
    ];

    setDatasets(mockData);

    const handleToggle = () => {
      setIsToggled(!isToggled);
    };

    // Fetch datasets from the API (commented out to use mock data)
    const fetchDatasets = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/datasets');
        setDatasets(response.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
      }
    };
    fetchDatasets();
  }, []);

  const sortDatasets = (filter: string) => {
    setActiveFilter(filter);

    const sortedDatasets = [...datasets];
    switch (filter) {
      case 'Name':
        sortedDatasets.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Date':
        sortedDatasets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'Latest Added':
        sortedDatasets.sort((a, b) => new Date(a.latestAdded).getTime() - new Date(b.latestAdded).getTime());
        break;
      case 'Latest Updated':
        sortedDatasets.sort((a, b) => new Date(a.latestUpdated).getTime() - new Date(b.latestUpdated).getTime());
        break;
      default:
        break;
    }
    setDatasets(sortedDatasets);
  };

  const handleDatasetClick = (dataset: Dataset) => {
    // Mock loading progress
    setIsLoading(true);
    setProgress(0);

    setSelectedDataset(dataset.name);
    console.log(`Selected dataset: ${dataset.name}`);

    setProgress(50);
    console.log('Loading dataset...');

    onDatasetClick(dataset);
    console.log('Dataset loaded successfully.');

    setProgress(100);
    setIsLoading(false);

  //   // Simulate loading progress
  //   const interval = setInterval(() => {
  //     setProgress((prev) => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         setIsLoading(false);
  //         return 100;
  //       }
  //       return prev + 10;
  //     });
  //   }, 300);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <>
      <LoadingOverlay progress={progress} isVisible={isLoading} />
      <DatasetsContainer isCollapsed={isCollapsed}>
        <CollapseButton isCollapsed={isCollapsed} onClick={toggleCollapse}>
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
        </CollapseButton>
        {isCollapsed ? (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M42 10C42 13.3137 33.9411 16 24 16C14.0589 16 6 13.3137 6 10M42 10C42 6.68629 33.9411 4 24 4C14.0589 4 6 6.68629 6 10M42 10V38C42 41.32 34 44 24 44C14 44 6 41.32 6 38V10M42 24C42 27.32 34 30 24 30C14 30 6 27.32 6 24" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        ) : (
          <>
            <TopBar>
              <SidebarTitle>Available Datasets</SidebarTitle>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={isToggled} onChange={handleToggle} style={{ display: 'none' }} />
                <ToggleButton />
              </label>
            </TopBar>
            {!isCollapsed && (
              <>
                <FilterContainer>
                  <FilterIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5H21V7H3V5ZM6 11H18V13H6V11ZM10 17H14V19H10V17Z" fill="currentColor" />
                    </svg>
                  </FilterIcon>
                  {['Name', 'Date', 'Latest Added', 'Latest Updated'].map((filter) => (
                    <FilterButton key={filter} isActive={activeFilter === filter} onClick={() => sortDatasets(filter)}>
                      {filter}
                    </FilterButton>
                  ))}
                </FilterContainer>
                <ButtonsContainer>
                  {datasets.length > 0 ? (
                    datasets.map((dataset, index) => (
                      <DatasetButton
                        key={index}
                        isSelected={selectedDataset === dataset.name}
                        onClick={() => handleDatasetClick(dataset)}
                      >
                        {dataset.name}
                      </DatasetButton>
                    ))
                  ) : (
                    <p style={{ fontFamily: 'inherit', color: '#333', textAlign: 'center' }}>No datasets available.</p>
                  )}
                </ButtonsContainer>
              </>
            )}
          </>
        )}
      </DatasetsContainer>
    </>
  );
};

export default AvailableDatasets;