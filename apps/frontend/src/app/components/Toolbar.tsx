'use client';

import React from 'react';
import styled from 'styled-components';

interface ToolbarProps {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  pan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  toggleFullscreen: () => void;
}

const ToolbarContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const ToolbarButton = styled.button`
  padding: 10px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #0056b3;
  }
`;

const DirectionButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 40px 40px 40px;
  grid-template-rows: 40px 40px 40px;
  gap: 5px;
`;

const DirectionButton = styled.button`
  padding: 10px;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #218838;
  }
`;

const Toolbar: React.FC<ToolbarProps> = ({ resetView, zoomIn, zoomOut, pan, toggleFullscreen }) => {
  return (
    <ToolbarContainer>
      <ToolbarButton onClick={zoomIn}>Zoom In</ToolbarButton>
      <ToolbarButton onClick={zoomOut}>Zoom Out</ToolbarButton>
      <ToolbarButton onClick={resetView}>Reset View</ToolbarButton>

      <DirectionButtonContainer>
        <div></div>
        <DirectionButton onClick={() => pan('up')}>↑</DirectionButton>
        <div></div>
        <DirectionButton onClick={() => pan('left')}>←</DirectionButton>
        <div></div>
        <DirectionButton onClick={() => pan('right')}>→</DirectionButton>
        <div></div>
        <DirectionButton onClick={() => pan('down')}>↓</DirectionButton>
        <div></div>
      </DirectionButtonContainer>

      <ToolbarButton onClick={toggleFullscreen}>Fullscreen</ToolbarButton>
    </ToolbarContainer>
  );
};

export default Toolbar;
