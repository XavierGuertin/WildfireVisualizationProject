'use client';

import React, { useEffect, useRef } from 'react';
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
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  border: 1px solid black;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: move;
  z-index: 1000;
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolbarRef.current) {
      isDragging.current = true;
      const rect = toolbarRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && toolbarRef.current) {
      toolbarRef.current.style.left = `${e.clientX - offset.current.x}px`;
      toolbarRef.current.style.top = `${e.clientY - offset.current.y}px`;
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

  return (
    <ToolbarContainer ref={toolbarRef} onMouseDown={handleMouseDown}>
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
