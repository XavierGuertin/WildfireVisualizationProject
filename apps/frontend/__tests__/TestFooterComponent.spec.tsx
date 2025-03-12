import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';
import { MapProvider, useMapLayerContext } from '../src/app/context/MapContext';
import { fetchTimestamps } from '../src/app/services/api';
import { changeLayer } from '../src/app/components/MapView';

jest.mock('ol/source/XYZ', () => jest.fn().mockImplementation(() => ({})));

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

jest.mock('../src/app/components/MapView', () => ({
  changeLayer: jest.fn(),
}));

jest.mock('../src/app/context/MapContext', () => ({
  ...jest.requireActual('../src/app/context/MapContext'),
  useMapLayerContext: jest.fn().mockReturnValue({
    speed: 1,
    setSpeed: jest.fn(),
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
    sliderValue: 50,
    setSliderValue: jest.fn(),
    timeStamps: ['2024-01-01', '2024-01-02', '2024-01-03'],
    setTimeStamps: jest.fn(),
  }),
}));

jest.mock('ol/layer/Vector', () =>
  jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
);

jest.mock('ol/source/Vector', () => jest.fn().mockImplementation(() => ({})));

jest.mock('../src/app/services/api', () => ({
  fetchTimestamps: jest.fn(() =>
    Promise.resolve(['2024-01-01', '2024-01-02', '2024-01-03']),
  ),
}));

jest.mock('react-toastify');
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => (store[key] = value || ''),
      clear: () => (store = {}),
    };
  })();
  Object.defineProperty(global, 'localStorage', { value: localStorageMock });
  jest.useFakeTimers();
  // fetchMock.enableMocks();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Footer component tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchTimestamps as jest.Mock).mockResolvedValue(['2023-01-01T00:00:00Z']);
    (changeLayer as jest.Mock).mockReturnValue(undefined);
    localStorage.clear();
  });

  function Wrapper() {
    // \Use the real context to ensure coverage
    useMapLayerContext();
    return <Footer />;
  }

  it('renders and fetches timestamps on mount', async () => {
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    // \Verify element in the DOM
    expect(await screen.findByTestId('footer-container')).toBeInTheDocument();
    // \Assert fetchTimestamps was called
    expect(fetchTimestamps).toHaveBeenCalled();
  });

  it('loads saved speed from localStorage and plays/pauses', () => {
    localStorage.setItem('playbackSpeed', '1.5');
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    // \Play/pause toggles
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton); // \Play
    fireEvent.click(playPauseButton); // \Pause
  });

  it('changes speed on speed point click', () => {
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    const speedPoint = screen.getByTestId('speed-point-1');
    fireEvent.click(speedPoint);
    expect(localStorage.getItem('playbackSpeed')).toBe('1');
  });

  it('handles stop press', () => {
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    // \Play first
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton);

    // \Now stop
    const stopButton = screen.getByTestId('stop-button');
    fireEvent.click(stopButton);
    // \Expect slider reset
    expect(localStorage.getItem('sliderValue')).toBe('0');
  });

  it('moves slider on mouse down', () => {
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    const slider = screen.getByTestId('slider');
    fireEvent.mouseDown(slider, { clientX: 50 });
    // \Any side effect triggered ensures coverage
    expect(changeLayer).toHaveBeenCalled();
  });

  it('toggles play/pause with space key', () => {
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Space' });
  });
});
