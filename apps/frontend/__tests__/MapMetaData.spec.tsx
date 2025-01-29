import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { render, fireEvent, act } from '@testing-library/react';
import { insertDatalayerView } from '../src/app/services/api';
import { changeLayer } from '../src/app/components/MapView';

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
        jest.spyOn(React, 'useState').mockImplementation(() => [false, setStateMock]);
        jest.spyOn(React, 'useState').mockImplementation(() => [true, setStateMock]);
        const { getByTestId } = render(<MapMetaData />);
        expect(getByTestId("collapsedMetaData")).toBeInTheDocument();
    });

    // it("displays the loading module when dataset loading starts", async () => {
    //     jest.useFakeTimers();
    //     const { getByTestId, queryByTestId, rerender } = render(<MapMetaData id="123" />);
    
    //     const loadButton = getByTestId("load-dataset-button");
    
    //     // Ensure loading module is NOT visible initially
    //     expect(queryByTestId("loading-module")).not.toBeInTheDocument();
    
    //     await act(async () => {
    //         fireEvent.click(loadButton);
    //         jest.advanceTimersByTime(500); // Allow loading state to update
    //         rerender(<MapMetaData id="123" />); // 🔹 Force re-render to reflect state change
    //     });
    
    //     expect(getByTestId("loading-module")).toBeInTheDocument(); // ✅ Should be visible now
    
    //     // Simulate loading completion
    //     jest.advanceTimersByTime(4000);
    //     expect(setTimeout).toHaveBeenCalled();
    //     jest.useRealTimers();
    // });       

    it("calls insertDatalayerView and changeLayer when load dataset button is clicked", async () => {
        jest.useFakeTimers();
        const { getByTestId } = render(<MapMetaData id="123" />);
    
        const loadButton = getByTestId("load-dataset-button");
    
        await act(async () => {
            fireEvent.click(loadButton);
            jest.advanceTimersByTime(4000);
        });
    
        expect(insertDatalayerView).toHaveBeenCalledWith("123");
        expect(changeLayer).toHaveBeenCalled();
    
        jest.useRealTimers();
    });
});