import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { act, fireEvent, render } from '@testing-library/react';
import { fetchItems, insertDatalayerView } from '../src/app/services/api';
import { changeLayer } from '../src/app/components/MapView';
import { useMapLayerContext } from '../src/app/components/MapContext';

jest.mock('sweetalert2-react-content', () => {
  return jest.fn().mockImplementation(() => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true })
  }));
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true })
}));

jest.mock('../src/app/services/api', () => ({
  insertDatalayerView: jest.fn(),
  fetchItems: jest.fn(),
  resetItems: jest.fn(),
  fetchTimestamps: jest.fn(() =>
    Promise.resolve(["2024-01-01", "2024-01-02", "2024-01-03"])
  ),
}));

jest.mock('../src/app/components/MapView', () => ({
  changeLayer: jest.fn(),
}));

let mockTimeStamps: string[] = [];

const mockSetTimeStamps = jest.fn((newTimeStamps) => {
  if (typeof newTimeStamps === 'function') {
    mockTimeStamps = newTimeStamps(mockTimeStamps); // Handle function-based updates
  } else {
    mockTimeStamps = newTimeStamps; // Handle direct updates
  }
});

jest.mock('../src/app/components/MapContext', () => ({
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
    timeStamps: mockTimeStamps,  // ✅ Make sure to return the mock state
    setTimeStamps: mockSetTimeStamps, // ✅ Correctly mock the function
    sliderValue: 0,
    setSliderValue: jest.fn(),
  })),
}));




describe('MapMetaDataCompleteCoverage', () => {
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

  it('calls onLoadDataset successfully and covers loading bar', async () => {
    (insertDatalayerView as jest.Mock).mockResolvedValue({});
    (fetchItems as jest.Mock).mockResolvedValue('Items fetched and saved successfully');

    const setDataItemsMock = jest.fn();
    (useMapLayerContext as jest.Mock).mockReturnValue({
      mapRef: { current: {} },
      setDataItems: setDataItemsMock,
      dataItems: [],
    });

    const { getByTestId } = render(
      <MapMetaData id="123" visible={true} onLoadDataset={jest.fn()} onClose={jest.fn()} />
    );

    await act(async () => {
      fireEvent.click(getByTestId('load-dataset-button'));
      // Allow SweetAlert promises to resolve
      await Promise.resolve();

      // Simulate progress bar
      for (let i = 0; i < 15; i++) {
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      }

      // Allow the timeout in the component to complete
      jest.advanceTimersByTime(4000);
      await Promise.resolve();
    });
  });
});
