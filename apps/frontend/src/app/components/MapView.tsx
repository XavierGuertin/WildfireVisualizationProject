'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import "../styles/map.css";
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { FullScreen, defaults as defaultControls } from 'ol/control.js';
import { useGeographic } from 'ol/proj.js';
import { useMapLayerContext } from './MapContext';
import XYZ from 'ol/source/XYZ';
import Footer from './Footer';
import { TileWMS } from 'ol/source';
import { insertMockItemData, verifyInternetConnection } from '../services/api';
import debounce from 'lodash/debounce';

const attributions = '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const tileserverUrl = process.env.NEXT_PUBLIC_TILESERVER_URL;

// Offline fallback layer for cases with no internet connection
const offlineLayer = new TileLayer({
  source: new XYZ({
    url: `${tileserverUrl}/{z}/{x}/{y}.jpg`,
    attributions: attributions
  })
});

// Default base layers
const defaultLayer = new TileLayer({
  source: new XYZ({
    url: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
    attributions: attributions
  })
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    attributions: attributions
  })
});

const topographicLayer = new TileLayer({
  source: new XYZ({
    url: `https://tile.opentopomap.org/{z}/{x}/{y}.png`,
    attributions: attributions
  })
});

/**
 * Creates a dynamic data layer that pulls STAC item data from GeoServer.
 * 
 * @returns {TileLayer} The generated data layer for the map.
 */
const createDataLayer = () => {
  const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;
  const newLayer = new TileLayer({
    source: new TileWMS({
      url: geoserverUrl,
      params: {
        'LAYERS': 'Default:datalayer',
        'TILED': true,
        'CACHED': false,
        '_t': Date.now(),  // Cache busting
      },
      serverType: 'geoserver',
    }),
  });
  newLayer.set('id', 'dataLayer');
  return newLayer;
};

/**
 * Refreshes the data layer on the map by removing the old layer and adding a new one.
 * 
 * @param {Map} map - The OpenLayers map instance.
 */
export const refreshLayer = (map: Map) => {
  const layers = map.getLayers().getArray();
  const dataLayer = layers.find(layer => layer.get('id') === 'dataLayer');

  if (dataLayer) {
    map.removeLayer(dataLayer);
  }

  const newLayer = createDataLayer();
  map.addLayer(newLayer);
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

    offlineLayer.set("offline", true);

    // Select the appropriate layer based on network connectivity
    const selectedLayer = isOnline ? layerMap[layer ?? "default"] : offlineLayer;
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
      const response = await verifyInternetConnection("https://hirondelle.crim.ca/stac/collections");
      setIsOnline(response === "Internet connection established");
    } catch (error) {
      setIsOnline(false);
      console.warn('No internet connection detected.');
    }
  };

  useEffect(() => {
    insertMockItemData(); // Temporary: To be removed once real data is received
    setOnlineStatus();

    const debouncedBboxChange = debounce((extent: number[]) => {
      onBboxChange(extent);
    }, 300);

    if (!mapRef.current) {
      // Initialize the map if it hasn't been created yet
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen()]),
        layers: [getLayer(), createDataLayer()],
        view: new View({
          center: [-75.6972, 45.4215], // Ottawa
          zoom: 1,
        }),
      });

      // Calculate and update the initial bounding box
      const initialExtent = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
      console.debug(`Initial Map Extent: ${initialExtent}`);
    } else {
      const map = mapRef.current;
      const layers = map.getLayers().getArray();
      const baseLayer = layers.find(layer => layer.get('id') === 'baseLayer');
      if (baseLayer) {
        map.removeLayer(baseLayer);
      }
      map.addLayer(getLayer());
      refreshLayer(map); // Ensure data layer is refreshed
    }

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
  }, [layer, onBboxChange]);

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
export const changeLayer = (map: Map) => {
  refreshLayer(map);
};

export default MapView;