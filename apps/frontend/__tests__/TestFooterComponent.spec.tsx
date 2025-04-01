import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';
import { MapProvider, useMapLayerContext } from '../src/app/context/MapContext';
import {
  fetchTimestamps,
  getLoadedLayers,
  loadAssetLayers,
  loadAssets,
  resetItemAssets,
} from '../src/app/services/api';
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

jest.mock('ol/layer/Image', () => {
  return jest.fn().mockImplementation(() => ({
    setSource: jest.fn(),
    set: jest.fn(),
    setZIndex: jest.fn(),
    getSource: jest.fn(),
  }));
});

jest.mock('../src/app/components/MapView', () => ({
  ...jest.requireActual('../src/app/components/MapView'),
  changeLayer: jest.fn(),
  refreshLayer: jest.fn(),
  removeAllAssetLayers: jest.fn(),
  toggleAssetLayer: jest.fn(),
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
    sliderValue: 0,
    setSliderValue: jest.fn(),
    timeStamps: ['2024-01-01', '2024-01-02', '2024-01-03'],
    setTimeStamps: jest.fn(),
    loadedLayers: [],
    setLoadedLayers: jest.fn(),
    isLoadingAssets: false,
    setIsLoadingAssets: jest.fn(),
    selectedAssetLayers: [],
    setSelectedAssetLayers: jest.fn(),
    loadedTimestamp: null,
    setLoadedTimestamp: jest.fn(),
    isPlaying: false,
    setIsPlaying: jest.fn(),
    itemIds: ['item-id-1', 'item-id-2'],
    setItemIds: jest.fn(),
    isProcessLoading: false,
  }),
}));

jest.mock('ol/layer/Vector', () =>
  jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
);

jest.mock('ol/source/Vector', () => jest.fn().mockImplementation(() => ({})));

jest.mock('../src/app/services/api', () => ({
  fetchTimestamps: jest.fn(() => Promise.resolve(['2023-05-15T14:30:45Z'])),
  fetchItemIds: jest.fn(() => Promise.resolve(['item-id-1', 'item-id-2'])),
  getLoadedLayers: jest.fn(() => Promise.resolve({ error: 'mock error' })),
  loadAssetLayers: jest.fn(() => Promise.resolve({})),
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

  it('loads saved speed from localStorage and plays/pauses', async () => {
    localStorage.setItem('playbackSpeed', '1.5');
    render(
      <MapProvider>
        <Wrapper />
      </MapProvider>,
    );

    // \Play/pause toggles
    const playPauseButton = screen.getByTestId('play-pause-button');
    await act(async () => {
      fireEvent.click(playPauseButton); // Play
    });
    await act(async () => {
      fireEvent.click(playPauseButton); // Pause
    });
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

  it('covers dragging logic', () => {
    render(
      <MapProvider>
        <Footer />
      </MapProvider>,
    );

    const slider = screen.getByTestId('slider');
    fireEvent.mouseDown(slider, { clientX: 100 }); // trigger isDraggingRef.current = true
    fireEvent.mouseMove(window, { clientX: 150 }); // if (isDraggingRef.current) { handleSliderMove(e); }
    fireEvent.mouseUp(window); // isDraggingRef.current = false
  });

  it('properly handles slider dragging states and event listeners', () => {
    // Spy on document event listeners
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    // Clear previous calls to changeLayer
    (changeLayer as jest.Mock).mockClear();

    render(
      <MapProvider>
        <Footer />
      </MapProvider>,
    );

    const slider = screen.getByTestId('slider');

    // Start dragging
    fireEvent.mouseDown(slider, { clientX: 100 });

    // Verify event listeners were added for mousemove and mouseup
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );

    // Simulate mouse movement during drag
    fireEvent.mouseMove(document, { clientX: 150 });

    // Verify slider movement triggered changeLayer
    expect(changeLayer).toHaveBeenCalled();

    // Reset mock to check future calls
    (changeLayer as jest.Mock).mockClear();

    // End dragging
    fireEvent.mouseUp(document);

    // Verify event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );

    fireEvent.mouseMove(document, { clientX: 200 });
    expect(changeLayer).toHaveBeenCalled();

    // Clean up spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});

describe('Line coverage in Footer', () => {
  beforeEach(() => {
    localStorage.setItem('selectedDatasetId', 'testCollection');
  });

  it('calls changeLayer in useEffect if timeStamps is not empty (lines ~358–362)', () => {
    (useMapLayerContext as jest.Mock).mockReturnValue({
      mapRef: { current: {} }, // Valid map object
      timeStamps: ['2023-01-01T00:00:00Z'],
      sliderValue: 0,
      setSliderValue: jest.fn(),
      setTimeStamps: jest.fn(),
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      speed: 1,
      setSpeed: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      loadedLayers: [],
      loadedTimestamp: null,
      setLoadedTimestamp: jest.fn(),
      collectionId: 'testCollection',
      itemIds: [],
      setItemIds: jest.fn(),
    });

    render(<Footer />);

    // On mount, the useEffect around line 358–362 should call changeLayer
    expect(changeLayer).toHaveBeenCalledWith(
      {}, // our mock mapRef.current
      false,
      '2023-01-01T00:00:00Z',
    );
  });

  it('does not toggle play/pause when timeStamps is empty', async () => {
    const setIsPlayingMock = jest.fn();

    (useMapLayerContext as jest.Mock).mockReturnValue({
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: {
        current: {
          getView: jest.fn(() => ({
            setCenter: jest.fn(),
            setZoom: jest.fn(),
          })),
        },
      },
      timeStamps: [],
      sliderValue: 0,
      setSliderValue: jest.fn(),
      setTimeStamps: jest.fn(),
      loadedLayers: [],
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      loadedTimestamp: null,
      setLoadedTimestamp: jest.fn(),
      isPlaying: false,
      setIsPlaying: setIsPlayingMock,
      itemIds: ['item-id-1', 'item-id-2'],
      setItemIds: jest.fn(),
      isProcessLoading: false,
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>,
    );

    // Click the play/pause button
    const playPauseButton = screen.getByTestId('play-pause-button');
    await act(async () => {
      fireEvent.click(playPauseButton);
    });
    await act(async () => {
      fireEvent.click(playPauseButton);
    });

    // Verify that setIsPlaying was not called since timeStamps is empty
    expect(setIsPlayingMock).not.toHaveBeenCalled();
  });

  it('handles missing itemIdsResponse gracefully', async () => {
    const api = require('../src/app/services/api');
    api.fetchItemIds.mockResolvedValue(undefined); // Simulate missing data

    render(
      <MapProvider>
        <Footer />
      </MapProvider>,
    );

    // Should not throw error
    expect(await screen.findByTestId('footer-container')).toBeInTheDocument();
  });
});
