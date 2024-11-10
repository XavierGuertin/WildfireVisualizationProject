'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useMapLayerContext } from './MapContext';

const viewsIcon = '/assets/layers_white.png';
const satelliteImage = '/assets/Satellite_layer.png';
const defaultImage = '/assets/Default_layer.png';
const terrainImage = '/assets/Terrain_layer.png';

const SidebarContainer = styled.div`
  width: 100px;
  background: #00447E;
  color: white;
  position: fixed;
  bottom: 10vh;
  left: 25px;
  padding: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
  border-radius: 8px;
  transition: width 0.3s ease, height 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.collapsed {
    width: 100px;
    padding: 10px;
  }

  &.expanded {
    width: 100px;
    padding: 5px 20px 20px 20px;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

const LayerImage = styled.img`
  width: 100%;
  height: auto;
  max-width: 150px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    opacity: 0.8;
  }
`;

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const {setLayer} = useMapLayerContext();

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleLayerChange = (layerName: string) => {
    setLayer(layerName);
  };

  return (
    <SidebarContainer className={isCollapsed ? 'collapsed' : 'expanded'}>
      {isCollapsed ? (
        <ToggleButton onClick={toggleCollapse}>
          <Icon src={viewsIcon} alt="Views" />
          <span style={{ marginLeft: '5px', color: 'white' }}>Views</span>
        </ToggleButton>
      ) : (
        <>
          <ToggleButton onClick={toggleCollapse}>
            <Icon src={viewsIcon} alt="Collapse" />
          </ToggleButton>

          <LayerImage
            src={defaultImage}
            alt="Default Layer"
            onClick={() => handleLayerChange('default')}
          />
          <LayerImage
            src={terrainImage}
            alt="Topographical Layer"
            onClick={() => handleLayerChange('topographical')}
          />
          <LayerImage
            src={satelliteImage}
            alt="Satellite Layer"
            onClick={() => handleLayerChange('satellite')}
          />
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;

