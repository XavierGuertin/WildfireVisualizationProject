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

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useLayerContext } from './MapContext';

interface SidebarProps {
  onClose: () => void;
}

const SidebarContainer = styled.div`
  width: 200px;
  height: 300px;
  background: #f8f9fa;
  padding: 5px 20px 20px 20px;
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  cursor: move;
  z-index: 1000;
  border: 1px solid black;
  border-radius: 8px;
  margin-left: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
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

const DatasetButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;

  &:hover {
    background: #0056b3;
  }
`;

const Sidebar: React.FC<SidebarProps> = () => {
  const [datasets, setDatasets] = useState<string[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const layer = useLayerContext();

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (sidebarRef.current) {
      isDragging.current = true;
      const rect = sidebarRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && sidebarRef.current) {
      sidebarRef.current.style.left = `${e.clientX - offset.current.x}px`;
      sidebarRef.current.style.top = `${e.clientY - offset.current.y}px`;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleLayerToggle = (layerName: string) => {
    layer.name = layerName;
  };

  return (
    <SidebarContainer ref={sidebarRef} onMouseDown={handleMouseDown}>
      <Header>
        <SidebarTitle>Layers</SidebarTitle>
        {/* <CloseButton onClick={onClose}>&times;</CloseButton> */}
      </Header>
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
