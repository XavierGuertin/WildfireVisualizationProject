import React from 'react';
import '@testing-library/jest-dom';
import MapView from '../src/app/components/MapView';
import { render } from '@testing-library/react';
import { MapProvider } from '../src/app/components/MapContext';
import fetchMock from 'jest-fetch-mock';

jest.mock('react', ()=>({
    ...jest.requireActual('react'),
    useState: jest.fn(),
    useContext: jest.fn(),
    useRef: jest.fn(),
  }));

jest.mock('ol/source/XYZ', () =>{
    return jest.fn().mockImplementation(() => {
        return {}
    })
})

jest.mock('ol/layer/Tile', () =>{
    return jest.fn().mockImplementation(() => {
        return {}
    })
})

jest.mock('ol/View', () =>{
    return jest.fn().mockImplementation(() => {
        return {}
    })
})

jest.mock('ol/control.js', () => ({
    ...jest.requireActual('ol/control.js'),
    defaults: jest.fn(() => ({
        extend: jest.fn()
    }))
}))

jest.mock('../src/app/components/MapContext', () => ({
    ...jest.requireActual('../src/app/components/MapContext'),
    useMapLayerContext: jest.fn().mockReturnValue({
        layer: "Default",
        setLayer: jest.fn(),
        mapRef: jest.fn(),
        resetView: jest.fn(),
    })
}))


describe(MapView, () => {

    beforeEach(()=>{    
        jest.spyOn(React, 'useState').mockImplementation(() => [false, jest.fn()]);
        jest.spyOn(React, 'useContext').mockReturnValue({});
        jest.spyOn(React, 'useRef').mockReturnValue({current: null})
        fetchMock.enableMocks()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("renders", () => {
        const MapViewComponent = () => {
            return <MapProvider><MapView /></MapProvider>
        }
        fetchMock.mockResponseOnce(JSON.stringify({ ok: true }))
        
        render(<MapViewComponent />)
    })
})