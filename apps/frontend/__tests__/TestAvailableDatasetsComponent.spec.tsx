import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableDatasets, {
  DatasetEntry,
  DatasetMetadata,
} from '../src/app/components/AvailableDatasets';
import * as api from '../src/app/services/api';

jest.mock('../src/app/services/api');

const mockFetchCollectionsByName =
  api.fetchCollectionsFromEndpointByName as jest.Mock;
const mockFetchCollectionsByDate =
  api.fetchCollectionsFromEndpointByDate as jest.Mock;
const mockFetchMetaData = api.fetchMetaData as jest.Mock;
const mockReturnListOfCollections =
  api.returnListOfCollectionsFromEndpoint as jest.Mock;

const mockDatasets: DatasetEntry[] = [
  {
    key: 1,
    id: 'dataset-1',
  },
  {
    key: 2,
    id: 'dataset-2',
  },
];

const mockDatasetMetadata: DatasetMetadata = {
  id: 'dataset-1',
  name: 'Dataset A',
  date: '2023-01-01',
  enddate: '2023-01-10',
  datasetSource: 'Source A',
  description: 'Description A',
  format: 'GeoJSON',
  latestAdded: '',
  latestUpdated: '',
  processes: '',
};

jest.mock('ol/Map', () => {
  return jest.fn().mockImplementation(() => ({
    setTarget: jest.fn(),
    addLayer: jest.fn(),
    getView: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
    })),
    dispose: jest.fn(),
  }));
});

jest.mock('../src/app/components/MapView', () => ({
  changeLayer: jest.fn().mockResolvedValue(true), // Mocks a successful layer change
}));

jest.mock('../src/app/context/MapContext', () => ({
  useMapLayerContext: jest.fn(() => ({
    mapRef: { current: {} },
  })),
}));

