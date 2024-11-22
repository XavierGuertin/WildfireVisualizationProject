import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../src/app/layout';
import AvailableDatasets, { Dataset } from '../src/app/components/AvailableDatasets';

jest.mock('../src/app/components/AvailableDatasets', () => ({
  __esModule: true,
  default: ({ onDatasetClick }: { onDatasetClick: jest.Mock }) => (
    <div data-testid="available-datasets">
      <button
        data-testid="dataset-button-0"
        onClick={() => onDatasetClick(mockDataset)}
      >
        Dataset A
      </button>
    </div>
  ),
}));

jest.mock('../src/app/components/MapMetaData', () => ({
  __esModule: true,
  default: ({
    onLoadDataset,
  }: {
    onLoadDataset: jest.Mock;
  }) => (
    <div data-testid="map-metadata">
      <button data-testid="load-dataset-button" onClick={onLoadDataset}>
        Load Dataset
      </button>
    </div>
  ),
}));

const mockDataset: Dataset = {
  name: 'Dataset A',
  date: '2023-01-01',
  latestAdded: '2023-02-01',
  latestUpdated: '2023-03-01',
  city: 'City A',
  description: 'Description A',
  format: 'GeoJSON',
  processes: 'Data analysis',
  datasetSource: 'Source A',
};

describe('Layout Component', () => {
  let mockOnDatasetClick: jest.Mock;
  let mockOnLoadDataset: jest.Mock;
  let useStateSpy: jest.SpyInstance;

  beforeEach(() => {
    mockOnDatasetClick = jest.fn();
    mockOnLoadDataset = jest.fn();

    // Mock useState
    useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy
      .mockImplementationOnce(() => [false, jest.fn()]) // Mock for loading
      .mockImplementationOnce(() => [0, jest.fn()]) // Mock for progress
      .mockImplementationOnce(() => [null, jest.fn()]); // Mock for selectedDataset
  });

  afterEach(() => {
    jest.clearAllMocks();
    useStateSpy.mockRestore(); // Restore original useState implementation
  });

  it('renders Layout and displays AvailableDatasets component', async () => {
    render(<Layout>{null}</Layout>);

    // Ensure the AvailableDatasets component is rendered
    const availableDatasets = screen.getByTestId('available-datasets');
    expect(availableDatasets).toBeInTheDocument();
  });

  it('handles dataset selection and triggers MapMetaData display', async () => {
    render(<Layout>{null}</Layout>);

    // Simulate dataset selection
    const datasetButton = screen.getByTestId('dataset-button-0');
    fireEvent.click(datasetButton);

    // Check that MapMetaData is displayed
    const mapMetadata = await waitFor(() =>
      screen.getByTestId('map-metadata')
    );
    expect(mapMetadata).toBeInTheDocument();
  });

  it('handles dataset loading with progress simulation', async () => {
    render(<Layout>{null}</Layout>);

    // Simulate dataset selection
    const datasetButton = screen.getByTestId('dataset-button-0');
    fireEvent.click(datasetButton);

    // Simulate loading dataset
    const loadButton = await waitFor(() =>
      screen.getByTestId('load-dataset-button')
    );
    fireEvent.click(loadButton);

    // Ensure progress simulation starts
    await waitFor(() =>
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    );

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());
  });
});
