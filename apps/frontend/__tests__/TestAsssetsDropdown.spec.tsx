import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetsDropdown from '../src/app/components/AssetsDropdown';
import { useMapLayerContext } from '../src/app/context/MapContext';
import { toggleAssetLayer } from '../src/app/components/MapView';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

jest.mock('../src/app/context/MapContext', () => ({
  useMapLayerContext: jest.fn(),
}));

jest.mock('../src/app/components/MapView', () => ({
  toggleAssetLayer: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockMap = {
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  getView: jest.fn(() => ({
    setCenter: jest.fn(),
    setZoom: jest.fn(),
  })),
};

describe('AssetsDropdown component', () => {
  const mockContext = {
    mapRef: { current: mockMap },
    loadedLayers: [
      { asset_name: 'humidity', layer_url: 'humidity-url', min: 0, max: 100 },
      { asset_name: 'wind_force', layer_url: 'wind-url', min: 0, max: 100 },
    ],
    selectedAssetLayers: [],
    setSelectedAssetLayers: jest.fn(),
    loadedDatasetTitle: 'dataset-2025',
    itemIds: [],
    sliderValue: 0,
    t: (str: string) => str,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMapLayerContext as jest.Mock).mockReturnValue(mockContext);
  });

  it('renders dropdown header and dataset ID', () => {
    render(<AssetsDropdown />);
    expect(screen.getByText('weather_assets_label')).toBeInTheDocument();
    expect(screen.getByText('dataset-2025')).toBeInTheDocument();
  });

  it('toggles asset menu on header click', () => {
    render(<AssetsDropdown />);
    const header = screen.getByText('weather_assets_label');
    fireEvent.click(header); // open
    expect(screen.getByTestId('layerButton-humidity')).toBeInTheDocument();
    fireEvent.click(header); // close
    expect(
      screen.queryByTestId('layerButton-humidity'),
    ).not.toBeInTheDocument();
  });

  it('calls toggleAssetLayer and updates selection on click', () => {
    const setSelectedAssetLayers = jest.fn();
    (useMapLayerContext as jest.Mock).mockReturnValue({
      ...mockContext,
      selectedAssetLayers: [],
      setSelectedAssetLayers,
    });

    render(<AssetsDropdown />);
    const header = screen.getByText('weather_assets_label');
    fireEvent.click(header); // Open menu

    const layerButton = screen.getByTestId('layerButton-humidity');
    fireEvent.click(layerButton);

    expect(toggleAssetLayer).toHaveBeenCalledWith(
      mockMap,
      'humidity',
      'humidity-url',
      true,
      0,
      100
    );
    expect(setSelectedAssetLayers).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('removes selected layer when clicked again', () => {
    const setSelectedAssetLayers = jest.fn();
    (useMapLayerContext as jest.Mock).mockReturnValue({
      ...mockContext,
      selectedAssetLayers: ['humidity'],
      setSelectedAssetLayers,
    });

    render(<AssetsDropdown />);
    fireEvent.click(screen.getByText('weather_assets_label'));

    const layerButton = screen.getByTestId('layerButton-humidity');
    fireEvent.click(layerButton);

    expect(toggleAssetLayer).toHaveBeenCalledWith(
      mockMap,
      'humidity',
      'humidity-url',
      false,
      0,
      100
    );
    expect(setSelectedAssetLayers).toHaveBeenCalledWith(expect.any(Function));
  });

  it('handles missing mapRef with toast error', () => {
    (useMapLayerContext as jest.Mock).mockReturnValue({
      ...mockContext,
      mapRef: { current: null },
    });

    render(<AssetsDropdown />);
    fireEvent.click(screen.getByText('weather_assets_label'));
    fireEvent.click(screen.getByTestId('layerButton-humidity'));

    expect(toast.error).toHaveBeenCalledWith('Map not initialized');
  });

  it('handles missing layer URL with toast error', () => {
    const badLayer = {
      asset_name: 'bad_layer',
      layer_url: null,
    };
    (useMapLayerContext as jest.Mock).mockReturnValue({
      ...mockContext,
      loadedLayers: [badLayer],
    });

    render(<AssetsDropdown />);
    fireEvent.click(screen.getByText('weather_assets_label'));
    fireEvent.click(screen.getByTestId('layerButton-bad_layer'));

    expect(toast.error).toHaveBeenCalledWith(
      'Layer URL not found for bad_layer',
    );
  });

  it('renders icons correctly', () => {
    render(<AssetsDropdown />);
    fireEvent.click(screen.getByText('weather_assets_label'));
  
    const button = screen.getByTestId('layerButton-humidity');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
  
});
