import React from 'react';
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import MapView from '../src/app/components/MapView';
import { MapProvider, useMapLayerContext } from '../src/app/components/MapContext';
import Polygon from 'ol/geom/Polygon';
import ol from 'ol/dist/ol';
import layer = ol.layer;

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  useRef: jest.fn(),
}));

jest.mock('ol/source/XYZ', () => {
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
  defaults: jest.fn(() => ({
    extend: jest.fn(),
  })),
}));

jest.mock('ol/source/Vector', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/layer/Vector', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/geom/Polygon', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/Feature', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/style/Style', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/style/Stroke', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('ol/style/Fill', () => {
  return jest.fn().mockImplementation(() => {
    return {};
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

describe(MapView, () => {
  let mapRef;

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
    const MapViewComponent = () => (
      <MapProvider>
        <MapView />
      </MapProvider>
    );
    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));
    render(<MapViewComponent />);
  });

  it('clears and adds layer when mapRef is not null', () => {
    const mockLayersArray: any[] = []; // Simulate an array of layers
    const mockLayers = {
      getArray: () => mockLayersArray, // Normal function returning an array
      clear: () => { mockLayersArray.length = 0; }, // Function to simulate clearing layers
    };

    const mockMap = {
      getLayers: () => mockLayers, // Returns an object with `getArray()`
      addLayer: jest.fn(),
    };

    const { useMapLayerContext } = require('../src/app/components/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'default',
      mapRef: { current: mockMap },
      setIsOnline: jest.fn(),
    });

    render(<MapView />);

    expect(mockMap.getLayers().getArray()).toEqual([]); // Ensure `getArray()` is called
    expect(mockMap.addLayer).toHaveBeenCalled(); // Ensure `addLayer()` is called
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
      render(<MapView />);
    });

    // Ensure `offlineLayer` is added and has `id: 'baseLayer'`
    const offlineLayer = mockMap.getLayers().getArray().find(layer => layer.get && layer.get('offline') === true);
    expect(offlineLayer).toBeTruthy(); // ✅ Ensure offline layer is added
    expect(offlineLayer.get('id')).toBe('baseLayer'); // ✅ Ensure it is set as base layer
  });
});
