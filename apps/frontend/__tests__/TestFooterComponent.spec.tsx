import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';
import { toast } from 'react-toastify';
import { MapProvider, useMapLayerContext } from '../src/app/context/MapContext';

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

const mockSetSliderValue = jest.fn();
const mockSetSpeed = jest.fn();
const mockSetTimeStamps = jest.fn();

const defaultContextValue = {
  mapRef: { current: {} },
  timeStamps: ['2023-01-01T00:00:00Z', '2023-01-02T00:00:00Z'],
  sliderValue: 0,
  speed: 1,
  setSliderValue: mockSetSliderValue,
  setSpeed: mockSetSpeed,
  setTimeStamps: mockSetTimeStamps,
  // Include other properties used by Footer
};

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
    sliderValue: 50,
    setSliderValue: mockSetSliderValue,
    timeStamps: ["2024-01-01", "2024-01-02", "2024-01-03"],
    setTimeStamps: jest.fn(),
    setSpeed: mockSetSpeed, // Use the mockSetSpeed here
    speed: 1
  }),
}));

jest.mock('ol/layer/Vector', () =>
  jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  }))
);

jest.mock('ol/source/Vector', () => jest.fn().mockImplementation(() => ({})));

jest.mock('../src/app/services/api', () => ({
  fetchTimestamps: jest.fn(() =>
    Promise.resolve(["2024-01-01", "2024-01-02", "2024-01-03"])
  ),
}));

jest.mock('react-toastify');
beforeEach(() => {
  mockSetSpeed.mockClear();

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

describe('Footer component', () => {
  it('renders the footer with initial elements', () => {
    render(<MapProvider><Footer /></MapProvider>);

    // Verify speed points
    [0.5, 1, 1.5, 2, 4].forEach((speed) => {
      expect(screen.getByTestId(`speed-point-${speed}`)).toBeInTheDocument();
    });

    expect(screen.getByTestId('slider')).toBeInTheDocument();
    expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
    expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
  });

  it('toggles play and pause states correctly', () => {
    render(<MapProvider><Footer /></MapProvider>);

    const playPauseButton = screen.getByTestId('play-pause-button');
    act(() => {
      fireEvent.click(playPauseButton);
    });
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();

    act(() => {
      fireEvent.click(playPauseButton);
    });
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
  });

  // Additional test for keyboard controls
  it('handles spacebar to toggle play/pause', () => {
    render(<MapProvider><Footer /></MapProvider>);

    expect(screen.getByTestId('play-icon')).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(document, { code: 'Space' });
    });

    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
  });

  it('should display toast message when default speed is used (no speed in localStorage)', async () => {
    render(<MapProvider><Footer /></MapProvider>);

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith('default_speed_retrieved', { toastId: 'speed-default' }));
  });
});
