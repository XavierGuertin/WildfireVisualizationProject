import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Map } from 'ol';

interface MapLayerContextValue {
  layer: string | null;
  setLayer: React.Dispatch<React.SetStateAction<string | null>>;
  mapRef: React.MutableRefObject<Map | null>;
  resetView: () => void;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  dataItems: object[];
  setDataItems: React.Dispatch<React.SetStateAction<object[]>>;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  timeStamps: string[];
  setTimeStamps: (ts: string[]) => void;
  collectionId: string;
  setCollectionId: React.Dispatch<React.SetStateAction<string>>;
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  loadedLayers: any[];
  setLoadedLayers: React.Dispatch<React.SetStateAction<any[]>>;
  isLoadingAssets: boolean;
  setIsLoadingAssets: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAssetLayers: string[];
  setSelectedAssetLayers: React.Dispatch<React.SetStateAction<string[]>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  itemIds: string[];
  setItemIds: React.Dispatch<React.SetStateAction<string[]>>;
  isProcessLoading: boolean;
  setIsProcessLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadedDatasetId: string;
  setLoadedDatasetId: React.Dispatch<React.SetStateAction<string>>;
}

const MapLayerContext = createContext<MapLayerContextValue | undefined>(
  undefined,
);

export const MapProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [layer, setLayer] = useState<string | null>('default');
  const mapRef = useRef<Map | null>(null);
  const [timeStamps, setTimeStamps] = useState<string[]>([]);
  const [collectionId, setCollectionId] = useState<string>(''); // Change to string
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [loadedLayers, setLoadedLayers] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [selectedAssetLayers, setSelectedAssetLayers] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [isProcessLoading, setIsProcessLoading] = useState<boolean>(false);
  const [loadedDatasetId, setLoadedDatasetId] = useState<string>('');

  // Timeline playback speed
  const [speed, setSpeed] = useState<number>(1);
  const [dataItems, setDataItems] = useState<object[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Map Specific Functions
  const resetView = () => {
    if (mapRef.current) {
      const map = mapRef.current;

      // Remove all layers except the one with ID 'baseLayer'
      const layersToRemove = map
        .getLayers()
        .getArray()
        .filter((layer) => {
          return layer.get('id') !== 'baseLayer';
        });

      layersToRemove.forEach((layer) => {
        map.removeLayer(layer);
      });

      // Reset the view
      map.getView().animate({
        center: [-75.6972, 45.4215],
        zoom: 1,
      });
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      layer,
      setLayer,
      mapRef,
      resetView,
      speed,
      setSpeed,
      dataItems,
      setDataItems,
      isOnline,
      setIsOnline,
      timeStamps,
      setTimeStamps,
      collectionId,
      setCollectionId,
      sliderValue,
      setSliderValue,
      loadedLayers,
      setLoadedLayers,
      isLoadingAssets,
      setIsLoadingAssets,
      selectedAssetLayers,
      setSelectedAssetLayers,
      isPlaying,
      setIsPlaying,
      itemIds,
      setItemIds,
      isProcessLoading,
      setIsProcessLoading,
      loadedDatasetId,
      setLoadedDatasetId,
    }),
    [
      layer,
      speed,
      dataItems,
      isOnline,
      timeStamps,
      collectionId,
      sliderValue,
      loadedLayers,
      isLoadingAssets,
      selectedAssetLayers,
      isPlaying,
      itemIds,
      isProcessLoading,
      loadedDatasetId,
    ],
  );

  return (
    <MapLayerContext.Provider value={contextValue}>
      {children}
    </MapLayerContext.Provider>
  );
};

export const useMapLayerContext = () => {
  const mapLayerContext = useContext(MapLayerContext);
  if (!mapLayerContext) {
    throw new Error('useMapLayerContext must be inside a MapProvider');
  }
  return mapLayerContext;
};
