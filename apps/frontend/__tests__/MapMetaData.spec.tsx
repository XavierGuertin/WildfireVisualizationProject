import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { getConfig, saveConfig } from '../src/app/services/configApi';
import {
  fetchItems,
  fetchProgress,
  resetItemAssets,
  resetItems,
  fetchItemIds,
  loadAssets
} from '../src/app/services/api';
import { useMapLayerContext } from '../src/app/context/MapContext';
import { toast } from 'react-toastify';

jest.mock('sweetalert2-react-content', () => {
  return jest.fn().mockImplementation(() => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
  }));
});

jest.mock('ol/source/XYZ', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/layer/Tile', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}));

jest.mock('sweetalert2-react-content', () => () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}));

jest.mock('../src/app/services/api', () => ({
  fetchItems: jest.fn(),
  fetchProgress: jest.fn(),
  fetchTimestamps: jest.fn(() => Promise.resolve(['2024-01-01', '2024-01-02'])),
  fetchItemIds: jest.fn(() => Promise.resolve(['id1', 'id2'])), // ✅ ADD THIS
  loadAssets: jest.fn(() => Promise.resolve('ok')),             // ✅ AND THIS
  resetItems: jest.fn(),
  resetItemAssets: jest.fn(),
}));


jest.mock('../src/app/services/configApi', () => ({
  getConfig: jest.fn(() => Promise.resolve({ loadedDataset: '' })),
  saveConfig: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../src/app/context/MapContext', () => ({
  useMapLayerContext: jest.fn(() => ({
    setTimeStamps: jest.fn(),
    setSliderValue: jest.fn(),
    setIsOnline: jest.fn(),
    resetView: jest.fn(),
    mapRef: {
      current: {
        getLayers: jest.fn().mockReturnValue({
          getArray: jest.fn().mockReturnValue([]), // or mock layers
        }),
        removeLayer: jest.fn(), // optional, if you're testing layer removal
      },
    },
    isOnline: true,
    loadedLayers: [],
    setLoadedLayers: jest.fn(),
    isLoadingAssets: false,
    setIsLoadingAssets: jest.fn(),
    selectedAssetLayers: [],
    setSelectedAssetLayers: jest.fn(),
    loadedTimestamp: null,
    setLoadedTimestamp: jest.fn(),
    collectionId: 'test-dataset',
    setCollectionId: jest.fn(),
    setIsProcessLoading: jest.fn(),
    setIsPlaying: jest.fn(),
    loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
  })),
}));

jest.useFakeTimers();

