'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import '../styles/map.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { defaults as defaultControls, FullScreen } from 'ol/control.js';
import { useGeographic } from 'ol/proj.js';
import { useMapLayerContext } from './MapContext';
import XYZ from 'ol/source/XYZ';
import Footer from './Footer';
import { TileWMS } from 'ol/source';
import { fetchTimestamps, verifyInternetConnection } from '../services/api';
import debounce from 'lodash/debounce';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { Style, Stroke, Fill } from 'ol/style';
import { timeStamp } from 'console';

const attributions =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const tileserverUrl = process.env.NEXT_PUBLIC_TILESERVER_URL;
const DEFAULT_ENDPOINT_URL = 'https://hirondelle.crim.ca/stac/collections';
const DEFAULT_LAYER_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OFFLINE_LAYER_URL = `${tileserverUrl}/{z}/{x}/{y}.jpg`;
const SATELLITE_LAYER_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const TOPOGRAPHIC_LAYER_URL = 'https://tile.opentopomap.org/{z}/{x}/{y}.png';


// Offline fallback layer for cases with no internet connection
const offlineLayer = new TileLayer({
  source: new XYZ({
    url: OFFLINE_LAYER_URL,
    attributions: attributions,
  }),
});

// Default base layers
const defaultLayer = new TileLayer({
  source: new XYZ({
    url: DEFAULT_LAYER_URL,
    attributions: attributions,
  }),
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: SATELLITE_LAYER_URL,
    attributions: attributions,
  }),
});

const topographicLayer = new TileLayer({
  source: new XYZ({
    url: TOPOGRAPHIC_LAYER_URL,
    attributions: attributions,
  }),
});

/**
 * Creates a dynamic data layer that pulls STAC item data from GeoServer.
 *
 * @returns {TileLayer} The generated data layer for the map.
 */
const createCollectionDataLayer = (): VectorLayer => {
  const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: `${geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Default:datalayer&outputFormat=application/json`,
  });

  const newLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }), // Keeping blue for distinction
      stroke: new Stroke({ color: 'rgba(0, 0, 255, 0.5)', width: 2 })
    })
  });

  newLayer.set('id', 'dataLayer');
  return newLayer;
};

const createItemDataLayer = (timestamp: string): VectorLayer => {
  const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;
  
  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: `${geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Default:items&cql_filter=datetime='${timestamp}'&outputFormat=application/json`,
  });

  const newLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' }),
      stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.5)', width: 2 })
    })
  });

  newLayer.set('id', 'itemLayer');
  return newLayer;
};

/**
 * Refreshes the data layer on the map by removing the old layer and adding a new one.
 *
 * @param {Map} map - The OpenLayers map instance.
 */
export const refreshLayer = (map: Map, collection: boolean, timestamp?: string) => {
  const layers = map.getLayers().getArray();
  const dataLayer = layers.find((layer) => layer.get('id') === 'dataLayer');
  const itemLayer = layers.find((layer) => layer.get('id') === 'itemLayer');

  if(collection){
    if (dataLayer) {
      map.removeLayer(dataLayer);
    }
    const newLayer = createCollectionDataLayer()
    map.addLayer(newLayer);
  }

  if(timestamp){
    if (itemLayer) {
      map.removeLayer(itemLayer);
    }
    const newLayer = createItemDataLayer(timestamp);
    map.addLayer(newLayer);
  }
};

interface MapViewProps {
  onBboxChange: (bbox: number[]) => void;
}

/**
 * Main map component using OpenLayers, responsible for rendering and updating the map.
 *
 * @param {MapViewProps} props - Component props including bbox change handler.
 * @returns {JSX.Element} The rendered map component.
 */
const MapView = ({ onBboxChange }: MapViewProps) => {
  useGeographic();
  const mapElement = useRef(null);
  const { layer, mapRef, setIsOnline, isOnline } = useMapLayerContext();

  /**
   * Determines which base layer to use based on network connectivity.
   *
   * @returns {TileLayer} The appropriate base layer.
   */
  const getLayer = (): TileLayer => {
    const layerMap: Record<string, TileLayer> = {
      satellite: satelliteLayer,
      topographical: topographicLayer,
      default: defaultLayer,
    };

    offlineLayer.set('offline', true);

    // Select the appropriate layer based on network connectivity
    const selectedLayer = isOnline
      ? layerMap[layer ?? 'default']
      : offlineLayer;
    if (!selectedLayer.get('id')) {
      selectedLayer.set('id', 'baseLayer');
    }

    return selectedLayer;
  };

  /**
   * Checks internet connectivity by verifying a connection to a remote STAC server.
   */
  const setOnlineStatus = async () => {
    try {
      const response = await verifyInternetConnection(DEFAULT_ENDPOINT_URL);
      setIsOnline(response === 'Internet connection established');
    } catch (error) {
      setIsOnline(false);
      console.warn('No internet connection detected.');
    }
  };

  useEffect(() => {
    setOnlineStatus();

    if (!mapRef.current) {
      // Initialize the map if it hasn't been created yet
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen()]),
        layers: [getLayer(), createCollectionDataLayer()],
        view: new View({
          center: [-75.6972, 45.4215], // Ottawa
          zoom: 1,
        }),
      });

      // Calculate and update the initial bounding box
      const initialExtent = mapRef.current
        .getView()
        .calculateExtent(mapRef.current.getSize());
      console.debug(`Initial Map Extent: ${initialExtent}`);
    } else {
      const map = mapRef.current;
      const layers = map.getLayers().getArray();
      const baseLayer = layers.find((layer) => layer.get('id') === 'baseLayer');
      if (baseLayer) {
        map.removeLayer(baseLayer);
      }
      map.addLayer(getLayer());
    }
  }, [layer]);

  useEffect(() => {
    const debouncedBboxChange = debounce((extent: number[]) => {
      onBboxChange(extent);
    }, 300);

    if (mapRef.current) {
      const map = mapRef.current;
      const view = map.getView();

      // Listen for zoom events and update bounding box
      view.on('change:resolution', () => {
        const mapExtent = view.calculateExtent(map.getSize());
        debouncedBboxChange(mapExtent);
        console.debug('Map extent updated due to zoom change.');
      });

      // Listen for pan events and update bounding box
      view.on('change:center', () => {
        const mapExtent = view.calculateExtent(map.getSize());
        debouncedBboxChange(mapExtent);
        console.debug('Map extent updated due to pan movement.');
      });
    }

    return () => {
      debouncedBboxChange.cancel();
    };
  }, [onBboxChange]);

  return (
    <div id="map-container" ref={mapElement} data-testid="map-container">
      <Footer />
    </div>
  );
};

/**
 * Utility function to trigger a refresh of the data layer.
 *
 * @param {Map} map - The OpenLayers map instance.
 */
export const changeLayer = (map: Map, collection: boolean, timestamp?: string) => {
  if(collection){
    refreshLayer(map, collection=true)
  }
  if(timestamp){
    refreshLayer(map, collection=false, timestamp);
  }
};

export default MapView;
