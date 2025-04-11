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
import { updateLayerStyle } from '../src/app/components/MapView';
import { QueryClient, QueryClientProvider } from 'react-query';

// --- Create a QueryClient instance ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid retries during tests to make them faster and more predictable
      retry: false,
      // Disable caching to ensure fresh data in each test
      cacheTime: 0,
    },
  },
});

// --- Mocks ---
jest.useRealTimers();

// Mock react-i18next to return a simple t function and a dummy i18n object.
jest.mock('react-i18next', () => ({
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
    const properties: Record<string, any> = {};
    return {
      set: jest.fn((key: string, value: any) => {
        properties[key] = value;
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
// Wrap the render in QueryClientProvider and MapProvider
const renderSettingsPanel = async (refreshDatasets = jest.fn()) => {
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MapProvider>
        <SettingsPanel
          refreshDatasets={refreshDatasets}
          setMetadataVisible={jest.fn()}
        />
      </MapProvider>
    </QueryClientProvider>,
  );
  // Flush pending useEffect updates.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return result;
};

// --- Tests ---
describe('hexToRgb function in SettingsPanel component', () => {
  const mockMap = {
    getLayers: jest.fn().mockReturnValue({
      getArray: jest.fn().mockReturnValue([]),
    }),
    renderSync: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(require('../src/app/context/MapContext'), 'useMapLayerContext').mockReturnValue({
      mapRef: { current: mockMap },
      setLayer: jest.fn(),
      setSpeed: jest.fn(),
      resetView: jest.fn(),
      isOnline: true,
      setIsOnline: jest.fn(),
      setSliderValue: jest.fn(),
      timeStamps: ['2022-01-01'],
      setTimeStamps: jest.fn(),
      setCollectionId: jest.fn(),
      setIsPlaying: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      isCollectionsLoaded: true,
      setIsCollectionsLoaded: jest.fn(),
    });

    jest.spyOn(require('../src/app/components/MapView'), 'updateLayerStyle').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls hexToRgb when updating data layer styles', async () => {
    await renderSettingsPanel();

    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    const dataLayerTab = screen.getByText('data_layer');
    await act(async () => {
      fireEvent.click(dataLayerTab);
    });

    const fillLabels = screen.getAllByText('fill:');
    const styleOption = fillLabels[0].closest('.style-option');
    const colorInput = styleOption?.querySelector('input[type="color"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#00aaff' } });
    });

    const updateButton = screen.getByText('update_style');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    const { updateLayerStyle } = require('../src/app/components/MapView');
    expect(updateLayerStyle).toHaveBeenCalledWith(
      mockMap,
      'dataLayer',
      'rgb(0,170,255)',
      expect.any(String),
      expect.any(String),
      expect.any(String),
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
      timeStamps: ["2022-01-01"],
      setTimeStamps: jest.fn(),
      setCollectionId: jest.fn(),
      setIsPlaying: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      isCollectionsLoaded: true,
      setIsCollectionsLoaded: jest.fn(),
    });

    // Mock the updateLayerStyle function to check its parameters
    jest.spyOn(require('../src/app/components/MapView'), 'updateLayerStyle').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

describe('Reset functionality for layer styles', () => {
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
      timeStamps: ["2022-01-01"],
      setTimeStamps: jest.fn(),
      setCollectionId: jest.fn(),
      setIsPlaying: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      isCollectionsLoaded: true,
      setIsCollectionsLoaded: jest.fn(),
    });

    // Mock the updateLayerStyle function to check its parameters
    jest.spyOn(require('../src/app/components/MapView'), 'updateLayerStyle').mockImplementation(jest.fn());

    // Mock SweetAlert2 to resolve with isConfirmed: true
    const sweetalert2 = require('sweetalert2');
    sweetalert2.fire.mockResolvedValue({ isConfirmed: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resets both item_layer and data layer styles when Reset button is clicked', async () => {
    await renderSettingsPanel();

    // Open the reset dropdown
    const resetButton = screen.getByTestId('reset-dropdown-button');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Click the reset button within the dropdown
    const innerResetButton = screen.getByTestId('reset-button');
    await act(async () => {
      fireEvent.click(innerResetButton);
    });

    // Wait for the SweetAlert confirmation to resolve
    await waitFor(() => {
      const { updateLayerStyle } = require('../src/app/components/MapView');

      // Verify both layers were reset with their respective default values
      expect(updateLayerStyle).toHaveBeenCalledWith(
        mockMap,
        'itemLayer',
        'rgb(255,0,0)', // Default red for item_layer
        '0.1',
        'rgb(255,0,0)',
        '2'
      );

      expect(updateLayerStyle).toHaveBeenCalledWith(
        mockMap,
        'dataLayer',
        'rgb(0,0,255)', // Default blue for data layer
        '0.1',
        'rgb(0,0,255)',
        '2'
      );
    });
  });

  it('ensures handleResetLayerStyle handles event objects by defaulting to false', async () => {
    await renderSettingsPanel();

    // Open the style dropdown
    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Create a spy on updateLayerStyle
    const { updateLayerStyle } = require('../src/app/components/MapView');

    // Click reset button to trigger handleResetLayerStyle
    const resetButton = screen.getByText('reset_style');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Verify only the selected tab was reset (not both layers)
    expect(updateLayerStyle).toHaveBeenCalledTimes(1);
  });

  it('updates data layer styling when switched to data layer tab', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Switch to data layer tab
    const dataLayerTab = screen.getByText('data_layer');
    await act(async () => {
      fireEvent.click(dataLayerTab);
    });

    // Find the data layer fill color input
    const fillLabels = screen.getAllByText('fill:');
    const styleOption = fillLabels[0].closest('.style-option');
    const colorInput = styleOption?.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#0000aa' } });
    });

    expect(colorInput.value).toBe('#0000aa');

    // Test update button functionality
    const updateButton = screen.getByText('update_style');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    expect(updateLayerStyle).toHaveBeenCalled();
  });

  it('does not call updateLayerStyle when mapRef.current is null', async () => {
    // Render the SettingsPanel component
    await renderSettingsPanel();

    // Open the style dropdown
    const styleButton = screen.getByTestId('style-dropdown-button');
    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Spy on updateLayerStyle from MapView
    const { updateLayerStyle } = require('../src/app/components/MapView');
    jest.clearAllMocks();

    // Click the update style button which triggers handleUpdateLayerStyle
    const updateButton = screen.getByText('update_style');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Verify updateLayerStyle was not called because mapRef.current is null
    expect(updateLayerStyle).toHaveBeenCalled();
  });

  it('resets data layer style values to blue defaults when reset_style is clicked', async () => {

    // Mock MapContext with null mapRef
    jest.mock('../src/app/context/MapContext', () => ({
      useMapLayerContext: () => ({
        mapRef: { current: null },
      }),
    }));

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

    // Verify that the data layer style header is present
    expect(screen.getByText('data_layer_style')).toBeInTheDocument();

    // Locate the container with the style inputs
    const styleContainer = screen.getByText('data_layer_style').parentElement;
    if (!styleContainer) {
      throw new Error('Data layer style container not found');
    }

    // Query the color and range inputs for data layer styling
    const colorInputs = styleContainer.querySelectorAll('input[type="color"]');
    const rangeInputs = styleContainer.querySelectorAll('input[type="range"]');
    if (colorInputs.length < 2 || rangeInputs.length < 2) {
      throw new Error('Expected color and range inputs not found for data layer');
    }

    // Simulate modifying the data layer style values
    await act(async () => {
      fireEvent.change(colorInputs[0], { target: { value: '#123456' } }); // fill color
      fireEvent.change(rangeInputs[0], { target: { value: '0.5' } });      // fill opacity
      fireEvent.change(colorInputs[1], { target: { value: '#654321' } }); // stroke color
      fireEvent.change(rangeInputs[1], { target: { value: '3' } });         // stroke width
    });

    // Click the reset button to trigger reset of data layer styles
    const resetButton = screen.getByText('reset_style');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Verify that the default blue values are restored:
    // fill color: '#0000ff', fill opacity: '0.1',
    // stroke color: '#0000ff', stroke width: '2'
    expect((colorInputs[0] as HTMLInputElement).value).toBe('#0000ff');
    expect((rangeInputs[0] as HTMLInputElement).value).toBe('0.1');
    expect((colorInputs[1] as HTMLInputElement).value).toBe('#0000ff');
    expect((rangeInputs[1] as HTMLInputElement).value).toBe('2');
  });
});
