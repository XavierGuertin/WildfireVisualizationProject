import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../src/app/components/Sidebar';
import { MapLayerProvider, useMapLayerContext } from '../src/app/components/MapContext';

describe('Test Sidebar component', () => {
  const renderSidebar = () => {
    render(
      <MapLayerProvider>
        <Sidebar />
      </MapLayerProvider>
    );
  };

  it('should render collapsed sidebar initially', () => {
    renderSidebar();
    expect(screen.getByAltText('Views')).toBeInTheDocument();
    expect(screen.getByText('Views')).toBeInTheDocument();
    expect(screen.queryByAltText('Default Layer')).not.toBeInTheDocument();
  });

  it('should expand sidebar when clicking toggle button', () => {
    renderSidebar();
    fireEvent.click(screen.getByAltText('Views'));
    expect(screen.getByAltText('Default Layer')).toBeInTheDocument();
    expect(screen.getByAltText('Topographical Layer')).toBeInTheDocument();
    expect(screen.getByAltText('Satellite Layer')).toBeInTheDocument();
  });

  it('should collapse sidebar when clicking toggle button again', () => {
    renderSidebar();
    // Expand the sidebar first
    fireEvent.click(screen.getByAltText('Views'));
    // Collapse it
    fireEvent.click(screen.getByAltText('Collapse'));
    expect(screen.queryByAltText('Default Layer')).not.toBeInTheDocument();
  });

  it('should call setLayer with correct layer name on image click', () => {
    // Custom component to check the layer change
    const LayerChecker: React.FC = () => {
      const { layer } = useMapLayerContext();
      return <span data-testid="current-layer">{layer}</span>;
    };

    const TestComponent = () => (
      <MapLayerProvider>
        <Sidebar />
        <LayerChecker />
      </MapLayerProvider>
    );

    render(<TestComponent />);

    fireEvent.click(screen.getByAltText('Views')); // Expand the sidebar

    // Check each layer click updates the layer value correctly
    fireEvent.click(screen.getByAltText('Default Layer'));
    expect(screen.getByTestId('current-layer')).toHaveTextContent('default');

    fireEvent.click(screen.getByAltText('Topographical Layer'));
    expect(screen.getByTestId('current-layer')).toHaveTextContent('topographical');

    fireEvent.click(screen.getByAltText('Satellite Layer'));
    expect(screen.getByTestId('current-layer')).toHaveTextContent('satellite');
  });
});
