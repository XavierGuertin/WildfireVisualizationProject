import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { render, fireEvent, act } from '@testing-library/react';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn()
}));

jest.mock('../src/app/services/api', () => ({
    insertDatalayerView: jest.fn(),
}));

jest.mock('../src/app/components/MapView', () => ({
    changeLayer: jest.fn(),
}));

jest.mock('../src/app/components/MapContext', () => ({
  useMapLayerContext: jest.fn(() => ({
    layer: "default",
    mapRef: { current: null },
  })),
}));


describe(MapMetaData, () => {
    let setStateMock: any;
    beforeEach(() => {
        setStateMock = jest.fn();
        jest.spyOn(React, 'useState').mockImplementation(() => [false, setStateMock]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("meta data displays dataset name prop", () => {
        const { getByTestId } = render(<MapMetaData name='Dataset1' />);
        expect(getByTestId("name-div").textContent).toEqual("Dataset1");
    });

    it("meta data displays description prop", () => {
        const { getByTestId } = render(<MapMetaData description='Desc' />);
        expect(getByTestId("dataset-description").textContent).toEqual("Desc");
    });

    it("meta data displays format prop", () => {
        const { getByTestId } = render(<MapMetaData format='CSV' />);
        expect(getByTestId("dataset-format").textContent).toEqual("CSV");
    });

    it("meta data displays processes prop", () => {
        const { getByTestId } = render(<MapMetaData processes='Process' />);
        expect(getByTestId("dataset-processes").textContent).toEqual("Process");
    });

    it("meta data displays datasetSource prop", () => {
        const { getByTestId } = render(<MapMetaData datasetSource='Source' />);
        expect(getByTestId("dataset-datasource").textContent).toEqual("Source");
    });

    it("metadata box collapses when isCollapsed = false", () => {
        setStateMock = jest.fn();
        jest.spyOn(React, 'useState').mockImplementation(() => [true, setStateMock]);
        const { getByTestId } = render(<MapMetaData />);
        expect(getByTestId("collapsedMetaData")).toBeInTheDocument();
    });

    it("calls showLoadingBar and increments progress until it reaches 100", async () => {
        jest.useFakeTimers();

        let progressState = 0;
        const setProgressMock = jest.fn((updateFn) => {
            if (typeof updateFn === "function") {
                progressState = updateFn(progressState);
            } else {
                progressState = updateFn;
            }
        });

        jest.spyOn(React, "useState")
            .mockImplementationOnce(() => [false, jest.fn()])
            .mockImplementationOnce(() => [false, jest.fn()])
            .mockImplementationOnce(() => [progressState, setProgressMock]);

        const { getByTestId } = render(<MapMetaData id="123" />);
        const loadButton = getByTestId("load-dataset-button");

        await act(async () => {
            fireEvent.click(loadButton);
        });

        // Simulate the progress updates over time
        for (let i = 0; i < 10; i++) {
            jest.advanceTimersByTime(300);
            await act(async () => {});
        }

        // Ensure `setProgress` was called multiple times (progress is updating)
        expect(setProgressMock).toHaveBeenCalledTimes(11);
        expect(progressState).toBe(100);

        jest.useRealTimers();
    });

    it("handles errors in onLoadDataset gracefully", async () => {
        jest.useFakeTimers();

        // Mock error in insertDatalayerView
        const errorMock = new Error("API failure");
        const insertDatalayerViewMock = require("../src/app/services/api").insertDatalayerView;
        insertDatalayerViewMock.mockRejectedValue(errorMock);

        let setLoadingMock = jest.fn();
        let setProgressMock = jest.fn();

        jest.spyOn(React, "useState")
            .mockImplementationOnce(() => [false, jest.fn()])
            .mockImplementationOnce(() => [false, setLoadingMock])
            .mockImplementationOnce(() => [0, setProgressMock]);

        const { getByTestId } = render(<MapMetaData id="123" />);
        const loadButton = getByTestId("load-dataset-button");

        await act(async () => {
            fireEvent.click(loadButton);
        });

        // Advance time to trigger progress bar updates
        jest.advanceTimersByTime(4000);
        await act(async () => {});

        // Check if the error was logged and loading state was reset
        expect(insertDatalayerViewMock).toHaveBeenCalledWith("123");
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(setLoadingMock).toHaveBeenCalledWith(false);
        expect(setProgressMock).toHaveBeenCalled();

        jest.useRealTimers();
    });
});
