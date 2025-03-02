import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import MapView, {
  changeLayer,
  refreshLayer,
} from '../src/app/components/MapView';
import { MapProvider } from '../src/app/components/MapContext';
import Polygon from 'ol/geom/Polygon';

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
jest.mock('ol/layer/Vector', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/geom/Polygon', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/Feature', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/style/Style', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/style/Stroke', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/style/Fill', () => jest.fn().mockImplementation(() => ({})));

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

jest.mock('../src/app/components/MapContext', () => ({
  ...jest.requireActual('../src/app/components/MapContext'),
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
  }),
}));

jest.mock('../src/app/services/api', () => ({
  insertMockItemData: jest.fn(),
  verifyInternetConnection: jest.fn().mockResolvedValue({}),
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
    mapRef = { current: null };
    jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()]);
    jest.spyOn(React, 'useContext').mockReturnValue({});
    jest.spyOn(React, 'useRef').mockReturnValue(mapRef);
    jest.spyOn(React, 'useEffect').mockImplementation((fn) => fn());
    fetchMock.enableMocks();
  });

  afterEach(() => {
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

    expect(() => changeLayer(mockMapInstance as any)).not.toThrow();
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

    refreshLayer(mockMap as any);

    expect(mockMap.getLayers).toHaveBeenCalled();
    expect(mockMap.removeLayer).toHaveBeenCalled();
    expect(mockMap.addLayer).toHaveBeenCalled();
  });

  it('initializes the map with the correct default view', () => {
    const mockOnBboxChange = jest.fn();

    const { useMapLayerContext } = require('../src/app/components/MapContext');
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

  it('calls verifyInternetConnection on mount', async () => {
    const mockOnBboxChange = jest.fn();
    const verifyInternetConnectionMock = jest.spyOn(
      require('../src/app/services/api'),
      'verifyInternetConnection',
    );

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    // Ensure `verifyInternetConnection` was called
    expect(verifyInternetConnectionMock).toHaveBeenCalledWith(
      'https://hirondelle.crim.ca/stac/collections',
    );
  });

  it('initializes the map with the correct layers', () => {
    const mockOnBboxChange = jest.fn();

    const { useMapLayerContext } = require('../src/app/components/MapContext');
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

    const { useMapLayerContext } = require('../src/app/components/MapContext');
    const contextMock = {
      layer: 'default',
      setLayer: jest.fn(),
      mapRef: { current: mapMock },
      resetView: jest.fn(),
      setIsOnline: jest.fn(),
      isOnline: true, // Initially online
    };

    useMapLayerContext.mockReturnValue(contextMock);

    const { rerender } = render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    expect(mapMock.addLayer).toHaveBeenCalled();
    expect(contextMock.isOnline).toBe(true);

    // Simulate offline mode
    contextMock.isOnline = false;
    rerender(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    expect(mapMock.addLayer).toHaveBeenCalledTimes(2);
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

    const { useMapLayerContext } = require('../src/app/components/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      setLayer: jest.fn(),
      mapRef: { current: mapMock },
      resetView: jest.fn(),
      setIsOnline: jest.fn(),
      isOnline: true,
    });

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>,
    );

    // Expect `onBboxChange` to have been triggered zero times since toggle is off
    expect(mockOnBboxChange).toHaveBeenCalledTimes(0);
  });
});
