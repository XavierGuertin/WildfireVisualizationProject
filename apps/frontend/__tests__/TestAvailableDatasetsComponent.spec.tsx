import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableDatasets, { DatasetMetadata } from '../src/app/components/AvailableDatasets';
import * as api from '../src/app/services/api';

jest.mock('../src/app/services/api');
const mockFetchCollectionsByName = api.fetchCollectionsFromEndpointByName as jest.Mock;
const mockFetchCollectionsByDate = api.fetchCollectionsFromEndpointByDate as jest.Mock;
const mockFetchMetaData = api.fetchMetaData as jest.Mock;
const mockReturnListOfCollections = api.returnListOfCollectionsFromEndpoint as jest.Mock;

const mockDatasets: DatasetMetadata[] = [
  {
    id: "dataset-1",
    name: 'Dataset A',
    date: '2023-01-01',
    enddate: '2023-01-10',
    latestAdded: '',
    latestUpdated: '',
    description: 'Description A',
    format: 'GeoJSON',
    processes: '',
    datasetSource: 'Source A'
  },
  {
    id: "dataset-2",
    name: 'Dataset B',
    date: '2023-02-15',
    enddate: '2023-02-25',
    latestAdded: '',
    latestUpdated: '',
    description: 'Description B',
    format: 'Shapefile',
    processes: '',
    datasetSource: 'Source B'
  }
];

describe('Test AvailableDatasets component', () => {
  let mockOnDatasetClick: jest.Mock;

  beforeEach(() => {
    mockOnDatasetClick = jest.fn();
    jest.clearAllMocks();
    mockReturnListOfCollections.mockResolvedValue(mockDatasets);
  });

  it('should call onDatasetClick on dataset click', async () => {
    mockFetchMetaData.mockResolvedValue(mockDatasets[0]);

    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);

    await waitFor(() => expect(screen.getByTestId('dataset-button-dataset-1')).toBeInTheDocument());

    const datasetButton = screen.getByTestId('dataset-button-dataset-1');
    fireEvent.click(datasetButton);

    await waitFor(() => {
      expect(mockOnDatasetClick).toHaveBeenCalledWith(mockDatasets[0]);
    });
  });

  it('should handle fetchMetaData failure gracefully', async () => {
    mockFetchMetaData.mockResolvedValue({ error: 'Failed to fetch metadata' });
  
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);
  
    await waitFor(() => expect(screen.getByTestId('dataset-button-dataset-1')).toBeInTheDocument());
  
    const datasetButton = screen.getByTestId('dataset-button-dataset-1');
    fireEvent.click(datasetButton);
  
    await waitFor(() => {
      expect(mockOnDatasetClick).not.toHaveBeenCalled(); // Ensure failure does not trigger click
    });
  
    // Optionally check for error handling UI feedback, if any
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
  

  it('should filter datasets by name', async () => {
    mockFetchCollectionsByName.mockResolvedValue(mockDatasets);
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);

    const filterButton = screen.getByTestId('filter-button-Name');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockFetchCollectionsByName).toHaveBeenCalled();
    });
  });

  it('should filter datasets by date', async () => {
    mockFetchCollectionsByDate.mockResolvedValue(mockDatasets);
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);

    const filterButton = screen.getByTestId('filter-button-Date');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockFetchCollectionsByDate).toHaveBeenCalled();
    });
  });

  it('should collapse and expand the component when toggled', async () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);

    const collapseButton = await waitFor(() => screen.getByTestId('collapse-button'));
    fireEvent.click(collapseButton);

    expect(screen.getByTestId('datasets-container')).toHaveClass('collapsed');

    fireEvent.click(collapseButton);
    expect(screen.getByTestId('datasets-container')).not.toHaveClass('collapsed');
  });

  it('should toggle isToggled state when switch is clicked', async () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);

    const toggleCheckbox = await waitFor(() => screen.getByTestId('toggle-checkbox'));
    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).toBeChecked();

    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).not.toBeChecked();
  });

  it('should show error message if datasets fail to load', async () => {
    mockReturnListOfCollections.mockRejectedValue(new Error('Failed to load datasets'));
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-message')).toHaveTextContent('no_datasets_available');
    });
  });

  it('should display no datasets message when dataset list is empty', async () => {
    mockReturnListOfCollections.mockResolvedValue([]); // Return an empty list
  
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);
  
    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-message')).toHaveTextContent('no_datasets_available');
    });
  });
});
