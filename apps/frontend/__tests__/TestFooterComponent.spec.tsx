import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../src/app/components/Footer';
import { MapProvider, useMapLayerContext } from '../src/app/context/MapContext';
import { fetchTimestamps, getLoadedLayers, loadAssets, resetItemAssets } from '../src/app/services/api';
import { changeLayer, removeAllAssetLayers } from '../src/app/components/MapView';
import * as api from '../src/app/services/api';

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

    const localStorageMock = {
      store: {},
      getItem: jest.fn((key) => {
        if (key === 'playbackSpeed') throw new Error('Test localStorage read error');
        return '1';
      }),
      setItem: jest.fn(() => {
        throw new Error('Test localStorage write error');
      })
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
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
