// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import styled from 'styled-components';
// import axios from 'axios';

// interface SidebarProps {
//   updateWildfireLayer: (layerName: string) => void;
//   onClose: () => void;
// }

// const SidebarContainer = styled.div`
//   width: 200px;
//   height: 300px;
//   background: #f8f9fa;
//   padding: 5px 20px 20px 20px;
//   position: fixed;
//   left: 0;
//   top: 50%;
//   transform: translateY(-50%);
//   box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
//   overflow-y: auto;
//   cursor: move;
//   z-index: 1000;
//   border: 1px solid black;
//   border-radius: 8px;
//   margin-left: 20px;
// `;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const CloseButton = styled.button`
//   background: none;
//   border: none;
//   font-size: 1.2em;
//   cursor: pointer;
// `;

// const SidebarTitle = styled.h2`
//   font-size: 1.4em;
//   color: #333;
// `;

// const CheckboxLabel = styled.label`
//   display: flex;
//   align-items: center;
//   margin-bottom: 15px;
//   cursor: pointer;
//   font-size: 1.1em;
// `;

// const DatasetButton = styled.button`
//   width: 100%;
//   padding: 10px;
//   margin-bottom: 10px;
//   background: #007bff;
//   color: white;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   font-size: 1.1em;

//   &:hover {
//     background: #0056b3;
//   }
// `;

// const Sidebar: React.FC<SidebarProps> = ({ updateWildfireLayer, onClose }) => {
//   const [datasets, setDatasets] = useState<string[]>([]);
//   const sidebarRef = useRef<HTMLDivElement>(null);
//   const isDragging = useRef(false);
//   const offset = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     const fetchDatasets = async () => {
//       try {
//         const response = await axios.get('http://localhost:8080/api/datasets');
//         setDatasets(response.data);
//       } catch (error) {
//         console.error('Error fetching datasets:', error);
//         setDatasets([]); // Load an empty list if no data is available
//       }
//     };
//     fetchDatasets();
//   }, []);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (sidebarRef.current) {
//       isDragging.current = true;
//       const rect = sidebarRef.current.getBoundingClientRect();
//       offset.current = {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top
//       };
//     }
//   };

//   const handleMouseMove = (e: MouseEvent) => {
//     if (isDragging.current && sidebarRef.current) {
//       sidebarRef.current.style.left = `${e.clientX - offset.current.x}px`;
//       sidebarRef.current.style.top = `${e.clientY - offset.current.y}px`;
//     }
//   };

//   const handleMouseUp = () => {
//     isDragging.current = false;
//   };

//   useEffect(() => {
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);
//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, []);

//   const handleLayerToggle = (layerName: string) => {
//     updateWildfireLayer(layerName);
//   };

//   return (
//     <SidebarContainer ref={sidebarRef} onMouseDown={handleMouseDown}>
//       <Header>
//         <SidebarTitle>Layers</SidebarTitle>
//         <CloseButton onClick={onClose}>&times;</CloseButton>
//       </Header>
//       <CheckboxLabel>
//         <input type="checkbox" onChange={() => handleLayerToggle('satellite')} /> Satellite
//       </CheckboxLabel>
//       <CheckboxLabel>
//         <input type="checkbox" onChange={() => handleLayerToggle('meteorological')} /> Meteorological
//       </CheckboxLabel>
//       <CheckboxLabel>
//         <input type="checkbox" onChange={() => handleLayerToggle('topographical')} /> Topographical
//       </CheckboxLabel>

//       <SidebarTitle>Available Datasets</SidebarTitle>
//       {datasets.length > 0 ? (
//         datasets.map((dataset, index) => (
//           <DatasetButton key={index} onClick={() => handleLayerToggle(dataset)}>
//             {dataset}
//           </DatasetButton>
//         ))
//       ) : (
//         <p>No datasets available.</p>
//       )}
//     </SidebarContainer>
//   );
// };

// export default Sidebar;

'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLayerContext } from './MapContext';
const viewsIcon= './assets/layers_white.png'; // Replace with the actual path to your Views icon
const satelliteImage = './assets/Satellite_layer.png'; // Replace with the path to your satellite layer image
const defaultImage = './assets/Default_layer.png'; // Replace with the path to your meteorological layer image
const terrainImage = './assets/Terrain_layer.png'; // Replace with the path to your topographical layer image

const SidebarContainer = styled.div<{ isCollapsed: boolean }>`
  width: ${({ isCollapsed }) => (isCollapsed ? '60px' : '100px')};
  background: #005ea6;
  color: white;
  position: fixed;
  bottom: 10px;
  left: 25px;
  padding: ${({ isCollapsed }) => (isCollapsed ? '10px' : '5px 20px 20px 20px')};
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
  border-radius: 8px;
  transition: width 0.3s ease, height 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  const layer = useLayerContext();

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleLayerChange = (layerName: string) => {
    layer.name = layerName;
  };

  return (
    <SidebarContainer isCollapsed={isCollapsed}>
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

