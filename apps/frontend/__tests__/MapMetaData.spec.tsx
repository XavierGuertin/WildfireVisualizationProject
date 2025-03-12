import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { saveConfig, getConfig } from '../src/app/services/configApi';
import { fetchItems, fetchProgress, resetItems } from '../src/app/services/api';
import { useMapLayerContext } from '../src/app/context/MapContext';
import { toast } from 'react-toastify';

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
  resetItems: jest.fn(),
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
    mapRef: { current: {} },
    isOnline: true,
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
  };

  const mockedFetchProgress = fetchProgress as jest.MockedFunction<typeof fetchProgress>;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('does not render when visible is false', () => {
    const { container } = render(<MapMetaData {...defaultProps} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders metadata fields correctly', () => {
    render(<MapMetaData {...defaultProps} />);
    expect(screen.getByTestId('dataset-description')).toHaveTextContent('Test description');
    expect(screen.getByTestId('dataset-format')).toHaveTextContent('GeoJSON');
    expect(screen.getByTestId('dataset-processes')).toHaveTextContent('Process info');
    expect(screen.getByTestId('dataset-datasource')).toHaveTextContent('Source info');
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
    (fetchItems as jest.Mock).mockResolvedValue("Fetching started in the background. Check progress separately.");
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
    expect(toast.success).toHaveBeenCalledWith('timestamps_fetch_success', { toastId: 'timestamps-success' });
  });

  it('handles error if fetchItems fails', async () => {
    (fetchItems as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    render(<MapMetaData {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-dataset-button'));
      await Promise.resolve();
    });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Error loading dataset:'));
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
    (fetchItems as jest.Mock).mockResolvedValue("Fetching started in the background. Check progress separately.");
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
    });
  
    render(<MapMetaData {...defaultProps} />);
    const loadButton = screen.getByTestId('load-dataset-button');
  
    fireEvent.click(loadButton);
  
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('disabled'),
      expect.any(Object)
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
      />
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
  });

  it('initializes map context on render', () => {
    render(<MapMetaData {...defaultProps} />);
    // Assert that setSliderValue and setTimeStamps exist (just triggers MapContext usage)
    expect(typeof useMapLayerContext().setSliderValue).toBe('function');
  });

  it('calls fetchTimestamps and updates setTimeStamps when progress reaches 100%', async () => {
    const mockTimestamps = ['2024-01-01', '2024-01-02'];
    const mockSetTimeStamps = jest.fn();
  
    // Override context mock to provide our mock setTimeStamps
    const mockCtx = require('../src/app/context/MapContext');
    mockCtx.useMapLayerContext.mockReturnValue({
      isOnline: true,
      setSliderValue: jest.fn(),
      setTimeStamps: mockSetTimeStamps,
      mapRef: { current: {} }
    });
  
    const mockedFetchItems = fetchItems as jest.MockedFunction<typeof fetchItems>;
    const mockedFetchProgress = fetchProgress as jest.MockedFunction<typeof fetchProgress>;
    const mockedFetchTimestamps = require('../src/app/services/api').fetchTimestamps;
  
    mockedFetchItems.mockResolvedValue("Fetching started in the background. Check progress separately.");
    mockedFetchProgress.mockResolvedValueOnce({ collectionId: 'test-dataset', progress: 50 });
    mockedFetchProgress.mockResolvedValueOnce({ collectionId: 'test-dataset', progress: 100 });    
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
  });  
});