'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import '../styles/map.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import {
  Attribution,
  defaults as defaultControls,
  FullScreen,
} from 'ol/control.js';
import { useGeographic } from 'ol/proj.js';
import { useMapLayerContext } from '../context/MapContext';
import XYZ from 'ol/source/XYZ';
import Footer from './Footer';
import debounce from 'lodash/debounce';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { Fill, Stroke, Style } from 'ol/style';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';
import { createItemAssetStyle } from '../styles/ItemAssetSyle';

// Attributions
const attribution =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const arcGIS_attribution = 'ArcGIS Online map hosted by Esri';
const opentopomap_attribution =
  '<a href="https://opentopomap.org">&copy; OpenTopoMap</a>';

// Map layers
const tileserverUrl = process.env.NEXT_PUBLIC_TILESERVER_URL;
const DEFAULT_LAYER_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OFFLINE_LAYER_URL = `${tileserverUrl}/{z}/{x}/{y}.jpg`;
const SATELLITE_LAYER_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const TOPOGRAPHIC_LAYER_URL = 'https://tile.opentopomap.org/{z}/{x}/{y}.png';

// Default style values for itemLayer
let currentItemLayerFillColor = 'rgba(255, 0, 0, 0.1)';
let currentItemLayerStrokeColor = 'rgba(255, 0, 0, 0.5)';
let currentItemLayerStrokeWidth = 2;

// Default style values for dataLayer
let currentDataLayerFillColor = 'rgba(0, 0, 255, 0.1)';
let currentDataLayerStrokeColor = 'rgba(0, 0, 255, 0.5)';
let currentDataLayerStrokeWidth = 2;

// Offline fallback layer for cases with no internet connection
const offlineLayer = new TileLayer({
  source: new XYZ({
    url: OFFLINE_LAYER_URL,
    attributions: attribution,
  }),
  zIndex: -10,
});

// Default base layers
const defaultLayer = new TileLayer({
  source: new XYZ({
    url: DEFAULT_LAYER_URL,
    attributions: attribution,
  }),
  zIndex: -10,
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: SATELLITE_LAYER_URL,
    attributions: arcGIS_attribution,
  }),
  zIndex: -10,
});

const topographicLayer = new TileLayer({
  source: new XYZ({
    url: TOPOGRAPHIC_LAYER_URL,
    attributions: `${attribution} | ${opentopomap_attribution}`,
  }),
  zIndex: -10,
});

/**
 * Creates a dynamic data layer that pulls STAC item data from GeoServer.
 *
 * @returns {VectorLayer} The generated collection data layer for the map.
 */
const createCollectionDataLayer = (map: Map | null): VectorLayer => {
  const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: `${geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Default:datalayer&outputFormat=application/json`,
  });

  const newLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({ color: currentDataLayerFillColor }),
      stroke: new Stroke({
        color: currentDataLayerStrokeColor,
        width: currentDataLayerStrokeWidth,
      }),
    }),
  });

  newLayer.set('id', 'dataLayer');

  if (map) {
    vectorSource.once('featuresloadend', () => {
      const extent = vectorSource.getExtent();
      if (extent) {
        const view = map.getView();
        const resolution = view.getResolutionForExtent(extent, map.getSize());
        const zoom = view.getZoomForResolution(resolution);
        view.animate({
          center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2],
          zoom: zoom ? zoom - 2 : 1,
          duration: 1000,
        });
      }
    });
  }

  return newLayer;
};

/**
 * Creates a dynamic data layer that pulls STAC item data from GeoServer.
 *
 * @returns {VectorLayer} The generated item data layer for the map.
 */
export const createItemDataLayer = (timestamp: string): VectorLayer => {
  const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: `${geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Default:items&cql_filter=datetime='${timestamp}'&outputFormat=application/json`,
  });

  const newLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({ color: currentItemLayerFillColor }),
      stroke: new Stroke({
        color: currentItemLayerStrokeColor,
        width: currentItemLayerStrokeWidth,
      }),
    }),
  });

  newLayer.set('id', 'itemLayer');
  return newLayer;
};

/**
 * Refreshes the data layers on the map by removing the old layers and adding a new one, also depending on
 * both the collection layer and items layer
 *
 * @param {Map} map - The OpenLayers map instance.
 * @param collection
 * @param timestamp
 */
