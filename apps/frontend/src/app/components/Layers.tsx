'use client';

import React from 'react';
import styled from 'styled-components';

interface LayersProps {
  updateWildfireLayer: (layerName: string) => void;
}

const LayersContainer = styled.div`
  width: 200px;
  height: 200px;
  background: #f8f9fa;
  padding: 5px 20px 20px 20px;
  position: fixed;
  left: 0;
  top: 70%;
  transform: translateY(-50%);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid black;
  border-radius: 8px;
  margin-left: 20px;
`;

const SidebarTitle = styled.h2`
  font-size: 1.4em;
  color: #333;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
  font-size: 1.1em;
`;

const Layers: React.FC<LayersProps> = ({ updateWildfireLayer }) => {
  const handleLayerToggle = (layerName: string) => {
    updateWildfireLayer(layerName);
  };

  return (
    <LayersContainer>
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
    </LayersContainer>
  );
};

export default Layers;