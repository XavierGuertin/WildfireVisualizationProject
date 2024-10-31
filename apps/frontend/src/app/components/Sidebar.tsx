"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface SidebarProps {
  updateWildfireLayer: (layerName: string) => void;
}

const SidebarContainer = styled.div`
  width: 300px;
  background: #f8f9fa;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const SidebarTitle = styled.h2`
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #333;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
`;

const DatasetButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ updateWildfireLayer }) => {
  const [datasets, setDatasets] = useState<string[]>([]);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/datasets');
        setDatasets(response.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        setDatasets([]); // Load an empty list if no data is available
      }
    };
    fetchDatasets();
  }, []);

  const handleLayerToggle = (layerName: string) => {
    updateWildfireLayer(layerName);
  };

  return (
    <SidebarContainer>
      <SidebarTitle>Layers</SidebarTitle>
      <CheckboxLabel>
        <input type="checkbox" onChange={() => handleLayerToggle('satellite')} /> Satellite
      </CheckboxLabel>
      <CheckboxLabel>
        <input type="checkbox" onChange={() => handleLayerToggle('meteorological')} /> Meteorological
      </CheckboxLabel>
      <CheckboxLabel>
        <input type="checkbox" onChange={() => handleLayerToggle('topographical')} /> Topographical
      </CheckboxLabel>

      <SidebarTitle>Available Datasets</SidebarTitle>
      {datasets.length > 0 ? (
        datasets.map((dataset, index) => (
          <DatasetButton key={index} onClick={() => handleLayerToggle(dataset)}>
            {dataset}
          </DatasetButton>
        ))
      ) : (
        <p>No datasets available.</p>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
