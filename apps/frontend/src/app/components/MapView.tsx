'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import '../styles/map.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { defaults as defaultControls, FullScreen } from 'ol/control.js';
import { useGeographic } from 'ol/proj.js';
import { useMapLayerContext } from '../context/MapContext';
import XYZ from 'ol/source/XYZ';
import Footer from './Footer';
import debounce from 'lodash/debounce';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { Style, Stroke, Fill } from 'ol/style';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';

const attributions =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const tileserverUrl = process.env.NEXT_PUBLIC_TILESERVER_URL;
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
  zIndex: -10,
});

// Default base layers
const defaultLayer = new TileLayer({
  source: new XYZ({
    url: DEFAULT_LAYER_URL,
    attributions: attributions,
  }),
  zIndex: -10,
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: SATELLITE_LAYER_URL,
    attributions: attributions,
  }),
  zIndex: -10,
});

const topographicLayer = new TileLayer({
  source: new XYZ({
    url: TOPOGRAPHIC_LAYER_URL,
    attributions: attributions,
  }),
  zIndex: -10,
});

/**
 * Creates a dynamic data layer that pulls STAC item data from GeoServer.
 *
 * @returns {VectorLayer} The generated collection data layer for the map.
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

/**
 * Creates a dynamic data layer that pulls STAC item data from GeoServer.
 *
 * @returns {VectorLayer} The generated item data layer for the map.
 */
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
 * Refreshes the data layers on the map by removing the old layers and adding a new one, also depending on
 * both the collection layer and items layer
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
  const { layer, mapRef, isOnline } = useMapLayerContext();

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

  useEffect(() => {
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
    } else {
      const map = mapRef.current;
      const layers = map.getLayers().getArray();
      const baseLayer = layers.find((layer) => layer.get('id') === 'baseLayer');
      if (baseLayer) {
        map.removeLayer(baseLayer);
      }
      map.addLayer(getLayer());
    }
  }, [layer, isOnline]);

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
      });

      // Listen for pan events and update bounding box
      view.on('change:center', () => {
        const mapExtent = view.calculateExtent(map.getSize());
        debouncedBboxChange(mapExtent);
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

/**
 * Adds or removes an asset layer from the map
 *
 * @param {Map} map - The OpenLayers map instance
 * @param {string} layerName - The name of the layer
 * @param {string} layerUrl - The URL for the tile source
 * @param {boolean} add - Whether to add (true) or remove (false) the layer
 */
export const toggleAssetLayer = (map: Map, layerName: string, layerUrl: string, add: boolean): void => {
  // First check if layer already exists
  const layers = map.getLayers().getArray();
  const existingLayer = layers.find((layer) => layer.get('name') === layerName);

  if (add && !existingLayer) {
    console.log(`Adding layer: ${layerName} with URL: ${layerUrl}`);

    // Add the layer
    const newLayer = new ImageLayer({
      source: new ImageWMS({
        url: layerUrl,
        params: { STYLES: layerName},
        // Add crossOrigin to handle potential CORS issues
        crossOrigin: 'anonymous',
      }),
      zIndex: 20,
      opacity: 1.0,
      visible: true,
    });
    newLayer.set('style',)
    // Set a name to identify this asset layer later
    newLayer.set('name', layerName);
    newLayer.set('type', 'asset');

    map.addLayer(newLayer);

    // Force render update
    map.renderSync();

    // Log successful addition
    console.log(`Layer ${layerName} added to map`);
  } else if (!add && existingLayer) {
    // Remove the layer
    console.log(`Removing layer: ${layerName}`);
    map.removeLayer(existingLayer);
    map.renderSync();
  }
};

/**
 * Removes all asset layers from the map
 *
 * @param {Map} map - The OpenLayers map instance
 */
export const removeAllAssetLayers = (map: Map): void => {
  const layers = map.getLayers().getArray();
  const assetLayers = layers.filter((layer) => layer.get('type') === 'asset');

  assetLayers.forEach(layer => {
    map.removeLayer(layer);
  });
};

export default MapView;
