import React, { createContext, useContext, useState, PropsWithChildren, useRef  } from "react";
import { Map } from 'ol';

interface MapLayerContextValue{
    layer: string | null;
    setLayer: React.Dispatch<React.SetStateAction<string | null>>;
    mapRef: React.MutableRefObject<Map | null>;
    resetView: () => void;
    speed: number;
    setSpeed : React.Dispatch<React.SetStateAction<number>>;
}

const MapLayerContext = createContext<MapLayerContextValue | undefined>(undefined);

export const MapProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [layer, setLayer] = useState<string | null>(null);
    const mapRef = useRef<Map | null>(null);  
    
    //Timeline playback speed
    const [speed, setSpeed] = useState(() => {
        // Load speed from local storage or default to 1
        try {
          const savedSpeed = localStorage.getItem('playbackSpeed');
          return savedSpeed ? parseFloat(savedSpeed) : 1;
        } catch (e) {
          console.error('Error reading playback speed from localStorage', e);
          return 1;  // default speed
        }
      });

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
        <MapLayerContext.Provider value = {{ layer, setLayer, mapRef, resetView, speed, setSpeed }}>
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

