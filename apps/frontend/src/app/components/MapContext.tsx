import React, { createContext, useContext, useState, PropsWithChildren  } from "react";

interface MapLayerContextValue{
    layer: string | null;
    setLayer: React.Dispatch<React.SetStateAction<string | null>>;
}

const MapLayerContext = createContext<MapLayerContextValue | undefined>(undefined);

export const MapLayerProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [layer, setLayer] = useState<string | null>(null);
 
    return (
        <MapLayerContext.Provider value = {{ layer, setLayer }}>
            {children}
        </MapLayerContext.Provider>
    )
}

export const useMapLayerContext = () => {
    const mapLayerContext = useContext(MapLayerContext);
    if (!mapLayerContext) {
      throw new Error('useOnboardingContext must be inside a MapLayerProvider');
    }
    return mapLayerContext;
  };
