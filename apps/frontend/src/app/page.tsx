"use client";

import React from 'react';
import Layout from './layout';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';

const IndexPage = () => {
  const updateWildfireLayer = (layerName: string) => {
    // Logic to update wildfire layers
  };

  const zoomIn = () => {
    // Logic to zoom in
  };

  const zoomOut = () => {
    // Logic to zoom out
  };

  const resetView = () => {
    // Logic to reset the view
  };

  const pan = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Logic to pan
  };

  const toggleFullscreen = () => {
    // Logic to toggle fullscreen
  };

  return (
    <Layout>
      <div className="layout-container">
        <main className="app-main">
          <Sidebar updateWildfireLayer={updateWildfireLayer} />
          <MapView />
          <Toolbar
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetView={resetView}
            pan={pan}
            toggleFullscreen={toggleFullscreen}
          />
        </main>
      </div>
    </Layout>
  );
};

export default IndexPage;
