import React from 'react';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import MapView from '../src/app/components/MapView';
import { MapProvider } from '../src/app/components/MapContext';
import Polygon from 'ol/geom/Polygon';
import ol from 'ol/dist/ol';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  useRef: jest.fn(),
}));

jest.mock('ol/source/XYZ', () => jest.fn().mockImplementation(() => ({})));
jest.mock('ol/layer/Tile', () => jest.fn().mockImplementation(() => ({
  set: jest.fn(),
  get: jest.fn(),
  getSource: jest.fn(),
})));

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
    }
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
    const eventListeners: Record<string, Function[]> = {};

    return {
      getView: jest.fn(() => ({
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
        }
      })),
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
    mapRef: { current: null },
    resetView: jest.fn(),
    setIsOnline: jest.fn(),
    isOnline: true,
  }),
}));

jest.mock('../src/app/services/api', () => ({
  insertMockItemData: jest.fn(),
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

  it('renders with null mapRef', () => {
    const mockOnBboxChange = jest.fn();
    const mockMapInstance = new (require('ol/Map'))();

    const { useMapLayerContext } = require('../src/app/components/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      setLayer: jest.fn(),
      mapRef: { current: mockMapInstance },
      resetView: jest.fn(),
    });

    render(
      <MapProvider>
        <MapView onBboxChange={mockOnBboxChange} />
      </MapProvider>
    );

    expect(mockMapInstance.getView).toHaveBeenCalled();
  });

  it('calls insertMockItemData on mount', () => {
    const { insertMockItemData } = require('../src/app/services/api');
    render(<MapView onBboxChange={jest.fn()} />);
    expect(insertMockItemData).toHaveBeenCalled();
  });

  it('removes and adds the correct base layer when layer changes', () => {
    const mockMapInstance = new (require('ol/Map'))();
    const mockGetArray = jest.fn(() => [
      { get: jest.fn(() => 'baseLayer'), set: jest.fn() },
    ]);

    mockMapInstance.getLayers.mockReturnValue({ getArray: mockGetArray });

    const { useMapLayerContext } = require('../src/app/components/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'topographical',
      mapRef: { current: mockMapInstance },
    });

    render(<MapView onBboxChange={jest.fn()} />);

    expect(mockMapInstance.removeLayer).toHaveBeenCalled();
    expect(mockMapInstance.addLayer).toHaveBeenCalled();
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

  it('renders the offline layer when isOnline is false', () => {
    let mockLayersArray: any[] = []; // Simulate an array of layers
    const mockLayers = {
      getArray: () => mockLayersArray, // Retrieve layers
      clear: () => { mockLayersArray.length = 0; }, // Clear layers
    };
    const mockOnBboxChange = jest.fn();

    const mockMap = {
      getLayers: () => mockLayers,
      addLayer: jest.fn((layer) => {
        mockLayersArray.push(layer); // Track added layers
      }),
      removeLayer: jest.fn((layer) => {
        mockLayersArray = mockLayersArray.filter(l => l !== layer);
      }),
    };

    // Mock `useRef` to return our mock map
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockMap });

    const { useMapLayerContext } = require('../src/app/components/MapContext');

    useMapLayerContext.mockReturnValue({
      layer: 'default',
      mapRef: { current: mockMap },
      setIsOnline: jest.fn(),
      isOnline: false, // Simulating offline mode
    });

    // Render inside `act()` to ensure updates are applied
    act(() => {
      render(<MapView onBboxChange={mockOnBboxChange}/>);
    });

    // Ensure `offlineLayer` is added and has `id: 'baseLayer'`
    const offlineLayer = mockMap.getLayers().getArray().find(layer => layer.get && layer.get('offline') === true);
    expect(offlineLayer).toBeTruthy(); // ✅ Ensure offline layer is added
    expect(offlineLayer.get('id')).toBe('baseLayer'); // ✅ Ensure it is set as base layer
  });

  it('calls onBboxChange when the view changes (zoom/pan)', () => {
    const mockMapInstance = new (require('ol/Map'))();
    const mockOnBboxChange = jest.fn();
  
    const { useMapLayerContext } = require('../src/app/components/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      mapRef: { current: mockMapInstance },
    });
  
    render(<MapView onBboxChange={mockOnBboxChange} />);
  
    act(() => {
      const view = mockMapInstance.getView();
      view.trigger('change:resolution');
      view.trigger('change:center');
    });
  
    expect(mockOnBboxChange).toHaveBeenCalledTimes(2);
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
});
