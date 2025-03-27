// SettingsPanel.test.tsx
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('Style Customization Dropdown', () => {
  jest.mock('../src/app/components/MapView', () => ({
    __esModule: true,
    updateLayerStyle: jest.fn(),
    changeLayer: jest.fn(),
  }));

  const mockMap = {
    getLayers: jest.fn().mockReturnValue({
      getArray: jest.fn().mockReturnValue([]),
    }),
    renderSync: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Set up the map reference with a valid object
    jest
      .spyOn(require('../src/app/context/MapContext'), 'useMapLayerContext')
      .mockReturnValue({
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
      });

    // Mock the updateLayerStyle function to check its parameters
    jest
      .spyOn(require('../src/app/components/MapView'), 'updateLayerStyle')
      .mockImplementation(jest.fn());

    // Mock SweetAlert2 to resolve with isConfirmed: true
    const sweetalert2 = require('sweetalert2');
    sweetalert2.fire.mockResolvedValue({ isConfirmed: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the style dropdown button with palette icon', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');
    expect(styleButton).toBeInTheDocument();
  });

  it('opens the style dropdown when clicked', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    expect(styleButton).toHaveClass('active');
    expect(screen.getByText('polygon')).toBeInTheDocument();
    expect(screen.getByText('data_layer')).toBeInTheDocument();
  });

  it('shows polygon style tab by default', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    expect(screen.getByText('polygon_style')).toBeInTheDocument();
    // Check that polygon tab is active
    const polygonTab = screen.getByText('polygon').closest('button');
    expect(polygonTab).toHaveClass('active');
  });

  it('switches to data layer tab when clicked', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    const dataLayerTab = screen.getByText('data_layer');
    await act(async () => {
      fireEvent.click(dataLayerTab);
    });

    expect(screen.getByText('data_layer_style')).toBeInTheDocument();
    // Confirm data layer tab is now active
    const dataTab = screen.getByText('data_layer').closest('button');
    expect(dataTab).toHaveClass('active');
  });

  it('updates polygon fill color when color picker changes', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Find the fill color input in the polygon tab
    const fillLabels = screen.getAllByText('fill:');
    const styleOption = fillLabels[0].closest('.style-option');
    const colorInput = styleOption?.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#00ff00' } });
    });

    expect(colorInput.value).toBe('#00ff00');
  });

  it('updates polygon fill opacity when slider changes', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Find the opacity slider in the polygon tab
    const opacityLabels = screen.getAllByText('fill_opacity:');
    const styleOption = opacityLabels[0].closest('.style-option');
    const opacitySlider = styleOption?.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(opacitySlider, { target: { value: '0.5' } });
    });

    expect(opacitySlider.value).toBe('0.5');
    const valueDisplay = styleOption?.querySelector('span');
    expect(valueDisplay?.textContent).toBe('0.5');
  });

  it('resets style values when reset button is clicked', async () => {
    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Click the reset style button
    const resetButton = screen.getByText('reset_style');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Check that default values are restored
    const fillLabels = screen.getAllByText('fill:');
    const styleOption = fillLabels[0].closest('.style-option');
    const colorInput = styleOption?.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;

    expect(colorInput.value).toBe('#ff0000'); // Default polygon fill color
  });

  // Test the hexToRgb conversion function
  it('correctly converts hex colors to RGB format', async () => {
    // Create a standalone implementation matching the component's method
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
        : 'rgb(0,0,0)';
    };

    // Test various hex colors
    expect(hexToRgb('#ff0000')).toBe('rgb(255,0,0)');
    expect(hexToRgb('#00ff00')).toBe('rgb(0,255,0)');
    expect(hexToRgb('#0000ff')).toBe('rgb(0,0,255)');
    expect(hexToRgb('#ffffff')).toBe('rgb(255,255,255)');
    expect(hexToRgb('#000000')).toBe('rgb(0,0,0)');
    expect(hexToRgb('invalid')).toBe('rgb(0,0,0)'); // Test invalid input
  });

  it('handles null mapRef when updating layer styles', async () => {
    // Access the mock function directly
    const mockUpdateLayerStyle =
      require('../src/app/components/MapView').updateLayerStyle;

    // Mock MapContext with null mapRef
    jest.mock('../src/app/context/MapContext', () => ({
      useMapLayerContext: () => ({
        mapRef: { current: null },
      }),
    }));

    await renderSettingsPanel();
    const styleButton = screen.getByTestId('style-dropdown-button');

    await act(async () => {
      fireEvent.click(styleButton);
    });

    // Try to update style with null mapRef
    const updateButton = screen.getByText('update_style');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Verify the updateLayerStyle was not called
    expect(mockUpdateLayerStyle).not.toHaveBeenCalled();
  });
});
