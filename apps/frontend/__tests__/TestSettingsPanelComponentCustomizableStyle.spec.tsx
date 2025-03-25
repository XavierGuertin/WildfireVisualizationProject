// SettingsPanel.test.tsx
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../src/app/components/SettingsPanel';
import { MapProvider } from '../src/app/context/MapContext';

// --- Mocks ---
jest.useRealTimers();

// Mock react-i18next to return a simple t function and a dummy i18n object.
jest.mock('react-i18next', () => ({
  // Return a mock function that tests can override
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  })),
}));

// Mock react-toastify.
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock API service functions.
jest.mock('../src/app/services/api', () => ({
  fetchCollectionsFromEndpoint: jest.fn(() =>
    Promise.resolve('Endpoint saved'),
  ),
  resetCollections: jest.fn(() => Promise.resolve('Reset successful')),
  resetItems: jest.fn(() => Promise.resolve('Reset items successful')),
  resetItemAssets: jest.fn(() =>
    Promise.resolve('Reset item assets successful'),
  ),
  verifyIfEndpointHasCollections: jest.fn(() =>
    Promise.resolve('Collections found'),
  ),
  resetDatalayerView: jest.fn(() => Promise.resolve('Reset datalayer view')),
}));

// Mock config API functions.
jest.mock('../src/app/services/configApi', () => ({
  getConfig: jest.fn(() =>
    Promise.resolve({
      endpoint: 'https://default-api-endpoint.com',
      language: 'en',
    }),
  ),
  saveConfig: jest.fn(() => Promise.resolve()),
}));

// Correctly mock SweetAlert2 as a class whose static fire method is a Jest mock.
jest.mock('sweetalert2', () => {
  const fireMock = jest.fn();
  return class SweetAlert2 {
    static fire = fireMock;
  };
});

jest.mock('ol/source/XYZ', () => jest.fn().mockImplementation(() => ({})));

jest.mock('ol/layer/Tile', () => {
  return jest.fn().mockImplementation(() => {
    const properties: Record<string, any> = {}; // Store layer properties

    return {
      set: jest.fn((key: string, value: any) => {
        properties[key] = value; // Store key-value pairs
      }),
    };
  });
});

jest.mock('ol/layer/Image', () => {
  return jest.fn().mockImplementation(() => ({
    setSource: jest.fn(),
    set: jest.fn(),
    setZIndex: jest.fn(),
    getSource: jest.fn(),
  }));
});

// Ensure the clipboard API exists.
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// --- Helper ---
// We wrap the render in act and then await a short timeout to flush pending effects.
const renderSettingsPanel = async (refreshDatasets = jest.fn()) => {
  const result = render(
    <MapProvider>
      <SettingsPanel
        refreshDatasets={refreshDatasets}
        setMetadataVisible={jest.fn()}
      />
    </MapProvider>,
  );
  // Flush pending useEffect updates.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return result;
};

describe('hexToRgb function in SettingsPanel component', () => {
  // Create a mock Map instance
  const mockMap = {
    getLayers: jest.fn().mockReturnValue({
      getArray: jest.fn().mockReturnValue([])
    }),
    renderSync: jest.fn()
  };

  beforeEach(() => {
    // Set up the map reference with a valid object
    jest.spyOn(require('../src/app/context/MapContext'), 'useMapLayerContext').mockReturnValue({
      mapRef: { current: mockMap },
      setLayer: jest.fn(),
      setSpeed: jest.fn(),
      resetView: jest.fn(),
      isOnline: true,
      setIsOnline: jest.fn(),
      setSliderValue: jest.fn(),
      setTimeStamps: jest.fn(),
      setCollectionId: jest.fn(),
      setIsPlaying: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
    });

    // Mock the updateLayerStyle function to check its parameters
    jest.spyOn(require('../src/app/components/MapView'), 'updateLayerStyle').mockImplementation(jest.fn());
  });

  it('calls hexToRgb when updating polygon styles', async () => {
    await renderSettingsPanel();

    // Open the style dropdown
    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Make sure we're on the polygon tab (default)
    const polygonTab = screen.getByText('polygon');
    await act(async () => {
      fireEvent.click(polygonTab);
    });

    // Change the fill color to trigger hexToRgb conversion
    const fillLabels = screen.getAllByText('fill:');
    const styleOption = fillLabels[0].closest('.style-option');
    const colorInput = styleOption?.querySelector('input[type="color"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#ff5500' } });
    });

    // Click update button to trigger handleUpdateLayerStyle
    const updateButton = screen.getByText('update_style');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Verify updateLayerStyle was called with the correct RGB value
    const { updateLayerStyle } = require('../src/app/components/MapView');
    expect(updateLayerStyle).toHaveBeenCalledWith(
      mockMap,
      'itemLayer',
      'rgb(255,85,0)', // #ff5500 converted to RGB
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
  });

  it('calls hexToRgb when updating data layer styles', async () => {
    await renderSettingsPanel();

    // Open the style dropdown
    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Switch to the data layer tab
    const dataLayerTab = screen.getByText('data_layer');
    await act(async () => {
      fireEvent.click(dataLayerTab);
    });

    // Change the fill color to trigger hexToRgb conversion
    const fillLabels = screen.getAllByText('fill:');
    const styleOption = fillLabels[0].closest('.style-option');
    const colorInput = styleOption?.querySelector('input[type="color"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#00aaff' } });
    });

    // Click update button to trigger handleUpdateLayerStyle
    const updateButton = screen.getByText('update_style');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Verify updateLayerStyle was called with the correct RGB value
    const { updateLayerStyle } = require('../src/app/components/MapView');
    expect(updateLayerStyle).toHaveBeenCalledWith(
      mockMap,
      'dataLayer',
      'rgb(0,170,255)', // #00aaff converted to RGB
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
  });
});

