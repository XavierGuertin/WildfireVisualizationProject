// layout.tsx

'use client';

import React, { useState } from 'react';
// import Navbar from './components/Navbar';
import LoadingOverlay from './components/LoadingOverlay';
import MapView from './components/MapView';
import { LayerContext } from './components/MapContext';
import Sidebar from './components/Sidebar';

export interface Layer{
  name: string;
}

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

  const [layer] = useState<Layer>({
    name: "default",
  });

  return (
    <LayerContext.Provider value = {layer}>
      <html lang="en">
      <body>
      <div className="layout-container relative">
        <LoadingOverlay progress={progress} isVisible={loading} />
        <header>
          {/* <Navbar /> */}
        </header>
        <main className="app-main">{children}</main>
        <MapView />
        <Sidebar />
        <footer className="app-footer">
        </footer>
      </div>
      </body>
      </html>
    </LayerContext.Provider>


  );
};

export default Layout;
