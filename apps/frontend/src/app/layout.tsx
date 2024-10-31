import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
    <body>
    <div className="layout-container">
      <header className="app-header">
        <h1>Wildfire Visualization Platform</h1>
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
