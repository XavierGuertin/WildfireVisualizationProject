import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Layout from '../src/app/layout';
import AvailableDatasets from '../src/app/components/AvailableDatasets';
import MapMetaData from '../src/app/components/MapMetaData';

jest.mock('../src/app/components/AvailableDatasets', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/app/components/MapMetaData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Layout Component', () => {
  beforeEach(() => {
    (AvailableDatasets as jest.Mock).mockImplementation(({ onDatasetClick }) => (
      <div>
        <button
          data-testid="dataset-btn"
          onClick={() =>
            onDatasetClick({
              city: 'TestCity',
              name: 'TestDataset',
              description: 'TestDescription',
              format: 'CSV',
              processes: 'TestProcess',
              datasetSource: 'TestSource',
            })
          }
        >
          Select Dataset
        </button>
      </div>
    ));

    (MapMetaData as jest.Mock).mockImplementation(
      ({ city, name, description, format, processes, datasetSource, onLoadDataset }) => (
        <div data-testid="metadata-box">
          <div data-testid="city-div">{city}</div>
          <div data-testid="dataset-name">{name}</div>
          <div data-testid="dataset-description">{description}</div>
          <div data-testid="dataset-format">{format}</div>
          <div data-testid="dataset-processes">{processes}</div>
          <div data-testid="dataset-datasource">{datasetSource}</div>
          <button data-testid="load-btn" onClick={onLoadDataset}>
            Load Dataset
          </button>
        </div>
      )
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Layout component', () => {
    render(
      <Layout>
        <div data-testid="test-child">Test Child</div>
      </Layout>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('handles dataset selection correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const datasetButton = screen.getByTestId('dataset-btn');
    fireEvent.click(datasetButton);

    expect(MapMetaData).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'TestCity',
        name: 'TestDataset',
        description: 'TestDescription',
        format: 'CSV',
        processes: 'TestProcess',
        datasetSource: 'TestSource',
      }),
      expect.anything()
    );
  });

  it('shows the loading overlay and simulates progress when a dataset is loaded', async () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const datasetButton = screen.getByTestId('dataset-btn');
    fireEvent.click(datasetButton);

    const loadButton = screen.getByTestId('load-btn');
    fireEvent.click(loadButton);

    await waitFor(() => expect(screen.getByTestId('loading-overlay')).toBeInTheDocument());
  });

  it('stops showing the loading overlay after the dataset is loaded', async () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const datasetButton = screen.getByTestId('dataset-btn');
    fireEvent.click(datasetButton);

    const loadButton = screen.getByTestId('load-btn');
    fireEvent.click(loadButton);

    await waitFor(() => expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument());
  });

  it('shows the progress bar incrementing', async () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const datasetButton = screen.getByTestId('dataset-btn');
    fireEvent.click(datasetButton);

    const loadButton = screen.getByTestId('load-btn');
    fireEvent.click(loadButton);

    await waitFor(() => expect(screen.getByTestId('progress-bar')).toHaveStyle('width: 100%'));
  });
});
