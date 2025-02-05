import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableDatasets, { DatasetMetadata } from '../src/app/components/AvailableDatasets';
import axios from 'axios';
import fetchMock from 'jest-fetch-mock';
import * as api from '../src/app/services/api'

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Test AvailableDatasets component', () => {
  let mockOnDatasetClick: jest.Mock;

  beforeAll(() => {
    process.env.BASE_URL = 'http://localhost:8080';
  });

  beforeEach(() => {
    mockOnDatasetClick = jest.fn();
    jest.clearAllMocks();

    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock API responses before each test
    jest.spyOn(api, 'fetchCollectionsFromEndpoint').mockResolvedValue([
      { id: 'EuroSAT-subset-train', key: 9 },
      { id: 'EuroSAT-subset-validate', key: 10 },
    ]);

    jest.spyOn(api, 'fetchCollectionsFromEndpointByName').mockResolvedValue([
      { id: 'EuroSAT-subset-train', key: 9 },
      { id: 'EuroSAT-subset-validate', key: 10 },
    ]);

    jest.spyOn(api, 'fetchCollectionsFromEndpointByDate').mockResolvedValue([
      { id: 'EuroSAT-full-train', key: 12 },
      { id: 'EuroSAT-full-test', key: 13 },
    ]);

  });


  it('should call onDatasetClick when a dataset is clicked', async () => {
    jest.spyOn(api, 'fetchMetaData').mockResolvedValue({
      id: 'EuroSAT-subset-train',
      key: 9,
    });

    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    await waitFor(() => expect(screen.getByTestId('dataset-button-0')).toBeInTheDocument());

    const datasetButton = screen.getByTestId('dataset-button-0');
    fireEvent.click(datasetButton);

    await waitFor(() => {
      expect(mockOnDatasetClick).toHaveBeenCalledWith({
        id: 'EuroSAT-subset-train',
        key: 9,
      });
    });
  });

  it('should handle errors when fetching datasets on mount', async () => {
    jest.spyOn(api, 'fetchCollectionsFromEndpoint').mockRejectedValue(new Error('API Error'));

    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-message')).toHaveTextContent('Failed to load datasets.');
    });

    expect(console.log).toHaveBeenCalledWith('Error fetching datasets:', expect.any(Error));
  });


  it('should call fetchCollectionsFromEndpointByName when the Name filter is selected', async () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-Name'));
    });

    await waitFor(() => {
      expect(api.fetchCollectionsFromEndpointByName).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle errors when fetching datasets for a filter', async () => {
    jest.spyOn(api, 'fetchCollectionsFromEndpointByName').mockRejectedValue(new Error('Filter Error'));

    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-Name'));  
    });

    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-message')).toHaveTextContent('Failed to load datasets.');
    });

    expect(console.log).toHaveBeenCalledWith('Error fetching datasets for filter Name:', expect.any(Error));
  })

  it('should call fetchCollectionsFromEndpointByDate when the Date filter is selected', async () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('filter-button-Date'));
    });

    await waitFor(() => {
      expect(api.fetchCollectionsFromEndpointByDate).toHaveBeenCalledTimes(1);
    });
  });

  it('should collapse and expand the component on button click', async () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    const collapseButton = await waitFor(() => screen.getByTestId('collapse-button'));
    fireEvent.click(collapseButton);

    expect(screen.getByTestId('datasets-container')).toHaveClass('collapsed');

    fireEvent.click(collapseButton);
    expect(screen.getByTestId('datasets-container')).not.toHaveClass('collapsed');
  });

  it('should toggle isToggled state when switch is clicked', async () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);
    const toggleCheckbox = await waitFor(() => screen.getByTestId('toggle-checkbox'));

    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).toBeChecked();

    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).not.toBeChecked();
  });
});
