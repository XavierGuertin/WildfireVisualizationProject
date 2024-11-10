import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { render } from '@testing-library/react';

jest.mock('react', ()=>({
    ...jest.requireActual('react'),
    useState: jest.fn()
  }));

describe(MapMetaData, () => {

    beforeEach(()=>{
        jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("meta data displays city prop", () => {

        const {getByTestId} = render(<MapMetaData city='Montreal'/>);
        const displayedCity = getByTestId("city-div").textContent;
        expect(displayedCity).toEqual("Montreal")
    })
    it("meta data displays dataset name prop", () => {
        const {getByTestId} = render(<MapMetaData name='Dataset1'/>)
        const displayedName = getByTestId("dataset-name").textContent;
        expect(displayedName).toEqual("Dataset1")
    })
    it("meta data displays description prop", () => {
        const {getByTestId} = render(<MapMetaData description='Desc'/>)
        const displayedDesc = getByTestId("dataset-description").textContent;
        expect(displayedDesc).toEqual("Desc")
    })
    it("meta data displays format prop", () => {
        const {getByTestId} = render(<MapMetaData format='CSV'/>)
        const displayedFormat = getByTestId("dataset-format").textContent;
        expect(displayedFormat).toEqual("CSV")
    })
    it("meta data displays processes prop", () => {
        const {getByTestId} = render(<MapMetaData processes='Process'/>)
        const displayedProcesses = getByTestId("dataset-processes").textContent;
        expect(displayedProcesses).toEqual("Process")
    })
    it("meta data displays datasetSource prop", () => {
        const {getByTestId} = render(<MapMetaData datasetSource='Source'/>)
        const displayedSource = getByTestId("dataset-datasource").textContent;
        expect(displayedSource).toEqual("Source")
    })
    it("all data displays in the metadata box", () => {
        const {getByTestId} = render(<MapMetaData city='Montreal' name='Dataset1' description='Desc' format='CSV' processes='Process' datasetSource='Source'/>)

        const displayedCity = getByTestId("city-div").textContent;
        expect(displayedCity).toEqual("Montreal")

        const displayedName = getByTestId("dataset-name").textContent;
        expect(displayedName).toEqual("Dataset1")

        const displayedDesc = getByTestId("dataset-description").textContent;
        expect(displayedDesc).toEqual("Desc")

        const displayedFormat = getByTestId("dataset-format").textContent;
        expect(displayedFormat).toEqual("CSV")

        const displayedProcesses = getByTestId("dataset-processes").textContent;
        expect(displayedProcesses).toEqual("Process")

        const displayedSource = getByTestId("dataset-datasource").textContent;
        expect(displayedSource).toEqual("Source")
    })
    it("metadata box collapses when isCollapsed = false", () => {
        jest.spyOn(React, 'useState').mockImplementation(() => [true, jest.fn()])

        const {getByTestId} = render(<MapMetaData />)
        const collapsedBox = getByTestId("collapsedMetaData");
        expect(collapsedBox).toBeInTheDocument();
    });
})