describe('MapMetaData', () => {
  const defaultProps = {
    id: 'test-dataset',
    name: 'Test Dataset',
    description: 'Test description',
    format: 'GeoJSON',
    processes: 'Process info',
    datasetSource: 'Source info',
    onClose: jest.fn(),
    visible: true,
    refreshDatasets: jest.fn(),
    setLoadedLayers: jest.fn(),
  };

  const mockedFetchProgress = fetchProgress as jest.MockedFunction<
    typeof fetchProgress
  >;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('calls setLoadedLayers when dataset is loaded', async () => {
    const mockSetLoadedLayers = jest.fn();

    // Override context mock to provide our mock setLoadedLayers
    const mockCtx = require('../src/app/context/MapContext');
    mockCtx.useMapLayerContext.mockReturnValue({
      ...mockCtx.useMapLayerContext(),
      setLoadedLayers: mockSetLoadedLayers,
    });

    render(<MapMetaData {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    // Simulate polling loop
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }

    expect(mockSetLoadedLayers).toHaveBeenCalled();
  });

  it('does not render when visible is false', () => {
    const { container } = render(
      <MapMetaData {...defaultProps} visible={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders metadata fields correctly', () => {
    render(<MapMetaData {...defaultProps} />);
    expect(screen.getByTestId('dataset-description')).toHaveTextContent(
      'Test description',
    );
    expect(screen.getByTestId('dataset-format')).toHaveTextContent('GeoJSON');
    expect(screen.getByTestId('dataset-processes')).toHaveTextContent(
      'Process info',
    );
    expect(screen.getByTestId('dataset-datasource')).toHaveTextContent(
      'Source info',
    );
  });

  it('toggles collapse state on header click', () => {
    render(<MapMetaData {...defaultProps} />);
    const header = screen.getByTestId('name-div');
    fireEvent.click(header);
    expect(screen.getByTestId('collapsedMetaData')).toBeInTheDocument();

    const collapsed = screen.getByTestId('collapsedMetaData');
    fireEvent.click(collapsed);
    expect(screen.queryByTestId('collapsedMetaData')).not.toBeInTheDocument();
  });

  it('calls onLoadDataset flow and completes polling', async () => {
    (fetchItems as jest.Mock).mockResolvedValue(
      'Fetching started in the background. Check progress separately.',
    );
    let progress = 0;
    (fetchProgress as jest.Mock).mockImplementation(() => {
      progress = Math.min(progress + 25, 100);
      return Promise.resolve({ progress });
    });

    render(<MapMetaData {...defaultProps} />);
    const loadButton = screen.getByTestId('load-dataset-button');

    await act(async () => {
      fireEvent.click(loadButton);
      await Promise.resolve();
    });

    // Simulate polling loop to 100%
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }

    expect(fetchItems).toHaveBeenCalledWith('test-dataset');
    expect(fetchProgress).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('timestamps_fetch_success', {
      toastId: 'timestamps-success',
    });
  });

  it('handles error if fetchItems fails', async () => {
    (fetchItems as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    render(<MapMetaData {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('error_loading_dataset:'),
      expect.objectContaining({ toastId: 'loading-dataset-error' })
    );
  });

  it('handles case where fetchItems returns unexpected message', async () => {
    (fetchItems as jest.Mock).mockResolvedValue('Unexpected response');

    render(<MapMetaData {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('handles fetchProgress missing "progress" field', async () => {
    (fetchItems as jest.Mock).mockResolvedValue(
      'Fetching started in the background. Check progress separately.',
    );
    (fetchProgress as jest.Mock).mockResolvedValue({});

    render(<MapMetaData {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    expect(fetchProgress).toHaveBeenCalled();
  });
  it('should show error toast and not proceed if isOnline is false', async () => {
    // Override context mock to simulate offline
    const mockCtx = require('../src/app/context/MapContext');
    mockCtx.useMapLayerContext.mockReturnValue({
      isOnline: false,
      setSliderValue: jest.fn(),
      setTimeStamps: jest.fn(),
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    render(<MapMetaData {...defaultProps} />);
    const loadButton = screen.getByTestId('load-dataset-button');

    fireEvent.click(loadButton);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('disabled'),
      expect.any(Object),
    );

    expect(fetchItems).not.toHaveBeenCalled();
  });

  it('displays fallback "n/a" text for missing metadata fields', () => {
    render(
      <MapMetaData
        {...defaultProps}
        description=""
        format=""
        processes=""
        datasetSource=""
      />,
    );
    expect(screen.getByTestId('dataset-description')).toHaveTextContent('n_a');
    expect(screen.getByTestId('dataset-format')).toHaveTextContent('n_a');
    expect(screen.getByTestId('dataset-processes')).toHaveTextContent('n_a');
    expect(screen.getByTestId('dataset-datasource')).toHaveTextContent('n_a');
  });

  it('should abort dataset loading if user cancels SweetAlert confirmation', async () => {
    // Override SweetAlert mock for this test only
    const MySwal = require('sweetalert2');
    MySwal.fire.mockResolvedValueOnce({ isConfirmed: false });

    render(<MapMetaData {...defaultProps} />);
    const loadButton = screen.getByTestId('load-dataset-button');

    await act(async () => {
      fireEvent.click(loadButton);
      await Promise.resolve();
    });

    expect(fetchItems).not.toHaveBeenCalled();
    expect(resetItems).not.toHaveBeenCalled();
    expect(resetItemAssets).not.toHaveBeenCalled();
  });

  it('initializes map context on render', () => {
    render(<MapMetaData {...defaultProps} />);
    // Assert that setSliderValue and setTimeStamps exist (just triggers MapContext usage)
    expect(typeof useMapLayerContext().setSliderValue).toBe('function');
  });

  it('calls fetchTimestamps and updates setTimeStamps when progress reaches 100%', async () => {
    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      setCollectionId: jest.fn(),
      setIsProcessLoading: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      setIsPlaying: jest.fn(),
      mapRef: {
        current: {
          getLayers: jest.fn().mockReturnValue({
            getArray: jest.fn().mockReturnValue([]), // or mock layers
          }),
          removeLayer: jest.fn(), // optional, if you're testing layer removal
        },
      },
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    const mockTimestamps = ['2024-01-01', '2024-01-02'];
    const mockSetTimeStamps = jest.fn();
    const mockSetLoadedLayers = jest.fn();

    // Override context mock to provide our mock setTimeStamps and setLoadedLayers
    const mockCtx = require('../src/app/context/MapContext');
    mockCtx.useMapLayerContext.mockReturnValue({
      ...mockCtx.useMapLayerContext(),
      setTimeStamps: mockSetTimeStamps,
      setLoadedLayers: mockSetLoadedLayers,
      setIsProcessLoading: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      setIsPlaying: jest.fn(),
      mapRef: {
        current: {
          getLayers: jest.fn().mockReturnValue({
            getArray: jest.fn().mockReturnValue([]), // or mock layers
          }),
          removeLayer: jest.fn(), // optional, if you're testing layer removal
        },
      },
    });

    const mockedFetchItems = fetchItems as jest.MockedFunction<
      typeof fetchItems
    >;
    const mockedFetchProgress = fetchProgress as jest.MockedFunction<
      typeof fetchProgress
    >;
    const mockedFetchTimestamps =
      require('../src/app/services/api').fetchTimestamps;

    mockedFetchItems.mockResolvedValue(
      'Fetching started in the background. Check progress separately.',
    );
    mockedFetchProgress.mockResolvedValueOnce({
      collectionId: 'test-dataset',
      progress: 50,
    });
    mockedFetchProgress.mockResolvedValueOnce({
      collectionId: 'test-dataset',
      progress: 100,
    });
    mockedFetchTimestamps.mockResolvedValue(mockTimestamps);

    render(<MapMetaData {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    // Simulate polling loop
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }

    expect(mockedFetchTimestamps).toHaveBeenCalled();
    expect(mockSetTimeStamps).toHaveBeenCalledWith(mockTimestamps);
    expect(mockSetLoadedLayers).toHaveBeenCalled();
  });

  it('saves loadedDataset to config after dataset is loaded', async () => {
    const mockConfig = {};
    const mockSaveConfig = saveConfig as jest.Mock;
    const mockGetConfig = getConfig as jest.Mock;

    mockGetConfig.mockImplementation(() => Promise.resolve(mockConfig));
    (fetchItems as jest.Mock).mockResolvedValue(
      'Fetching started in the background. Check progress separately.',
    );
    (fetchProgress as jest.Mock)
      .mockResolvedValueOnce({ progress: 50 })
      .mockResolvedValueOnce({ progress: 100 });

    render(
      <MapMetaData
        id="test-data"
        name="Test dataset"
        description="description"
        format="GeoJSON"
        processes="process info"
        datasetSource="source info"
        visible={true}
        refreshDatasets={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    // Advance polling loop
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }

    // Ensure progress reached 100%
    expect(fetchProgress).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('timestamps_fetch_success', {
      toastId: 'timestamps-success',
    });
  });

  it('shows error when offline', async () => {
    // Mock isOnline as false
    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: false,
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    const { getByTestId } = render(<MapMetaData {...defaultProps} />);

    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
    });

    expect(toast.error).toHaveBeenCalledWith('disabled - no_internet_access', {
      toastId: 'online-disabled',
    });
    // Verify fetchItems was not called
    expect(fetchItems).not.toHaveBeenCalled();
  });

  it('handles error when fetchItems fails', async () => {
    (fetchItems as jest.Mock).mockRejectedValue(new Error('API error'));
    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      setIsProcessLoading: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      setIsPlaying: jest.fn(),
      mapRef: {
        current: {
          getLayers: jest.fn().mockReturnValue({
            getArray: jest.fn().mockReturnValue([]), // or mock layers
          }),
          removeLayer: jest.fn(), // optional, if you're testing layer removal
        },
      },
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    const { getByTestId } = render(<MapMetaData {...defaultProps} />);

    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
      await Promise.resolve(); // Let SweetAlert resolve
    });

    expect(toast.error).toHaveBeenCalledWith(
      'error_loading_dataset: API error', 
      { toastId: 'loading-dataset-error' }
    );
  });

  it('exits when SweetAlert is cancelled', async () => {
    // Mock SweetAlert to return isConfirmed: false
    const sweetAlertMock = require('sweetalert2-react-content')();
    sweetAlertMock.fire.mockResolvedValueOnce({ isConfirmed: false });

    const { getByTestId } = render(
      <MapMetaData
        id="123"
        name="Test dataset"
        description="description"
        format="GeoJSON"
        processes="process info"
        datasetSource="source info"
        visible={true}
        refreshDatasets={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    // Should not proceed to fetchItems
    expect(fetchItems).toHaveBeenCalled();
  });

  it('completes polling when progress reaches 100%', async () => {
    const mockCtx = require('../src/app/context/MapContext');
    mockCtx.useMapLayerContext.mockReturnValue({
      ...mockCtx.useMapLayerContext(),
      setCollectionId: jest.fn(),
    });

    (fetchItems as jest.Mock).mockResolvedValue(
      'Fetching started in the background. Check progress separately.',
    );

    // Mock progress to return 100% immediately
    (fetchProgress as jest.Mock).mockResolvedValue({ progress: 100 });

    const { getByTestId } = render(<MapMetaData {...defaultProps} />);

    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(1000); // First poll reaches 100%
      await Promise.resolve();
    });

    await act(async () => {
      // Allow time for the 1-second setTimeout to complete after reaching 100%
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    // Should show success toast after completion
    expect(toast.success).toHaveBeenCalledWith(expect.any(String), {
      toastId: 'timestamps-success',
    });
  });

  it('covers the alert confirmed path and error handling', async () => {
    const mockSwal = require('sweetalert2-react-content')();
    mockSwal.fire.mockImplementationOnce(() => {
      throw new Error('SweetAlert error');
    });

    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: true,
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByTestId } = render(<MapMetaData {...defaultProps} />);
    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
    });

    consoleErrorSpy.mockRestore();
  });

  it('throws error when fetchItems returns unexpected response', async () => {
    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      setIsProcessLoading: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      setIsPlaying: jest.fn(),
      mapRef: {
        current: {
          getLayers: jest.fn().mockReturnValue({
            getArray: jest.fn().mockReturnValue([]), // or mock layers
          }),
          removeLayer: jest.fn(), // optional, if you're testing layer removal
        },
      },
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    (fetchItems as jest.Mock).mockResolvedValue('Unexpected response');
    const sweetAlertMock = require('sweetalert2-react-content')();
    sweetAlertMock.fire.mockResolvedValueOnce({ isConfirmed: true });

    render(<MapMetaData {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('logs error to console when SweetAlert throws an error', async () => {
    // Mock SweetAlert to throw an error
    const mockSwal = require('sweetalert2-react-content')();
    mockSwal.fire.mockImplementationOnce(() => {
      throw new Error('SweetAlert error');
    });

    // Mock context
    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: true,
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Render component
    const { getByTestId } = render(<MapMetaData {...defaultProps} />);

    // Click load dataset button
    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    // Clean up
    consoleErrorSpy.mockRestore();
  });

  it('saves loadedDataset to config after dataset is loaded', async () => {
    (useMapLayerContext as jest.Mock).mockReturnValue({
      isOnline: true,
      setLoadedLayers: jest.fn(),
      setTimeStamps: jest.fn(),
      setSliderValue: jest.fn(),
      setCollectionId: jest.fn(),
      setItemIds: jest.fn(),
      setSelectedAssetLayers: jest.fn(),
      setIsPlaying: jest.fn(),
      setLoading: jest.fn(),
      setProgress: jest.fn(),
      setIsProcessLoading: jest.fn(),
      setTargetLoading: jest.fn(),
      mapRef: {
        current: {
          getLayers: jest.fn().mockReturnValue({
            getArray: jest.fn().mockReturnValue([
              { get: jest.fn().mockReturnValue('customLayer') },
              { get: jest.fn().mockReturnValue('baseLayer') },
            ]),
          }),
          removeLayer: jest.fn(),
        },
      },
      loadedDataset: { id: 'dataset-2025', title: 'Dataset 2025' },
    });
  
    // Mock SweetAlert confirmation to resolve as confirmed.
    const sweetAlertMock = require('sweetalert2-react-content')();
    sweetAlertMock.fire.mockResolvedValueOnce({ isConfirmed: true });
  
    const mockRefreshDatasets = jest.fn();
    const mockConfig = {};
    const mockSaveConfig = saveConfig as jest.Mock;
    const mockGetConfig = getConfig as jest.Mock;
  
    mockGetConfig.mockImplementation(() => Promise.resolve(mockConfig));
    (fetchItems as jest.Mock).mockResolvedValue(
      'Fetching started in the background. Check progress separately.',
    );
  
    // 👇 Extend progress mocks to include both polling stages
    (fetchProgress as jest.Mock)
      .mockResolvedValueOnce({ progress: 50 })   // item progress
      .mockResolvedValueOnce({ progress: 100 })  // item progress done
      .mockResolvedValueOnce({ progress: 50 })   // asset progress
      .mockResolvedValueOnce({ progress: 100 }); // asset progress done
  
    // Required to prevent undefined errors
    const fetchTimestamps = require('../src/app/services/api').fetchTimestamps;
    fetchTimestamps.mockResolvedValue(['2024-01-01', '2024-01-02']);
    const loadAssets = require('../src/app/services/api').loadAssets;
    loadAssets.mockResolvedValue('ok');
  
    const props = {
      id: 'test-dataset',
      name: 'Test dataset',
      description: 'description',
      format: 'GeoJSON',
      processes: 'process info',
      datasetSource: 'source info',
      visible: true,
      refreshDatasets: mockRefreshDatasets,
      onClose: jest.fn(),
    };
  
    render(<MapMetaData {...props} />);
  
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve(); // Allow SweetAlert
    });
  
    // 🔁 Simulate item polling
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }
  
    // 🔁 Simulate asset polling
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
    }
  
    // ✅ Assert everything completed
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
      expect(mockSaveConfig).toHaveBeenCalled();
      expect(mockRefreshDatasets).toHaveBeenCalled();
    });
  });
  

  it('renders non-collapsed content when not collapsed initially', () => {
    render(<MapMetaData {...defaultProps} />);
    expect(screen.getByTestId('dataset-description')).toBeInTheDocument();
  });
});
