'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { insertMockItemData } from '../services/api';
import debounce from 'lodash/debounce';
import { verifyInternetConnection } from '../services/api';

const attributions = '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Base layers
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

// Dynamic Data Layer (STAC Item)
const createDataLayer = () => {
  const geoserverUrl = process.env.REACT_APP_GEOSERVER_URL;
  const newLayer = new TileLayer({
    source: new TileWMS({
      url: geoserverUrl,
      params: {
        'LAYERS': 'Default:datalayer',
        'TILED': true,
        'CACHED': false,
        '_t': Date.now(),  // Ensures cache busting
      },
      serverType: 'geoserver',
    }),
  });
  newLayer.set('id', 'dataLayer');
  return newLayer;
};

export const refreshLayer = (map: Map) => {
  const layers = map.getLayers().getArray();
  const dataLayer = layers.find(layer => layer.get('id') === 'dataLayer');

  if (dataLayer) {
    // Remove old data layer
    map.removeLayer(dataLayer);
  }

  // Create new layer and add it to map
  const newLayer = createDataLayer();
  map.addLayer(newLayer);
};

interface MapViewProps {
  onBboxChange: (bbox: number[]) => void;
}

// Map component
const MapView = ({ onBboxChange }: MapViewProps) => {
  useGeographic();
  const mapElement = useRef(null);
  const { layer, mapRef, setIsOnline = () => {} } = useMapLayerContext();

  const getLayer = (): TileLayer => {
    const layerMap: Record<string, TileLayer> = {
      satellite: satelliteLayer,
      topographical: topographicLayer,
      default: defaultLayer,
    };

    // Ensure `layer` is always a valid string before accessing the object
    const selectedLayer = layerMap[layer ?? "default"];
    if (!selectedLayer.get('id')) {
      selectedLayer.set('id', 'baseLayer');
    }

    return selectedLayer;
  };
  
  const setOnlineStatus = async () => {
    try {
        const response = await verifyInternetConnection("https://hirondelle.crim.ca/stac/collections");
        setIsOnline(response === "Internet connection established")
    } 
    catch (error) {
      setIsOnline(false);
      console.log('No connection to the URL:', error);
    }
  };

  useEffect(() => {
    insertMockItemData() //This method is to be deleted once we receive the real data
    setOnlineStatus();

    const deebouncedBboxChange = debounce((extent: number[]) => {
      onBboxChange(extent);
    }, 300);
    
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen()]),
        layers: [getLayer(), createDataLayer()],
        view: new View({
          center: [-75.6972, 45.4215], // Ottawa
          zoom: 1,
        }),
      });

      // Log the initial extent
      const initialExtent = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
      console.log(`Initial Map extent: ${initialExtent}`);
    } else {
      const map = mapRef.current;
      const layers = map.getLayers().getArray();
      const baseLayer = layers.find(layer => layer.get('id') === 'baseLayer');
      if (baseLayer) {
        map.removeLayer(baseLayer);
      }
      map.addLayer(getLayer());
      refreshLayer(map);  // Ensure dataLayer is reloaded correctly
    }

    if (mapRef.current) {
      const map = mapRef.current;
      const view = map.getView();
  
      // Log extent when zooming in/out
      view.on('change:resolution', () => {
        const mapExtent = view.calculateExtent(map.getSize());
        deebouncedBboxChange(mapExtent);
        console.log(`Updated Map extent (Zoom): ${mapExtent}`);
      });
  
      // Log extent when panning
      view.on('change:center', () => {
        const mapExtent = view.calculateExtent(map.getSize());
        deebouncedBboxChange(mapExtent);
        console.log(`Updated Map extent (Pan): ${mapExtent}`);
      });
    }

    return () => {
      deebouncedBboxChange.cancel();
    };
  }, [layer, onBboxChange]);

  return (
    <div id="map-container" ref={mapElement}>
      <Footer />
    </div>
  );
};

export const changeLayer = (map: Map) => {
  refreshLayer(map)
}

export default MapView;
