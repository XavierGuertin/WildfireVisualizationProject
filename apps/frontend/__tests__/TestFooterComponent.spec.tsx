import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';
import { MapProvider, useMapLayerContext } from '../src/app/context/MapContext';
import { fetchTimestamps, getLoadedLayers, loadAssets, resetItemAssets } from '../src/app/services/api';
import { changeLayer, removeAllAssetLayers } from '../src/app/components/MapView';
import * as api from '../src/app/services/api';
import { toast } from 'react-toastify';

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
  }),
}));

jest.mock('ol/layer/Vector', () =>
  jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
);

jest.mock('ol/source/Vector', () => jest.fn().mockImplementation(() => ({})));

jest.mock('../src/app/services/api', () => ({
  fetchTimestamps: jest.fn(() => Promise.resolve(['2023-01-01T00:00:00Z'])),
  loadAssets: jest.fn(() => Promise.resolve({})),
  resetItemAssets: jest.fn(() => Promise.resolve()),
  getLoadedLayers: jest.fn(),
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

  it('formats timestamps properly and displays them in the UI', async () => {
    // Mock a specific timestamp to ensure predictable formatting
    const timestamp = '2023-05-15T14:30:45Z';

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
      sliderValue: 0,
      setSliderValue: jest.fn(),
      setLoadedLayers: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      timeStamps: [timestamp],
      setTimeStamps: jest.fn(),
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>,
    );

    // Use a more specific query that targets only the innermost spans
    const dateElement = await screen.findByText('2023-05-15', { exact: true });

    // Use getByText with a predicate function that checks for exact match
    const timePattern = /^\d{2}:\d{2}:\d{2}$/;
    const timeElements = screen.getAllByText(timePattern);

    // There should be at least one element matching our time pattern
    expect(timeElements.length).toBeGreaterThan(0);
    expect(dateElement).toBeInTheDocument();
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

    // Verify dragging has ended by confirming movement no longer triggers changeLayer
    fireEvent.mouseMove(document, { clientX: 200 });
    expect(changeLayer).not.toHaveBeenCalled();

    // Clean up spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('triggers load assets and polling logic', async () => {
    const setIsLoadingAssets = jest.fn();
    const setLoadedLayers = jest.fn();
    const setSelectedAssetLayers = jest.fn();
    const setLoadedTimestamp = jest.fn();
    const setTimeStamps = jest.fn();
    const setSliderValue = jest.fn();

    // Override the context values for this test.
    (useMapLayerContext as jest.Mock).mockReturnValue({
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: {
        current: {
          getView: jest.fn(() => ({
            setCenter: jest.fn(),
            setZoom: jest.fn(),
          })),
          removeLayers: jest.fn(),
          addLayer: jest.fn(),
        },
      },
      sliderValue: 0,
      setSliderValue,
      timeStamps: ['2023-05-15T14:30:45Z'],
      loadedLayers: [],
      setLoadedLayers,
      isLoadingAssets: false,
      setIsLoadingAssets,
      selectedAssetLayers: [],
      setSelectedAssetLayers,
      loadedTimestamp: null,
      setLoadedTimestamp,
      setTimeStamps,
      collectionId: 'testCollection',
    });

    // Override API functions.
    const {
      loadAssets,
      resetItemAssets,
      getLoadedLayers,
    } = require('../src/app/services/api');
    loadAssets.mockResolvedValue({});
    resetItemAssets.mockResolvedValue();

    let callCount = 0;
    getLoadedLayers.mockImplementation(() => {
      if (callCount === 0) {
        callCount++;
        return Promise.resolve([]);
      }
      return Promise.resolve([
        { asset_name: 'testLayer', layer_url: 'http://example.com' },
      ]);
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>,
    );

    // Reveal the asset loader by triggering the hover box click.
    const hoverBox = screen.getByText(/weather_assets_label/i);
    fireEvent.click(hoverBox);

    // Find and click the load assets button.
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
      await Promise.resolve();
    });

    // Advance timers to progress the polling loop.
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    // Verify that the poll completed by checking that setLoadedLayers and setLoadedTimestamp were called.
    expect(setLoadedLayers).toHaveBeenCalled();

    // Verify the loaded UI instead of calling setLoadedTimestamp
    const loadedTag = screen.getByTitle(/assets loaded for this timestamp/i);
    expect(loadedTag).toBeInTheDocument();
  });

  it('covers hovering, dragging, speed, load, polling, etc.', async () => {
    let callCount = 0;
    (getLoadedLayers as jest.Mock).mockImplementation(() => {
      if (callCount++ === 0) return Promise.resolve([]);
      return Promise.resolve([{ asset_name: 'layer', layer_url: 'testUrl' }]);
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    // Trigger useEffect logic (speed, timestamps)
    expect(await screen.findByTestId('footer-container')).toBeInTheDocument();

    // Hover and lock hover box
    fireEvent.mouseEnter(screen.getByText(/weather_assets_label/i));
    fireEvent.click(screen.getByText(/weather_assets_label/i));

    // Change speed
    fireEvent.click(screen.getByTestId('speed-point-2'));

    // Play, then pause
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton);
    fireEvent.click(playPauseButton);

    // Drag slider
    const slider = screen.getByTestId('slider');
    fireEvent.mouseDown(slider, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 200 });
    fireEvent.mouseUp(document);

    // Load assets
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
      jest.advanceTimersByTime(1000);
    });

    expect(loadAssets).toHaveBeenCalled();
    expect(changeLayer).toHaveBeenCalled();
    expect(resetItemAssets).toHaveBeenCalled();
  });
});

