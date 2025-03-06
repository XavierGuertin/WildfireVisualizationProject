import React, { createContext, PropsWithChildren, useContext, useRef, useState } from 'react';
import { Map } from 'ol';

interface MapLayerContextValue{
    layer: string | null;
    setLayer: React.Dispatch<React.SetStateAction<string | null>>;
    mapRef: React.MutableRefObject<Map | null>;
    resetView: () => void;
    speed: number;
    setSpeed : React.Dispatch<React.SetStateAction<number>>;
    dataItems : object[];
    setDataItems: React.Dispatch<React.SetStateAction<object[]>>;
    isOnline: boolean;
    setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
    timeStamps: string[];
    setTimeStamps: (ts: string[]) => void;
}

const MapLayerContext = createContext<MapLayerContextValue | undefined>(undefined);

export const MapProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [layer, setLayer] = useState<string | null>(null);
    const mapRef = useRef<Map | null>(null);
    const [timeStamps, setTimeStamps] = useState<string[]>([]);

    //Timeline playback speed
    const [speed, setSpeed] = useState<number>(1);

    //Items for the simulation
    const [dataItems, setDataItems] = useState<object[]>([]);

    //Online status
    const [isOnline, setIsOnline] = useState<boolean>(true);

    //Map Specific Functions
    const resetView = () => {
        if (mapRef.current) {
        mapRef.current.getView().animate({
            center: [-75.6972, 45.4215],
            zoom: 1,
        });
        }
    };

    return (
        <MapLayerContext.Provider value = {{ layer, setLayer, mapRef, resetView, speed, setSpeed, dataItems, setDataItems, isOnline, setIsOnline, timeStamps, setTimeStamps}}>
            {children}
        </MapLayerContext.Provider>
    )
}

export const useMapLayerContext = () => {
    const mapLayerContext = useContext(MapLayerContext);
    if (!mapLayerContext) {
      throw new Error('useMapLayerContext must be inside a MapProvider');
    }
    return mapLayerContext;
  };

