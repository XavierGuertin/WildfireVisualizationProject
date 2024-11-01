"use client";

import React from 'react';
import Layout from './layout';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';

const IndexPage = () => {
  const updateWildfireLayer = (layerName: string) => {
    // Logic to update wildfire layers
  };

  return (
    <Layout>
      <div className="layout-container">
        <main className="app-main">
          {/*<Sidebar updateWildfireLayer={updateWildfireLayer} />*/}
          <MapView />
        </main>
      </div>
    </Layout>
  );
};

export default IndexPage;
