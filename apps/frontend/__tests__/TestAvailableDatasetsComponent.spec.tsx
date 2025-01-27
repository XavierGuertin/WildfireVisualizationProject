import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableDatasets, { DatasetMetadata } from '../src/app/components/AvailableDatasets';
import axios from 'axios';
import fetchMock from 'jest-fetch-mock';
import * as api from '../src/app/services/api'

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockDatasets: DatasetMetadata[] = [
  { id:"test", name: 'Dataset A', date: '2023-01-01', latestAdded: '2023-02-01', latestUpdated: '2023-03-01', description: 'Description A', format: 'GeoJSON', processes: 'Data analysis', datasetSource: 'Source A' },
  { id:"test", name: 'Dataset B', date: '2023-02-15', latestAdded: '2023-02-16', latestUpdated: '2023-03-05', description: 'Description B', format: 'Shapefile', processes: 'Data cleaning', datasetSource: 'Source B' }
];

describe('Test AvailableDatasets component', () => {
  let mockOnDatasetClick: jest.Mock;

  beforeEach(() => {
    mockOnDatasetClick = jest.fn();
    jest.clearAllMocks();
  });


  it('should call onDatasetClick on dataset click', async () => {
    const mockDatasets = [
      {
        id: "test",
        name: 'Dataset A',
        date: '2023-01-01',
        latestAdded: '2023-02-01',
        latestUpdated: '2023-03-01',
        description: 'Description for Dataset A',
        format: 'GeoJSON',
        processes: 'Data analysis',
        datasetSource: 'Source A'
      },
    ];

    jest.spyOn(api, 'fetchMetaData').mockImplementation(() => Promise.resolve(mockDatasets[0]))

    fetchMock.enableMocks()

    fetchMock.mockResponseOnce(JSON.stringify(mockDatasets))



    // Render component with mock function
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    // Wait for the dataset button to appear after data is loaded
    await waitFor(() => expect(screen.getByTestId('dataset-button-0')).toBeInTheDocument());

    // Click the dataset button to trigger loading
    const datasetButton = screen.getByTestId('dataset-button-0');
    fireEvent.click(datasetButton);

    // Check if onDatasetClick is called after loading completes
    await waitFor(() => {
      expect(mockOnDatasetClick).toHaveBeenCalledWith(mockDatasets[0]);
    });
  });


  it('should display sorted datasets when sorting is applied', async () => {
    const mockDatasets = [
      {
        id: "test",
        name: 'Dataset A',
        date: '2023-01-01',
        latestAdded: '2023-02-01',
        latestUpdated: '2023-03-01',
        description: 'Description for Dataset A',
        format: 'GeoJSON',
        processes: 'Data analysis',
        datasetSource: 'Source A'
      },
    ];
    
    jest.spyOn(api, 'fetchMetaData').mockImplementation(() => Promise.resolve(mockDatasets[0]))
    fetchMock.enableMocks()
    fetchMock.mockResponseOnce(JSON.stringify(mockDatasets))

    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    await waitFor(() => expect(screen.getByTestId('dataset-button-0')).toBeInTheDocument());

    fireEvent.click(screen.getByText('date'));
    const datasetButtons = screen.getAllByTestId(/dataset-button-/);
    expect(datasetButtons[0]).toHaveTextContent('test'); // Validate sort order
  });

  it('should collapse and expand the component on button click', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockDatasets });
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);

    const collapseButton = await waitFor(() => screen.getByTestId('collapse-button'));
    fireEvent.click(collapseButton); // Collapse

    expect(screen.getByTestId('datasets-container')).toHaveClass('collapsed');

    fireEvent.click(collapseButton); // Expand
    expect(screen.getByTestId('datasets-container')).not.toHaveClass('collapsed');
  });

  it('should toggle isToggled state when switch is clicked', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockDatasets });
    render(<AvailableDatasets onDatasetClick={mockOnDatasetClick} />);
    const toggleCheckbox = await waitFor(() => screen.getByTestId('toggle-checkbox'));

    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).toBeChecked();

    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).not.toBeChecked();
  });
});
