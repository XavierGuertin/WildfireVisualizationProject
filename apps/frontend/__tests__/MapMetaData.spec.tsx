import React from 'react';
import '@testing-library/jest-dom';
import MapMetaData from '../src/app/components/MapMetaData';
import { render, fireEvent, act } from '@testing-library/react';
import { insertDatalayerView } from '../src/app/services/api';
import { changeLayer } from '../src/app/components/MapView';

jest.mock('react', ()=>({
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

    beforeEach(()=>{
        jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("meta data displays dataset name prop", () => {
        const {getByTestId} = render(<MapMetaData name='Dataset1' onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } }/>)
        const displayedName = getByTestId("name-div").textContent;
        expect(displayedName).toEqual("Dataset1")
    })
    it("meta data displays description prop", () => {
        const {getByTestId} = render(<MapMetaData description='Desc' onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } }/>)
        const displayedDesc = getByTestId("dataset-description").textContent;
        expect(displayedDesc).toEqual("Desc")
    })
    it("meta data displays format prop", () => {
        const {getByTestId} = render(<MapMetaData format='CSV' onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } }/>)
        const displayedFormat = getByTestId("dataset-format").textContent;
        expect(displayedFormat).toEqual("CSV")
    })
    it("meta data displays processes prop", () => {
        const {getByTestId} = render(<MapMetaData processes='Process' onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } }/>)
        const displayedProcesses = getByTestId("dataset-processes").textContent;
        expect(displayedProcesses).toEqual("Process")
    })
    it("meta data displays datasetSource prop", () => {
        const {getByTestId} = render(<MapMetaData datasetSource='Source' onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } }/>)
        const displayedSource = getByTestId("dataset-datasource").textContent;
        expect(displayedSource).toEqual("Source")
    })
    it("all data displays in the metadata box", () => {
        const {getByTestId} = render(<MapMetaData name='Dataset1' description='Desc' format='CSV' processes='Process' datasetSource='Source' onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } }/>)

        const displayedName = getByTestId("name-div").textContent;
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

        const {getByTestId} = render(<MapMetaData onLoadDataset={function (): void {
            throw new Error('Function not implemented.');
        } } />)
        const collapsedBox = getByTestId("collapsedMetaData");
        expect(collapsedBox).toBeInTheDocument();
    });
    it('calls insertDatalayerView and changeLayer when load dataset button is clicked', async () => {
        const mockOnLoadDataset = jest.fn();
    
        const { getByTestId } = render(
            <MapMetaData 
                id="123" 
                onLoadDataset={mockOnLoadDataset} 
            />
        );
    
        const loadButton = getByTestId('load-dataset-button');
    
        await act(async () => {
            fireEvent.click(loadButton);
        });
    
        expect(insertDatalayerView).toHaveBeenCalledWith("123");
        expect(changeLayer).toHaveBeenCalled();
    });
})