export const refreshLayer = (
  map: Map,
  collection: boolean,
  timestamp?: string,
) => {
  const layers = map.getLayers().getArray();
  const dataLayer = layers.find((layer) => layer.get('id') === 'dataLayer');
  const itemLayer = layers.find((layer) => layer.get('id') === 'itemLayer');

  if (collection) {
    if (dataLayer) {
      map.removeLayer(dataLayer);
    }
    const newLayer = createCollectionDataLayer(map);
    map.addLayer(newLayer);
  }

  if (timestamp) {
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
  const { layer, mapRef, isOnline } =
    useMapLayerContext();

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
        controls: defaultControls({ attribution: false }).extend([
          new FullScreen(),
          new Attribution({ collapsible: false }),
        ]),
        layers: [getLayer(), createCollectionDataLayer(mapRef.current)],
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
 * @param collection
 * @param timestamp
 */
export const changeLayer = (
  map: Map,
  collection: boolean,
  timestamp?: string,
) => {
  if (collection) {
    refreshLayer(map, true);
  }
  if (timestamp) {
    refreshLayer(map, false, timestamp);
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
export const toggleAssetLayer = (
  map: Map,
  layerName: string,
  layerUrl: string,
  add: boolean,
  min: number,
  max: number,
): void => {
  // First check if layer already exists
  const layers = map.getLayers().getArray();
  const existingLayer = layers.find((layer) => layer.get('name') === layerName);

  const result = /layers=(.*)/.exec(layerUrl);
  let geoServerLayerName = '';
  if (result) {
    geoServerLayerName = result[1];
  }

  if (add && !existingLayer) {
    // Add the layer
    const newLayer = new ImageLayer({
      source: new ImageWMS({
        url: layerUrl,
        params: {
          SLD_BODY: createItemAssetStyle(geoServerLayerName, min, max),
        },
        // Add crossOrigin to handle potential CORS issues
        crossOrigin: 'anonymous',
      }),
      zIndex: 20,
      opacity: 1.0,
      visible: true,
    });

    // Set a name to identify this asset layer later
    newLayer.set('name', layerName);
    newLayer.set('type', 'asset');

    map.addLayer(newLayer);

    // Force render update
    map.renderSync();

    // Log successful addition
  } else if (!add && existingLayer) {
    // Remove the layer
    map.removeLayer(existingLayer);
    map.renderSync();
  }
};

/**
 * Updates the style of a layer on the map
 * @param map
 * @param layerName
 * @param fill
 * @param fillOpacity
 * @param stroke
 * @param strokeWidth
 */
export const updateLayerStyle = (
  map: Map,
  layerName: string,
  fill: string, // RGB
  fillOpacity: string, // value
  stroke: string, // RGB
  strokeWidth: string, // value
): void => {
  const layers = map.getLayers().getArray();
  const layer = layers.find(
    (layer) => layer.get('id') === layerName || layer.get('name') === layerName,
  ) as VectorLayer<VectorSource<any>>;

  if (!layer) {
    return;
  }

  // Create rgba values from the RGB and opacity inputs
  const fillRgba = fill.replace('rgb', 'rgba').replace(')', `,${fillOpacity})`);
  const strokeRgba = stroke.replace('rgb', 'rgba').replace(')', ',0.5)');
  const widthValue = parseInt(strokeWidth);

  // Store current style values based on which layer is being updated
  if (layerName === 'itemLayer') {
    currentItemLayerFillColor = fillRgba;
    currentItemLayerStrokeColor = strokeRgba;
    currentItemLayerStrokeWidth = widthValue;
  } else if (layerName === 'dataLayer') {
    currentDataLayerFillColor = fillRgba;
    currentDataLayerStrokeColor = strokeRgba;
    currentDataLayerStrokeWidth = widthValue;
  }

  layer.setStyle(
    new Style({
      fill: new Fill({
        color: fillRgba,
      }),
      stroke: new Stroke({
        color: strokeRgba,
        width: widthValue,
      }),
    }),
  );

  // Force render update
  map.renderSync();
};

/**
 * Removes all asset layers from the map
 *
 * @param {Map} map - The OpenLayers map instance
 */
export const removeAllAssetLayers = (map: Map): void => {
  const layers = map.getLayers().getArray();
  const assetLayers = layers.filter((layer) => layer.get('type') === 'asset');

  assetLayers.forEach((layer) => {
    map.removeLayer(layer);
  });
};

export default MapView;
