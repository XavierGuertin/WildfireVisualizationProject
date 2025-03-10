import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { fetchItems, fetchProgress, fetchTimestamps, insertDatalayerView } from '../src/app/services/api';
import { useMapLayerContext } from '../src/app/context/MapContext';
import { toast } from 'react-toastify';

jest.mock('sweetalert2-react-content', () => {
  return jest.fn().mockImplementation(() => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
  }));
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}));

jest.mock('../src/app/services/api', () => ({
  insertDatalayerView: jest.fn(),
  fetchItems: jest.fn(),
  resetItems: jest.fn(),
  fetchTimestamps: jest.fn(() => Promise.resolve(["2024-01-01", "2024-01-02", "2024-01-03"])),
  fetchProgress: jest.fn(),
}));

jest.mock('../src/app/components/MapView', () => ({
  changeLayer: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

let mockTimeStamps: string[] = [];
const mockSetTimeStamps = jest.fn((newTimeStamps) => {
  if (typeof newTimeStamps === 'function') {
    mockTimeStamps = newTimeStamps(mockTimeStamps);
  } else {
    mockTimeStamps = newTimeStamps;
  }
});

jest.mock('../src/app/context/MapContext', () => ({
  useMapLayerContext: jest.fn(() => ({
    layer: null,
    setLayer: jest.fn(),
    mapRef: { current: null },
    resetView: jest.fn(),
    speed: 1,
    setSpeed: jest.fn(),
    dataItems: [],
    setDataItems: jest.fn(),
    isOnline: true,
    setIsOnline: jest.fn(),
    timeStamps: mockTimeStamps,
    setTimeStamps: mockSetTimeStamps,
    sliderValue: 0,
    setSliderValue: jest.fn(),
  })),
}));

describe('MapMetaData', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()]);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('does not render if visible is false', () => {
    const { container } = render(<MapMetaData onLoadDataset={jest.fn()} onClose={jest.fn()} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders and toggles collapse', () => {
    const { getByTestId, queryByTestId } = render(
      <MapMetaData name='TestName' description='TestDesc' format='CSV' processes='Proc'
                   datasetSource='DataSrc' visible={true} onLoadDataset={jest.fn()} onClose={jest.fn()} />
    );
    expect(getByTestId('name-div').textContent).toBe('TestName');
    fireEvent.click(getByTestId('name-div'));
    expect(getByTestId('collapsedMetaData')).toBeInTheDocument();
    fireEvent.click(getByTestId('collapsedMetaData'));
    expect(queryByTestId('collapsedMetaData')).toBeNull();
  });

  it('calls onLoadDataset and verifies polling stops at 100%', async () => {
    (insertDatalayerView as jest.Mock).mockResolvedValue({});
    (fetchItems as jest.Mock).mockResolvedValue("Fetching started in the background. Check progress separately.");

    // Mock progress increasing over time
    let progressValue = 0;
    (fetchProgress as jest.Mock).mockImplementation(() => {
      progressValue = Math.min(progressValue + 20, 100); // Increase by 20 until 100
      return Promise.resolve({ progress: progressValue });
    });

    const setDataItemsMock = jest.fn();
    (useMapLayerContext as jest.Mock).mockReturnValue({
      mapRef: { current: {} },
      setDataItems: setDataItemsMock,
      dataItems: [],
      setTimeStamps: jest.fn(),
      isOnline: true,
    });

    const { getByTestId } = render(
      <MapMetaData id="123" visible={true} onLoadDataset={jest.fn()} onClose={jest.fn()} />
    );

    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
      await Promise.resolve(); // Allow SweetAlert to resolve
    });

    expect(fetchItems).toHaveBeenCalledTimes(1);

    // Simulate polling behavior
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        jest.advanceTimersByTime(500); // Simulate 500ms polling interval
        await Promise.resolve();
      });
    }

    // Ensure progress reached 100%
    expect(fetchProgress).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("items_fetch_success");
  });
});
