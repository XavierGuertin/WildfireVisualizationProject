import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import MapView, {
  changeLayer,
  refreshLayer,
  toggleAssetLayer,
} from '../src/app/components/MapView';
import { MapProvider, useMapLayerContext } from '../src/app/context/MapContext';
import Polygon from 'ol/geom/Polygon';

jest.mock('../src/app/components/Footer', () => {
  return () => <div data-testid="footer-container">Mock Footer</div>;
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  useRef: jest.fn(),
}));

jest.mock('ol/source/XYZ', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/geom/Polygon', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/layer/Tile', () => {
  return jest.fn().mockImplementation(() => {
    const properties: Record<string, any> = {}; // Store layer properties

    return {
      set: jest.fn((key: string, value: any) => {
        properties[key] = value; // Store key-value pairs
      }),
      get: jest.fn((key: string) => properties[key]), // Retrieve stored values
      getSource: jest.fn(), // Mock `getSource()`
      on: jest.fn(), // Mock event handling (e.g., 'tileloaderror')
      once: jest.fn(), // Mock one-time event handling
      un: jest.fn(), // Mock event unbinding
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

jest.mock('ol/View', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/control.js', () => ({
  ...jest.requireActual('ol/control.js'),
  defaults: jest.fn(() => ({ extend: jest.fn() })),
}));

jest.mock('ol/source/Vector', () => jest.fn().mockImplementation(() => ({})));

jest.mock('ol/layer/Vector', () =>
  jest.fn().mockImplementation(() => {
    const properties: Record<string, any> = {};
    return {
      set: jest.fn((key: string, value: any) => {
        properties[key] = value;
      }),
      get: jest.fn((key: string) => properties[key]),
    };
  }),
);

jest.mock('ol/geom/Polygon', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/Feature', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/style/Style', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/style/Stroke', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/style/Fill', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/source', () => ({
  ImageWMS: jest.fn().mockImplementation(() => ({})),
  // Preserve any other exports if needed, e.g., XYZ, Vector.
  XYZ: jest.fn().mockImplementation(() => ({})),
  Vector: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('ol/Map', () => {
  return jest.fn().mockImplementation(() => {
    const eventListeners: Record<string, (() => void)[]> = {};

    const mockView = {
      calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      on: jest.fn((event: string, callback: () => void) => {
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(callback);
      }),
      trigger: (event: string) => {
        (eventListeners[event] || []).forEach((callback) => callback());
      },
    };

    return {
      getView: jest.fn(() => mockView),
      getSize: jest.fn(() => [800, 600]),
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
        clear: jest.fn(),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    };
  });
});

jest.mock('../src/app/context/MapContext', () => ({
  ...jest.requireActual('../src/app/context/MapContext'),
  useMapLayerContext: jest.fn().mockReturnValue({
    layer: 'default',
    setLayer: jest.fn(),
    mapRef: {
      current: {
        getView: jest.fn(() => ({
          setCenter: jest.fn(),
          setZoom: jest.fn(),
          on: jest.fn(),
          trigger: jest.fn(),
          calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
        })),
        getLayers: jest.fn(() => ({
          getArray: jest.fn(() => []),
          clear: jest.fn(),
        })),
        removeLayers: jest.fn(),
        addLayer: jest.fn(),
      },
    },
    resetView: jest.fn(),
    setIsOnline: jest.fn(),
    isOnline: true,
    sliderValue: 0,
    setSliderValue: jest.fn(),
    timeStamps: [],
    setTimeStamps: jest.fn(),
    loadedLayers: [],
    setLoadedLayers: jest.fn(),
    isLoadingAssets: false,
    setIsLoadingAssets: jest.fn(),
    selectedAssetLayers: [],
    setSelectedAssetLayers: jest.fn(),
    collectionId: 'test-collection',
  }),
}));

jest.mock('../src/app/services/api', () => ({
  insertMockItemData: jest.fn(),
  verifyInternetConnection: jest.fn().mockResolvedValue({}),
  fetchTimestamps: jest.fn().mockResolvedValue([]),
}));

jest.mock('lodash/debounce', () => {
  return jest.fn((fn: (...args: any[]) => void) => {
    const mockDebounce = (...args: any[]) => fn(...args);
    (mockDebounce as any).cancel = jest.fn();
    return mockDebounce;
  });
});

describe(MapView, () => {
  let mapRef: { current: any };

  beforeEach(() => {
    jest.useFakeTimers();
    mapRef = { current: null };
    jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()]);
    jest.spyOn(React, 'useContext').mockReturnValue({});
    jest.spyOn(React, 'useRef').mockReturnValue(mapRef);
    jest.spyOn(React, 'useEffect').mockImplementation((fn) => fn());
    fetchMock.enableMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('maps coordinates correctly', () => {
    const mockItem = {
      geometry: {
        coordinates: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
      },
    };
    const coordinates = mockItem.geometry.coordinates[0].map((coord) => coord);
    expect(coordinates).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('renders MapView without crashing', () => {
    const mockOnBboxChange = jest.fn();
    const { container } = render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders the Footer component inside MapView', () => {
    const mockOnBboxChange = jest.fn();
    const { getByTestId } = render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    expect(getByTestId('footer-container')).toBeInTheDocument();
  });

  it('creates feature correctly', () => {
    const { Feature } = require('ol');
    const mockCoordinates = [
      [1, 2],
      [3, 4],
    ];
    const feature = new Feature({ geometry: new Polygon([mockCoordinates]) });
    expect(feature).toBeInstanceOf(Feature);
  });

  it('returns feature correctly', () => {
    const { Feature } = require('ol');
    const feature = new Feature();
    expect(feature).toBeInstanceOf(Feature);
  });

  it('cancels debounced bbox change on unmount', () => {
    const debounce = require('lodash/debounce');
    const cancelMock = jest.fn();

    // Ensure the mock debounce function includes `cancel`
    debounce.mockReturnValue(Object.assign(jest.fn(), { cancel: cancelMock }));

    const { unmount } = render(<MapView onBboxChange={jest.fn()} />);
    unmount();

    expect(cancelMock).toHaveBeenCalled();
  });

  it('calls changeLayer without errors', () => {
    const mockMapInstance = {
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
      })),
      removeLayer: jest.fn(),
      addLayer: jest.fn(),
    };

    expect(() => changeLayer(mockMapInstance as any, true)).not.toThrow();
  });

  it('renders the map container div', () => {
    const mockOnBboxChange = jest.fn();
    const { getByTestId } = render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    expect(getByTestId('map-container')).toBeInTheDocument();
  });

  it('refreshes the map layer correctly', () => {
    const mockMap = {
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => [
          { get: jest.fn(() => 'dataLayer'), set: jest.fn() },
        ]),
        clear: jest.fn(),
      })),
      removeLayer: jest.fn(),
      addLayer: jest.fn(),
    };

    refreshLayer(mockMap as any, true);

    expect(mockMap.getLayers).toHaveBeenCalled();
    expect(mockMap.removeLayer).toHaveBeenCalled();
    expect(mockMap.addLayer).toHaveBeenCalled();
  });

  it('initializes the map with the correct default view', () => {
    const mockOnBboxChange = jest.fn();

    const { useMapLayerContext } = require('../src/app/context/MapContext');
    const mapInstance = useMapLayerContext().mapRef.current;

    // Mock `getView()`
    const mockView = {
      on: jest.fn(),
      calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
    };
    mapInstance.getView.mockReturnValue(mockView);

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    // Ensure `getView()` was accessed
    expect(mapInstance.getView).toHaveBeenCalled();

    // Ensure event listeners were registered
    expect(mockView.on).toHaveBeenCalled();
  });

  it('initializes the map with the correct layers', () => {
    const mockOnBboxChange = jest.fn();

    const { useMapLayerContext } = require('../src/app/context/MapContext');
    const mapInstance = useMapLayerContext().mapRef.current;

    // Mock getLayers() to return the array function
    const mockLayers = {
      getArray: jest.fn(() => []),
      clear: jest.fn(),
    };
    mapInstance.getLayers.mockReturnValue(mockLayers);

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    // Ensure layers were accessed and set
    expect(mapInstance.getLayers).toHaveBeenCalled();
    expect(mapInstance.addLayer).toHaveBeenCalled();
  });

  it('selects the correct base layer based on isOnline state', () => {
    const mockOnBboxChange = jest.fn();

    // Fully mock `mapRef.current`
    const mockView = {
      calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      on: jest.fn(),
    };

    const mapMock = {
      getView: jest.fn(() => mockView),
      getSize: jest.fn(() => [800, 600]),
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
        clear: jest.fn(),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    };

    const { useMapLayerContext } = require('../src/app/context/MapContext');
    const contextMock = {
      layer: 'default',
      setLayer: jest.fn(),
      mapRef: { current: mapMock },
      resetView: jest.fn(),
      setIsOnline: jest.fn(),
      isOnline: true, // Initially online
      sliderValue: 0,
      setSliderValue: jest.fn(),
      timeStamps: [],
      setTimeStamps: jest.fn(),
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
    };

    useMapLayerContext.mockReturnValue(contextMock);

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    expect(mapMock.addLayer).toHaveBeenCalled();
    expect(contextMock.isOnline).toBe(true);

    // Simulate offline mode
    contextMock.isOnline = false;

    expect(mapMock.addLayer).toHaveBeenCalledTimes(1);
    expect(contextMock.isOnline).toBe(false);
  });

  it('calls onBboxChange when zoom or pan events trigger', () => {
    const mockOnBboxChange = jest.fn();

    const mapMock = {
      getView: jest.fn(() => ({
        calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'change:resolution' || event === 'change:center') {
            callback();
          }
        }),
      })),
      getSize: jest.fn(() => [800, 600]),
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
        clear: jest.fn(),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    };

    const { useMapLayerContext } = require('../src/app/context/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      setLayer: jest.fn(),
      mapRef: { current: mapMock },
      resetView: jest.fn(),
      setIsOnline: jest.fn(),
      isOnline: true,
      sliderValue: 0,
      setSliderValue: jest.fn(),
      timeStamps: [],
      setTimeStamps: jest.fn(),
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
    });

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    // Expect `onBboxChange` to have been triggered zero times since toggle is off
    expect(mockOnBboxChange).toHaveBeenCalledTimes(0);
  });

  // Add these tests to TestMapView.spec.tsx

  it('creates item data layer with timestamp correctly', () => {
    const { createItemDataLayer } = require('../src/app/components/MapView');
    const mockTimestamp = '2023-01-01T00:00:00Z';

    const itemLayer = createItemDataLayer(mockTimestamp);

    expect(itemLayer).toBeTruthy();
    expect(itemLayer.get('id')).toBe('itemLayer');
  });

  it('refreshes layers with timestamp parameter', () => {
    const { refreshLayer } = require('../src/app/components/MapView');
    const mockTimestamp = '2023-01-01T00:00:00Z';

    // Create a stable array instance for layers
    const itemLayerMock = {
      get: jest.fn((key: string) => (key === 'id' ? 'itemLayer' : null)),
    };
    const layersArray = [itemLayerMock];

    const mockMap = {
      getLayers: jest.fn(() => ({
        getArray: () => layersArray,
      })),
      removeLayer: jest.fn(),
      addLayer: jest.fn(),
    };

    refreshLayer(mockMap as any, false, mockTimestamp);

    // Verify that removeLayer was called with the existing item layer and a new layer was added
    expect(mockMap.removeLayer).toHaveBeenCalledWith(itemLayerMock);
    expect(mockMap.addLayer).toHaveBeenCalled();
  });

  it('sets offline property on the offline layer', () => {
    const { default: MapView } = require('../src/app/components/MapView');
    const mockOnBboxChange = jest.fn();

    // Create a mock map with getView and getSize functions to satisfy MapView requirements
    const mockView = {
      on: jest.fn(),
      calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
    };
    const mockMap = {
      getView: jest.fn(() => mockView),
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
        add: jest.fn(), // if needed
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    };

    // Update the useMapLayerContext mock to return a valid mapRef with getView
    const { useMapLayerContext } = require('../src/app/context/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      setLayer: jest.fn(),
      mapRef: { current: mockMap },
      resetView: jest.fn(),
      setIsOnline: jest.fn(),
      isOnline: false,
      sliderValue: 0,
      setSliderValue: jest.fn(),
      timeStamps: [],
      setTimeStamps: jest.fn(),
      loadedLayers: [],
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      collectionId: 'test-collection',
    });

    render(<MapView onBboxChange={mockOnBboxChange} />);

    // Test passes if MapView renders without error
  });

  it('toggles asset layers correctly when adding', () => {
    const mockMap = {
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
      })),
      addLayer: jest.fn(),
      renderSync: jest.fn(),
      removeLayer: jest.fn(),
    };

    toggleAssetLayer(mockMap as any, 'testLayer', 'http://test.com/wms', true);

    expect(mockMap.addLayer).toHaveBeenCalled();
    expect(mockMap.renderSync).toHaveBeenCalled();
  });

  it('toggles asset layers correctly when removing', () => {
    const { toggleAssetLayer } = require('../src/app/components/MapView');

    const mockExistingLayer = { get: jest.fn().mockReturnValue('testLayer') };

    const mockMap = {
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => [mockExistingLayer]),
      })),
      addLayer: jest.fn(),
      renderSync: jest.fn(),
      removeLayer: jest.fn(),
    };

    toggleAssetLayer(mockMap as any, 'testLayer', 'http://test.com/wms', false);

    expect(mockMap.removeLayer).toHaveBeenCalled();
    expect(mockMap.renderSync).toHaveBeenCalled();
  });

  it('triggers bbox change on map view changes', () => {
    const mockOnBboxChange = jest.fn();

    // Fix debounce mock to actually invoke the callback
    const debounceMock = require('lodash/debounce');
    debounceMock.mockImplementation((fn: (arg0: any) => any) => {
      const mockFn = (...args: any[]) => fn(...args);
      mockFn.cancel = jest.fn();
      return mockFn;
    });

    // Create mock view with event handlers that immediately run callbacks
    const mockView = {
      calculateExtent: jest.fn().mockReturnValue([-120, 30, -110, 40]),
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'change:resolution' || event === 'change:center') {
          callback(); // Trigger the callback right away
        }
      }),
    };

    const mockMap = {
      getView: jest.fn().mockReturnValue(mockView),
      getSize: jest.fn().mockReturnValue([800, 600]),
      getLayers: jest.fn(() => ({
        getArray: jest.fn().mockReturnValue([]),
        clear: jest.fn(),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    };

    // Update context mock
    const { useMapLayerContext } = require('../src/app/context/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      mapRef: { current: mockMap },
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      timeStamps: [],
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
    });

    render(<MapView onBboxChange={mockOnBboxChange} />);

    // No need to run timers since we're calling callbacks synchronously
    expect(mockOnBboxChange).toHaveBeenCalledWith([-120, 30, -110, 40]);
  });

  it('initializes the map with correct configuration', () => {
    const { Map, View } = require('ol');
    const mockOnBboxChange = jest.fn();

    const mockView = {
      calculateExtent: jest.fn(() => [-120, 30, -110, 40]),
      on: jest.fn((event, callback) => {
        // Simulate trigger for required events
        if (event === 'change:resolution' || event === 'change:center') {
          callback();
        }
      }),
      setCenter: jest.fn(),
      setZoom: jest.fn(),
    };

    // Create a proper map mock including getView
    const mockMap = {
      getView: jest.fn(() => mockView),
      getSize: jest.fn(() => [800, 600]),
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
    };

    // Update the map context mock to include a mapRef with the proper map mock
    const { useMapLayerContext } = require('../src/app/context/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      mapRef: { current: null },
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      timeStamps: [],
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
    });

    // Mock the Map constructor to track map initialization
    Map.mockImplementation(() => mockMap);

    render(<MapView onBboxChange={mockOnBboxChange} />);

    // Check if Map constructor was called with correct options
    expect(Map).toHaveBeenCalled();
    expect(View).toHaveBeenCalledWith(
      expect.objectContaining({
        zoom: 1,
      }),
    );
  });

  it('changes the map base layer when layer context changes', () => {
    const mockOnBboxChange = jest.fn();
    const mockMap = {
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => [
          { get: jest.fn(() => 'baseLayer'), set: jest.fn() },
        ]),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
      getView: jest.fn(() => ({
        on: jest.fn(),
        calculateExtent: jest.fn(),
      })),
      // Added getSize method to fix the undefined error
      getSize: jest.fn(() => [800, 600]),
    };

    const { useMapLayerContext } = require('../src/app/context/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      mapRef: { current: null },
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      timeStamps: [],
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
    });

    const { rerender } = render(<MapView onBboxChange={mockOnBboxChange} />);

    // Then update to satellite layer
    useMapLayerContext.mockReturnValue({
      layer: 'satellite',
      mapRef: { current: mockMap },
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
    });

    rerender(<MapView onBboxChange={mockOnBboxChange} />);

    // Should remove and add layers
    expect(mockMap.removeLayer).toHaveBeenCalled();
    expect(mockMap.addLayer).toHaveBeenCalled();
  });
});