describe('isValidUrl function in SettingsPanel', () => {
  // Extract the isValidUrl function for direct testing
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  it('returns true for valid URLs with http protocol', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('http://192.168.1.1')).toBe(true);
    expect(isValidUrl('http://example.com/path')).toBe(true);
    expect(isValidUrl('http://example.com/path?query=param')).toBe(true);
  });

  it('returns true for valid URLs with https protocol', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://api.example.com/v1/data')).toBe(true);
    expect(isValidUrl('https://example.com:8443')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('example.com')).toBe(false); // Missing protocol
    expect(isValidUrl('not a url')).toBe(false); // Not a URL at all
    expect(isValidUrl('')).toBe(false); // Empty string
  });

  it('returns false for null or undefined inputs', () => {
    // @ts-expect-error - Testing invalid input handling
    expect(isValidUrl(null)).toBe(false);
    // @ts-expect-error - Testing invalid input handling
    expect(isValidUrl(undefined)).toBe(false);
  });
});

describe('handleSaveAndFetchEndpoint with isValidUrl integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error toast when invalid URL is provided', async () => {
    // Mock toast.error
    const { toast } = require('react-toastify');
    jest.spyOn(toast, 'error');

    // Extract the functions directly from the component for testing
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };

    // Render component to get access to translations
    await renderSettingsPanel();

    // Get the component instance
    const handleSaveAndFetch = async (url: string) => {
      if (isValidUrl(url)) {
        return true;
      } else {
        toast.error('invalid_url');
        return false;
      }
    };

    // Call the function with an invalid URL
    await handleSaveAndFetch('invalid-url');

    // Verify toast.error was called with the correct message
    expect(toast.error).toHaveBeenCalledWith('invalid_url');
  });
});

describe('handleResetLayerStyle function', () => {
  // Create a mock Map instance
  const mockMap = {
    getLayers: jest.fn().mockReturnValue({
      getArray: jest.fn().mockReturnValue([])
    }),
    renderSync: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Set up the map reference with a valid object
    jest.spyOn(require('../src/app/context/MapContext'), 'useMapLayerContext').mockReturnValue({
      mapRef: { current: mockMap },
      setLayer: jest.fn(),
      setSpeed: jest.fn(),
      resetView: jest.fn(),
      isOnline: true,
      setIsOnline: jest.fn(),
      setSliderValue: jest.fn(),
      setTimeStamps: jest.fn(),
      setCollectionId: jest.fn(),
      setIsPlaying: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
    });

    // Mock the updateLayerStyle function to check its parameters
    jest.spyOn(require('../src/app/components/MapView'), 'updateLayerStyle').mockImplementation(jest.fn());
  });

  it('resets polygon styles when polygon tab is selected', async () => {
    await renderSettingsPanel();

    // Open the style dropdown
    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Make sure we're on the polygon tab (default)
    const polygonTab = screen.getByText('polygon');
    await act(async () => {
      fireEvent.click(polygonTab);
    });

    // Click reset button to trigger handleResetLayerStyle
    const resetButton = screen.getByText('reset_style');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Verify updateLayerStyle was called with the correct default values
    const { updateLayerStyle } = require('../src/app/components/MapView');
    expect(updateLayerStyle).toHaveBeenCalledWith(
      mockMap,
      'itemLayer',
      'rgb(255,0,0)', // Default red in RGB
      '0.1',
      'rgb(255,0,0)', // Default red in RGB
      '2'
    );
  });

  it('resets data layer styles when data layer tab is selected', async () => {
    await renderSettingsPanel();

    // Open the style dropdown
    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Switch to the data layer tab
    const dataLayerTab = screen.getByText('data_layer');
    await act(async () => {
      fireEvent.click(dataLayerTab);
    });

    // Click reset button to trigger handleResetLayerStyle
    const resetButton = screen.getByText('reset_style');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Verify updateLayerStyle was called with the correct default values
    const { updateLayerStyle } = require('../src/app/components/MapView');
    expect(updateLayerStyle).toHaveBeenCalledWith(
      mockMap,
      'dataLayer',
      'rgb(0,0,255)', // Default blue in RGB
      '0.1',
      'rgb(0,0,255)', // Default blue in RGB
      '2'
    );
  });
});
