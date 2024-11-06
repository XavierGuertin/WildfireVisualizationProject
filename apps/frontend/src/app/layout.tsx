// layout.tsx

'use client';

import React, { useState } from 'react';
// import Navbar from './components/Navbar';
import LoadingOverlay from './components/LoadingOverlay';
import Footer from './components/Footer';
import Footer_2 from './components/Footer_2';
import SimulationControls from './components/SimulationControls';
import MapView from './components/MapView';
import { MapLayerProvider } from './components/MapContext';
import Sidebar from './components/Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateWildfireLayer = (layerName: string) => {
    // setLoading(true);
    // setProgress(0); // Reset progress when starting a new load

    // // Mock loading progress
    // const interval = setInterval(() => {
    //   setProgress((prev) => {
    //     if (prev >= 100) {
    //       clearInterval(interval);
    //       setLoading(false); // Hide loading overlay after loading completes
    //       return 100;
    //     }
    //     return prev + 10;
    //   });
    // }, 300);
  };
  
  return (
    <MapLayerProvider>
      
      <html lang="en">
      <body>
      <div className="layout-container relative">
        <LoadingOverlay progress={progress} isVisible={loading} />
        <header>
          {/* <Navbar /> */}
        </header>
        <main className="app-main">{children}</main>
        <MapView />
        <p>Louis</p>
        <Sidebar />
        <p>Louis</p>
        <Footer_2 />
        {/* <Footer /> */}
        <footer className="app-footer">
        </footer>
      </div>
      </body>
      </html>
      </MapLayerProvider>
  );
};

export default Layout;