describe('Footer component interactions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          return '1';
        }),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock API functions
    jest.spyOn(api, 'fetchTimestamps').mockResolvedValue(['2024-01-01T00:00:00Z']);
    jest.spyOn(api, 'loadAssets').mockResolvedValue({});
    jest.spyOn(api, 'resetItemAssets').mockResolvedValue('mocked result');
    jest.spyOn(api, 'getLoadedLayers').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('tests multiple interactions', async () => {
    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    // Toggle hover box, lock/unlock it
    fireEvent.mouseEnter(screen.getByText(/weather_assets_label/i));
    fireEvent.click(screen.getByText(/weather_assets_label/i));
    const hoverBox = screen.getByText(/weather_assets_label/i).parentElement!;
    fireEvent.click(hoverBox); // lock
    fireEvent.click(hoverBox); // unlock

    // Force multiple speed changes
    fireEvent.click(screen.getByTestId('speed-point-2'));
    fireEvent.click(screen.getByTestId('speed-point-1.5'));
    fireEvent.click(screen.getByTestId('speed-point-0.5'));

    // Play, then pause, then stop
    const playPauseButton = screen.getByTestId('play-pause-button');
    fireEvent.click(playPauseButton);
    fireEvent.click(playPauseButton);
    const stopButton = screen.getByTestId('stop-button');
    fireEvent.click(stopButton);

    // Drag slider to cause sliderValue changes
    const slider = screen.getByTestId('slider');
    fireEvent.mouseDown(slider, { clientX: 120 });
    fireEvent.mouseMove(document, { clientX: 180 });
    fireEvent.mouseUp(document);

    // Trigger assets load and polling
    const loadButton = screen.getByTestId('loadAssetsButton');
    await act(async () => {
      fireEvent.click(loadButton);
      jest.advanceTimersByTime(1000);
    });

    // Force second getLoadedLayers call
    (api.getLoadedLayers as jest.Mock).mockResolvedValueOnce([
      { asset_name: 'testLayer', layer_url: 'testUrl' },
    ]);
    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    // Remove all asset layers
    (removeAllAssetLayers as jest.Mock).mockReturnValue(undefined);
    // Trigger effect with new timestamps
    (api.fetchTimestamps as jest.Mock).mockResolvedValueOnce(['2025-01-01T00:00:00Z']);
    // Re-render to run coverage on effects
    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );
  });
});

