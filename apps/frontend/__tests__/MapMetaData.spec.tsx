import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { render, fireEvent, act } from '@testing-library/react';
import { insertDatalayerView, fetchItems } from '../src/app/services/api';
import { changeLayer } from '../src/app/components/MapView';
import { useMapLayerContext } from '../src/app/components/MapContext';

jest.mock('../src/app/services/api', () => ({
  insertDatalayerView: jest.fn(),
  fetchItems: jest.fn(),
}));

jest.mock('../src/app/components/MapView', () => ({
  changeLayer: jest.fn(),
}));

jest.mock('../src/app/components/MapContext', () => ({
  useMapLayerContext: jest.fn(() => ({
    mapRef: { current: {} },
    setDataItems: jest.fn(),
    dataItems: [],
  })),
}));

describe('MapMetaDataCompleteCoverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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
    (fetchItems as jest.Mock).mockResolvedValue([{ id: '1' }]);
  
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
  
      for (let i = 0; i < 15; i++) {
        jest.advanceTimersByTime(300);
        await Promise.resolve(); // Ensures all pending promises are resolved
      }
    });
  
    expect(insertDatalayerView).toHaveBeenCalledWith('123');
    expect(changeLayer).toHaveBeenCalled();
    expect(fetchItems).toHaveBeenCalledWith('123');
    expect(setDataItemsMock).toHaveBeenCalledWith([{ id: '1' }]);
  });
  

  it('handles onLoadDataset error path fully', async () => {
    const errorMock = new Error('API failure');
    (insertDatalayerView as jest.Mock).mockRejectedValue(errorMock);
    const { getByTestId } = render(
      <MapMetaData id='123' visible={true} onLoadDataset={jest.fn()} onClose={jest.fn()} />
    );
    fireEvent.click(getByTestId('load-dataset-button'));
    jest.advanceTimersByTime(4000);
    await act(async () => {});
    expect(insertDatalayerView).toHaveBeenCalledWith('123');
  });
});