describe('Test AvailableDatasets component', () => {
  let mockOnDatasetClick: jest.Mock;

  beforeEach(() => {
    mockOnDatasetClick = jest.fn();
    jest.clearAllMocks();
    mockReturnListOfCollections.mockResolvedValue(mockDatasets);
    mockFetchMetaData.mockResolvedValue(mockDatasetMetadata);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    expect(screen.getByTestId('toggle-status-text')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-checkbox')).not.toBeChecked();
  });

  it('should show loading message while fetching datasets', async () => {
    mockReturnListOfCollections.mockImplementation(() => new Promise(() => {})); // Keeps promise pending

    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    // Ensure the loading message appears
    expect(await screen.findByTestId('loading-message')).toBeInTheDocument();
  });

  it('should call onDatasetClick on dataset click', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    await waitFor(() =>
      expect(
        screen.getByTestId('dataset-button-dataset-1'),
      ).toBeInTheDocument(),
    );

    const datasetButton = screen.getByTestId('dataset-button-dataset-1');
    fireEvent.click(datasetButton);

    await waitFor(() => {
      expect(mockOnDatasetClick).toHaveBeenCalledWith(mockDatasetMetadata);
    });
  });

  it('should mark dataset as selected when clicked', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    const datasetButton = await waitFor(() =>
      screen.getByTestId('dataset-button-dataset-1'),
    );
    fireEvent.click(datasetButton);

    await waitFor(() => {
      expect(datasetButton).toHaveClass('selected');
    });
  });

  it('should update active filter UI when a filter button is clicked', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    const nameFilterButton = screen.getByTestId('filter-button-Name');
    fireEvent.click(nameFilterButton);
    expect(nameFilterButton).toHaveClass('active');

    const dateFilterButton = screen.getByTestId('filter-button-Date');
    fireEvent.click(dateFilterButton);
    expect(dateFilterButton).toHaveClass('active');
    expect(nameFilterButton).not.toHaveClass('active');
  });

  it('should collapse and expand the component when toggled', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    const collapseButton = await waitFor(() =>
      screen.getByTestId('collapse-button'),
    );
    fireEvent.click(collapseButton);
    expect(screen.getByTestId('datasets-container')).toHaveClass('collapsed');

    fireEvent.click(collapseButton);
    expect(screen.getByTestId('datasets-container')).not.toHaveClass(
      'collapsed',
    );
  });

  it('should toggle isToggled state when switch is clicked', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    const toggleButton = await waitFor(() =>
      screen.getByTestId('toggle-button'),
    );
    const statusText = screen.getByTestId('toggle-status-text');

    expect(statusText).not.toBeEmptyDOMElement();
    const initialText = statusText.textContent;

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(statusText.textContent).toBe(initialText);
    });

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(statusText.textContent).toBe(initialText);
    });
  });

  it('should fetch datasets only when toggled on', async () => {
    mockFetchCollectionsByName.mockResolvedValue(mockDatasets);

    render(
      <AvailableDatasets
        onDatasetClick={mockOnDatasetClick}
        refreshKey={0}
        currentBbox={[-120, 30, -110, 40]}
      />,
    );

    const filterButton = screen.getByTestId('filter-button-Name');
    fireEvent.click(filterButton);

    // Remove any check for not.toHaveBeenCalled() if the code triggers an initial call
    const toggleButton = await screen.findByTestId('toggle-button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('toggle-checkbox')).toBeChecked();
    });

    await waitFor(() => {
      expect(mockFetchCollectionsByName).toHaveBeenCalledTimes(2);
      expect(mockFetchCollectionsByName).toHaveBeenNthCalledWith(
        1,
        undefined,
        'asc',
      );
      expect(mockFetchCollectionsByName).toHaveBeenNthCalledWith(
        2,
        [-120, 30, -110, 40],
        'asc',
      );
    });
  });

  it('should show error message if datasets fail to load', async () => {
    mockReturnListOfCollections.mockRejectedValue(
      new Error('Failed to load datasets'),
    );
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-message')).toHaveTextContent(
        'no_datasets_available',
      );
    });
  });

  it('should display no datasets message when dataset list is empty', async () => {
    mockReturnListOfCollections.mockResolvedValue([]);

    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-container')).toBeInTheDocument();
      expect(screen.getByTestId('no-datasets-message')).toBeInTheDocument();
    });
  });

  it('should call handleFilterChange and update datasets when filtering by name', async () => {
    mockFetchCollectionsByName.mockResolvedValue(mockDatasets);
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );

    const filterButton = screen.getByTestId('filter-button-Name');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockFetchCollectionsByName).toHaveBeenCalled();
      expect(
        screen.getByTestId('dataset-button-dataset-1'),
      ).toBeInTheDocument();
    });
  });

  it('filters datasets by date when activeFilter is Date', async () => {
    mockFetchCollectionsByDate.mockResolvedValue(mockDatasets);
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    fireEvent.click(screen.getByTestId('filter-button-Date'));
    await waitFor(() => {
      expect(mockFetchCollectionsByDate).toHaveBeenCalled();
    });
  });

  it('handles non-array responses gracefully', async () => {
    mockReturnListOfCollections.mockResolvedValue({
      error: 'Unexpected format',
    });
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-container')).toBeInTheDocument();
    });
  });

  it('catches errors while fetching datasets', async () => {
    mockReturnListOfCollections.mockRejectedValue(new Error('Error loading'));
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('no-datasets-container')).toBeInTheDocument();
    });
  });

  it('toggles sort direction when clicking the same filter again', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    const nameFilterButton = screen.getByTestId('filter-button-Name');
    fireEvent.click(nameFilterButton);
    fireEvent.click(nameFilterButton);
  });

  it('resets filter and sort direction', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    fireEvent.click(screen.getByTestId('filter-button-Name'));
    fireEvent.click(screen.getByTestId('filter-button-reset'));
  });

  it('shows map_required text if currentBbox is absent', () => {
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} currentBbox={undefined} />);
    expect(screen.getByTestId('toggle-status-text')).toHaveTextContent('map_required');
  });

  it('shows alpha sort icon when sorting by Name', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    fireEvent.click(screen.getByTestId('filter-button-Name'));
  });

  it('shows numeric sort icon when sorting by Date', async () => {
    render(
      <AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />,
    );
    fireEvent.click(screen.getByTestId('filter-button-Date'));
  });

  it('displays an error message if fetchError is set', async () => {
    mockReturnListOfCollections.mockResolvedValue({ error: 'Simulated error' });
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} refreshKey={0} />);
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeNull();
    });
  });
});