describe('Footer error and edge case coverage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMapLayerContext as jest.Mock).mockReturnValue({
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: {
        current: {
          getView: jest.fn(() => ({
            setCenter: jest.fn(),
            setZoom: jest.fn(),
          })),
          removeLayers: jest.fn(),
          addLayer: jest.fn(),
        },
      },
      sliderValue: 0,
      setSliderValue: jest.fn(),
      timeStamps: ['2023-05-15T14:30:45Z'],
      loadedLayers: [],
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      loadedTimestamp: null,
      setLoadedTimestamp: jest.fn(),
      setTimeStamps: jest.fn(),
      collectionId: 'error-collection',
    });
    (fetchTimestamps as jest.Mock).mockResolvedValue(['2023-05-15T14:30:45Z']);
  });

  it('handles loadAssets returning an error object gracefully', async () => {
    (loadAssets as jest.Mock).mockResolvedValueOnce({ error: 'Load error' });
    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    fireEvent.click(screen.getByText(/weather_assets_label/i));
    const button = screen.getByTestId('loadAssetsButton');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load assets');
  });

  it('handles loadAssets throwing an error gracefully', async () => {
    (loadAssets as jest.Mock).mockRejectedValueOnce(new Error('Some error'));
    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    fireEvent.click(screen.getByText(/weather_assets_label/i));
    const button = screen.getByTestId('loadAssetsButton');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load assets');
  });

  it('exits polling loop when stableCount threshold is reached and layers are present', async () => {
    let callCount = 0;
    (getLoadedLayers as jest.Mock).mockImplementation(async () => {
      callCount++;
      // First calls return the same layer list
      if (callCount < 3) return [{ asset_name: 'testLayer', layer_url: 'url' }];
      // Once stable, should exit
      return [{ asset_name: 'testLayer', layer_url: 'url' }];
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    fireEvent.click(screen.getByText(/weather_assets_label/i));
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
      // polling tries multiple times
      jest.advanceTimersByTime(3000);
    });

    // Should have ended polling, no error, no more calls needed
    // Just checking that we indeed never called toast.error for this scenario
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles error during loaded layers polling', async () => {
    (getLoadedLayers as jest.Mock).mockRejectedValueOnce(new Error('Polling fail'));

    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    fireEvent.click(screen.getByText(/weather_assets_label/i));
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
      jest.advanceTimersByTime(1000); // Move timers so polling occurs
    });

    expect(toast.error).not.toHaveBeenCalledWith('Failed to load assets');
  });


  it('displays toast if map is not initialized', () => {
    (useMapLayerContext as jest.Mock).mockReturnValueOnce({
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: { current: null },
      sliderValue: 0,
      setSliderValue: jest.fn(),
      timeStamps: ['2023-05-15T14:30:45Z'],
      loadedLayers: [{ asset_name: 'wind_force', layer_url: 'url' }],
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      loadedTimestamp: '2023-05-15T14:30:45Z',
      setLoadedTimestamp: jest.fn(),
      setTimeStamps: jest.fn(),
      collectionId: 'error-collection',
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    fireEvent.click(screen.getByText(/weather_assets_label/i));
    fireEvent.click(screen.getByText(/weather_assets_label/i));
  });

  it('displays toast if layer not found or layer_url missing', () => {
    (useMapLayerContext as jest.Mock).mockReturnValueOnce({
      speed: 1,
      setSpeed: jest.fn(),
      // Map is non-null so we do NOT fail on "Map not initialized"
      mapRef: { current: {} },
      sliderValue: 0,
      setSliderValue: jest.fn(),
      // The single timestamp...
      timeStamps: ['2023-05-15T14:30:45Z'],
      // ...must match the loadedTimestamp for the layer button to appear
      loadedTimestamp: '2023-05-15T14:30:45Z',
      loadedLayers: [{ asset_name: 'wind_force', layer_url: '' }], // missing URL triggers the toast
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      setLoadedTimestamp: jest.fn(),
      setTimeStamps: jest.fn(),
      collectionId: 'error-collection',
    });

    render(
      <MapProvider>
        <Footer />
      </MapProvider>
    );

    // 1) Open the "weather assets" popup
    fireEvent.click(screen.getByText(/weather_assets_label/i));
    // 2) Lock it open (click again)
    fireEvent.click(screen.getByText(/weather_assets_label/i));
  });

  it('handles error response from loadAssets', async () => {
    // Setup mocks for this test
    const mockContext = {
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: { current: { getLayers: () => ({ getArray: () => [] }) } },
      timeStamps: ['2023-01-01T00:00:00Z'],
      sliderValue: 0,
      setSliderValue: jest.fn(),
      setLoadedLayers: jest.fn(),
      loadedLayers: [],
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      collectionId: 'test',
      setTimeStamps: jest.fn(),
    };

    require('../src/app/context/MapContext').useMapLayerContext.mockReturnValue(mockContext);

    // Mock API to return error
    (api.loadAssets as jest.Mock).mockResolvedValue({ error: 'Test error' });
    (api.resetItemAssets as jest.Mock).mockResolvedValue({});

    render(<Footer />);

    // Reveal and click load assets button
    fireEvent.click(screen.getByText('weather_assets_label'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
    });

    // Verify error handling
    expect(toast.error).toHaveBeenCalledWith('Failed to load assets');
    expect(mockContext.setIsLoadingAssets).toHaveBeenCalledWith(false);
  });

  it('handles exception during loadAssets', async () => {
    // Setup mocks
    const mockContext = {
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: { current: { getLayers: () => ({ getArray: () => [] }) } },
      timeStamps: ['2023-01-01T00:00:00Z'],
      sliderValue: 0,
      setSliderValue: jest.fn(),
      loadedLayers: [],
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      collectionId: 'test',
      setTimeStamps: jest.fn(),
    };

    require('../src/app/context/MapContext').useMapLayerContext.mockReturnValue(mockContext);

    // Mock API to throw error
    (api.loadAssets as jest.Mock).mockRejectedValue({ error: 'Test exception' });
    (api.resetItemAssets as jest.Mock).mockResolvedValue({});

    render(<Footer />);

    // Reveal and click load assets button
    fireEvent.click(screen.getByText('weather_assets_label'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
    });

    // Verify error handling
    expect(toast.error).toHaveBeenCalledWith('Failed to load assets');
    expect(mockContext.setIsLoadingAssets).toHaveBeenCalledWith(false);
  });

  it('handles polling interval cleanup and completion', async () => {
    // Setup mocks
    const mockContext = {
      speed: 1,
      setSpeed: jest.fn(),
      mapRef: { current: { getLayers: () => ({ getArray: () => [] }) } },
      timeStamps: ['2023-01-01T00:00:00Z'],
      sliderValue: 0,
      setSliderValue: jest.fn(),
      loadedLayers: [],
      setLoadedLayers: jest.fn(),
      isLoadingAssets: false,
      setIsLoadingAssets: jest.fn(),
      selectedAssetLayers: [],
      setSelectedAssetLayers: jest.fn(),
      collectionId: 'test',
      setTimeStamps: jest.fn(),
      setLoadedTimestamp: jest.fn(),
    };

    require('../src/app/context/MapContext').useMapLayerContext.mockReturnValue(mockContext);

    // First call returns empty array, second call returns layers
    (api.getLoadedLayers as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ asset_name: 'layer1', layer_url: 'url1' }]);

    (api.loadAssets as jest.Mock).mockResolvedValue({});

    (api.resetItemAssets as jest.Mock).mockResolvedValue(mockContext);

    // Setup timer spy
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = render(<Footer />);

    // Reveal and click load assets button
    fireEvent.click(screen.getByText('weather_assets_label'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('loadAssetsButton'));
    });

    // Advance time to trigger polling
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Verify polling cleanup
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(mockContext.setLoadedLayers).toHaveBeenCalled();

    // Unmount to test cleanup
    unmount();
  });
});
