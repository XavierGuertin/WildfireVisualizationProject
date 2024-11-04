'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface Dataset {
  name: string;
  date: string;
  latestAdded: string;
  latestUpdated: string;
}

interface AvailableDatasetsProps {
  onDatasetClick: (dataset: string) => void;
}

const DatasetsContainer = styled.div`
  font-family: 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  width: 550px; /* Increase width for more space */
  background: #ffffff;
  padding: 20px;
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 1000;
  box-sizing: border-box;
`;

const SidebarTitle = styled.h2`
  font-size: 1.4em;
  color: #333;
  margin-bottom: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap; /* Wrap filters if they exceed width */
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
  min-width: 80px; /* Ensure each filter button has a minimum width */
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

const DatasetButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: #ffffff;
  color: #00447E;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-family: inherit;
  text-align: left; /* Align text to the left */
  box-sizing: border-box;

  &:hover {
    background: #f1f1f1;
  }
`;

const AvailableDatasets: React.FC<AvailableDatasetsProps> = ({ onDatasetClick }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Name');

  useEffect(() => {
    // Mock data for testing purposes
    const mockData: Dataset[] = [
      { name: 'Dataset A', date: '2023-01-01', latestAdded: '2023-02-01', latestUpdated: '2023-03-01' },
      { name: 'Dataset B', date: '2023-02-15', latestAdded: '2023-02-16', latestUpdated: '2023-03-05' },
      { name: 'Dataset C', date: '2023-03-10', latestAdded: '2023-03-15', latestUpdated: '2023-04-01' },
      { name: 'Dataset D', date: '2023-01-25', latestAdded: '2023-02-10', latestUpdated: '2023-02-28' },
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

  return (
    <DatasetsContainer>
      <SidebarTitle>Available Datasets</SidebarTitle>
      <FilterContainer>
        <FilterIcon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 5H21V7H3V5ZM6 11H18V13H6V11ZM10 17H14V19H10V17Z"
              fill="currentColor"
            />
          </svg>
        </FilterIcon>
        {['Name', 'Date', 'Latest Added', 'Latest Updated'].map((filter) => (
          <FilterButton
            key={filter}
            isActive={activeFilter === filter}
            onClick={() => sortDatasets(filter)}
          >
            {filter}
          </FilterButton>
        ))}
      </FilterContainer>
      {datasets.length > 0 ? (
        datasets.map((dataset, index) => (
          <DatasetButton key={index} onClick={() => onDatasetClick(dataset.name)}>
            {dataset.name}
          </DatasetButton>
        ))
      ) : (
        <p style={{ fontFamily: 'inherit', color: '#333', textAlign: 'center' }}>No datasets available.</p>
      )}
    </DatasetsContainer>
  );
};

export default AvailableDatasets;