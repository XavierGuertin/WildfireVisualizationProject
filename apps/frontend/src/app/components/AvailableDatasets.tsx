'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface Dataset {
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
  background: #ffffff;
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 1000;
  box-sizing: border-box;
  overflow: hidden; /* Prevent overflow */
  transition: width 0.3s ease;
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

const SidebarTitle = styled.h2<{ isCollapsed: boolean }>`
  font-size: 1.2em;
  margin: 0;
  color: white;
  display: ${({ isCollapsed }) => (isCollapsed ? 'none' : 'block')};
`;

const CollapseButton = styled.button<{ isCollapsed: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.2em;
  position: absolute;
  left: -25px; /* Position it outside the container */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #00447E;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
  width: calc(100% - 40px); /* Adjust width to fit within container */
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

  useEffect(() => {
    // Mock data for testing purposes
    const mockData: Dataset[] = [
      { name: 'Dataset A', date: '2023-01-01', latestAdded: '2023-02-01', latestUpdated: '2023-03-01', city: 'City A', description: 'Description for Dataset A', format: 'GeoJSON', processes: 'Data analysis', datasetSource: 'Source A' },
      { name: 'Dataset B', date: '2023-02-15', latestAdded: '2023-02-16', latestUpdated: '2023-03-05', city: 'City B', description: 'Description for Dataset B', format: 'Shapefile', processes: 'Data cleaning', datasetSource: 'Source B' },
      { name: 'Dataset C', date: '2023-03-10', latestAdded: '2023-03-15', latestUpdated: '2023-04-01', city: 'City C', description: 'Description for Dataset C', format: 'GeoJSON', processes: 'Mapping', datasetSource: 'Source C' },
      { name: 'Dataset D', date: '2023-01-25', latestAdded: '2023-02-10', latestUpdated: '2023-02-28', city: 'City D', description: 'Description for Dataset D', format: 'CSV', processes: 'Data processing', datasetSource: 'Source D' },
    ];

    setDatasets(mockData);

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
    setSelectedDataset(dataset.name);
    onDatasetClick(dataset);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <DatasetsContainer isCollapsed={isCollapsed}>
      <TopBar>
        <SidebarTitle isCollapsed={isCollapsed}>Available Datasets</SidebarTitle>
      </TopBar>
      <CollapseButton isCollapsed={isCollapsed} onClick={toggleCollapse}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor" />
        </svg>
      </CollapseButton>
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
    </DatasetsContainer>
  );
};

export default AvailableDatasets;