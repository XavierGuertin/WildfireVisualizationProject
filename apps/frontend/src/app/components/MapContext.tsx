import React, { createContext, useContext, useState, PropsWithChildren, useRef  } from "react";
import { Map } from 'ol';

interface MapLayerContextValue{
    layer: string | null;
    setLayer: React.Dispatch<React.SetStateAction<string | null>>;
    mapRef: React.MutableRefObject<Map | null>;
    resetView: () => void;
}

const MapLayerContext = createContext<MapLayerContextValue | undefined>(undefined);

export const MapProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [layer, setLayer] = useState<string | null>(null);
    const mapRef = useRef<Map | null>(null);    

    //Map Specific Functions
    const resetView = () => {
        if (mapRef.current) {
        mapRef.current.getView().animate({
            center: [-75.6972, 45.4215],
            zoom: 5,
            duration: 1000,
        });
        }
    };
 
    return (
        <MapLayerContext.Provider value = {{ layer, setLayer, mapRef, resetView }}>
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

