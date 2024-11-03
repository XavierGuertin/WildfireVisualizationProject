'use client';

import React from 'react';
import Navbar from './components/Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const updateWildfireLayer = (layerName: string) => {
    // Logic to update wildfire layers
  };

  return (
    <html lang="en">
    <body>
    <div className="layout-container">
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
