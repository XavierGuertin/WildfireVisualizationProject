// layout.tsx

'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoadingOverlay from './components/LoadingOverlay';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateWildfireLayer = (layerName: string) => {
    setLoading(true);
    setProgress(0); // Reset progress when starting a new load

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

  return (
    <html lang="en">
    <body>
    <div className="layout-container relative">
      <LoadingOverlay progress={progress} isVisible={loading} />
      <header>
        <Navbar updateWildfireLayer={updateWildfireLayer} />
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>&copy; 2024 Wildfire Visualization Project</p>
      </footer>
    </div>
    </body>
    </html>
  );
};

export default Layout;
