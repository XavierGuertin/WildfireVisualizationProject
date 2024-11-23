import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../src/app/layout';
import { Dataset } from '../src/app/components/AvailableDatasets';

jest.mock('react', ()=>({
  ...jest.requireActual('react'),
  useState: jest.fn()
}));

describe('Layout Component - Load Dataset Button Tests', () => {


  beforeEach(()=>{
    jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockDataset: Dataset = {
    city: 'Mock City',
    date: '2023-01-01',
    datasetSource: 'Mock Source',
    description: 'Mock description',
    format: 'GeoJSON',
    latestAdded: '2023-02-01',
    latestUpdated: '2023-03-01',
    name: 'Mock Dataset',
    processes: 'Mock process',
  };

  it('shows the loading bar on clicking "Load Dataset" and hides it after reaching 100%', async () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    // Simulate selecting a dataset
    const datasetButton = screen.getByText('Dataset A'); // Ensure this dataset is present
    fireEvent.click(datasetButton);

    // Simulate clicking the "Load Dataset" button
    const loadButton = screen.getByTestId('load-dataset-button');
    fireEvent.click(loadButton);

    // Check that the loading overlay appears
    const loadingOverlay = screen.getByTestId('loading-overlay');
    expect(loadingOverlay).toBeInTheDocument();

    // Wait for the loading bar to disappear
    await waitFor(() => {
      expect(loadingOverlay).not.toBeInTheDocument();
    }, { timeout: 5000 }); // Adjust timeout if necessary
  });
});
