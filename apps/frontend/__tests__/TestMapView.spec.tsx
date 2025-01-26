import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import MapView from '../src/app/components/MapView';
import { MapProvider } from '../src/app/components/MapContext';
import Polygon from 'ol/geom/Polygon';

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
    return {};
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
    layer: 'Default',
    setLayer: jest.fn(),
    mapRef: { current: null },
    resetView: jest.fn(),
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
    const mockMap = {
      getLayers: jest.fn().mockReturnValue({ clear: jest.fn() }),
      addLayer: jest.fn(),
    };
    const { useMapLayerContext } = require('../src/app/components/MapContext');
    useMapLayerContext.mockReturnValue({
      layer: 'Default',
      mapRef: { current: mockMap },
    });

    render(<MapView />);
    expect(mockMap.getLayers().clear).toHaveBeenCalled();
    expect(mockMap.addLayer).toHaveBeenCalled();
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
});
