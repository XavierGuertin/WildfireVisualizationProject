import { createContext, useContext, useRef } from "react";
import { Map } from 'ol';
import { Layer } from "../layout" 

export const LayerContext = createContext<Layer | undefined>(undefined);

export function useLayerContext(){
    const layer = useContext(LayerContext);
    
    if(layer === undefined){
        throw new Error("Layer is undefined. Ensure that the component is wrapped in LayerContext.Provider");
    }

    return layer;
}