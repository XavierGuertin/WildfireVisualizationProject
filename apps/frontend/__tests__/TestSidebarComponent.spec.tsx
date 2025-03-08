import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../src/app/components/Sidebar';
import { MapProvider, useMapLayerContext } from '../src/context/MapContext';

// Mock react-toastify.
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

describe('Test Sidebar component', () => {
  const renderSidebar = () => {
    render(
      <MapProvider>
        <Sidebar />
      </MapProvider>
    );
  };

  it('should render collapsed sidebar initially', () => {
    renderSidebar();
    const viewsButton = document.querySelector('.sidebar-component');
    expect(viewsButton).toHaveClass('collapsed');
  });

  it('should expand sidebar when clicking toggle button', () => {
    renderSidebar();
    const viewsButton = document.querySelector('.sidebar-toggle')!;
    fireEvent.click(viewsButton);
    expect(screen.getByAltText('default_layer')).toBeInTheDocument();
    expect(screen.getByAltText('topographical_layer')).toBeInTheDocument();
    expect(screen.getByAltText('satellite_layer')).toBeInTheDocument();
  });

  it('should collapse sidebar when clicking toggle button again', () => {
    renderSidebar();
    // Expand the sidebar first
    const viewsButton = document.querySelector('.sidebar-component')!;
    fireEvent.click(viewsButton);
    // Collapse it
    fireEvent.click(viewsButton);
    expect(viewsButton).toHaveClass('collapsed');
  });

  it('should call setLayer with correct layer name on image click', () => {
    // Custom component to check the layer change
    const LayerChecker: React.FC = () => {
      const { layer } = useMapLayerContext();
      return <span data-testid="current-layer">{layer}</span>;
    };
    
    const TestComponent = () => (
      <MapProvider>
        <Sidebar />
        <LayerChecker />
      </MapProvider>
    );
    
    render(<TestComponent />);

    fireEvent.click(screen.getByAltText('views')); // Expand the sidebar

    // Check each layer click updates the layer value correctly
    fireEvent.click(screen.getByAltText('default_layer'));
    expect(screen.getByTestId('current-layer')).toHaveTextContent('default');

    fireEvent.click(screen.getByAltText('topographical_layer'));
    expect(screen.getByTestId('current-layer')).toHaveTextContent('topographical');

    fireEvent.click(screen.getByAltText('satellite_layer'));
    expect(screen.getByTestId('current-layer')).toHaveTextContent('satellite');
  });

  it('should not switch layers when offline', () => {
      const LayerChecker: React.FC = () => {
        const { layer, setIsOnline } = useMapLayerContext();
        setIsOnline(false);
        return <span data-testid="current-layer">{layer}</span>;
      };

      const TestComponent = () => (
        <MapProvider>
          <Sidebar />
          <LayerChecker />
        </MapProvider>
      );

      const { toast } = require('react-toastify');

      render(<TestComponent />);

      fireEvent.click(screen.getByAltText('views')); // Expand the sidebar

      // Check each layer click updates the layer value correctly
      fireEvent.click(screen.getByAltText('default_layer'));
      expect(screen.getByTestId('current-layer')).toHaveTextContent('default');

      fireEvent.click(screen.getByAltText('topographical_layer'));
      expect(screen.getByTestId('current-layer')).toHaveTextContent('default');
      expect(toast.error).toHaveBeenCalledWith('view_disabled - no_internet_access', {"toastId": "view-disabled"});

      fireEvent.click(screen.getByAltText('satellite_layer'));
      expect(screen.getByTestId('current-layer')).toHaveTextContent('default');
      expect(toast.error).toHaveBeenCalledWith('view_disabled - no_internet_access', {"toastId": "view-disabled"});
  });
});
