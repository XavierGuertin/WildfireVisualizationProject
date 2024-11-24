'use client';

import React, { useState } from 'react';
import { useMapLayerContext } from './MapContext';
import "../styles/Sidebar.css";

const viewsIcon = '/assets/layers_white.png';
const satelliteImage = '/assets/Satellite_layer.png';
const defaultImage = '/assets/Default_layer.png';
const terrainImage = '/assets/Terrain_layer.png';


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
    <div className={`sidebar-component ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {isCollapsed ? (
        <button className='sidebar-toggle' onClick={toggleCollapse}>
          <img className='icon' src={viewsIcon} alt="Views" />
          <span style={{ marginLeft: '5px', color: 'white' }}>Views</span>
        </button>
      ) : (
        <>
          <div className='sidebar-toggle' onClick={toggleCollapse}>
            <img className='icon' src={viewsIcon} alt="Collapse" />
          </div>

          <img
            className='layer-image'
            src={defaultImage}
            alt="Default Layer"
            onClick={() => handleLayerChange('default')}
          />
          <img
            className='layer-image'
            src={terrainImage}
            alt="Topographical Layer"
            onClick={() => handleLayerChange('topographical')}
          />
          <img
            className='layer-image'
            src={satelliteImage}
            alt="Satellite Layer"
            onClick={() => handleLayerChange('satellite')}
          />
        </>
      )}
    </div>
  );
};

export default Sidebar;

