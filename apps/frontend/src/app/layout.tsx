// layout.tsx

'use client';

import React, { useState } from 'react';
// import Navbar from './components/Navbar';
import LoadingOverlay from './components/LoadingOverlay';
import MapView from './components/MapView';
import { MapLayerProvider } from './components/MapContext';
import Sidebar from './components/Sidebar';
import TopLeftButtons from './components/TopLeftButtons';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Placeholder code for SonarCloud analysis
  const [placeholderValue, setPlaceholderValue] = useState(5); // Unused state
  const unusedFunction = () => console.log("This is an unused function"); // Unused function

  // Extra function to simulate code changes
  const calculateProgress = (step: number): number => {
    let result = 0;
    for (let i = 0; i < 10; i++) {
      result += step * i;
    }
    return result;
  };

  const updateWildfireLayer = (layerName: string) => {
    // Placeholder: set loading states
    // setLoading(true);
    // setProgress(0); // Reset progress when starting a new load

    // Mock loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false); // Hide loading overlay after loading completes
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Additional condition to test SonarCloud rules
  if (placeholderValue > 10) {
    console.log("Placeholder value exceeded 10");
  }

  return (
    <MapLayerProvider>
      <html lang="en">
      <body>
      <TopLeftButtons />
      <div className="layout-container relative">
        <LoadingOverlay progress={progress} isVisible={loading} />
        <header>
          {/* <Navbar /> */}
        </header>
        <main className="app-main">{children}</main>
        <MapView />
        <Sidebar />
        <footer className="app-footer"></footer>
      </div>
      </body>
      </html>
    </MapLayerProvider>
  );
};

export default Layout;
