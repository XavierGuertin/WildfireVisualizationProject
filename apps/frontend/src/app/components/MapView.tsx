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

// Attributions
const attributions = '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Offline tile source (forces zoom levels 3 and 5)
const offlineLayer = new TileLayer({
  source: new XYZ({
    tileUrlFunction: function (tileCoord) {
      const z = tileCoord[0];
      return `http://localhost:8081/data/OAM-World-1-8-J80/${z}/${tileCoord[1]}/${tileCoord[2]}.png`;
    },
  }),
});

// Online base layers
const defaultLayer = new TileLayer({
  source: new XYZ({
    url: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
    attributions: attributions,
  }),
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    attributions: attributions,
  }),
});

const topographicLayer = new TileLayer({
  source: new XYZ({
    url: `https://tile.opentopomap.org/{z}/{x}/{y}.png`,
    attributions: attributions,
  }),
});

// Dynamic Data Layer (STAC Item)
const createDataLayer = () => {
  const newLayer = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8090/geoserver/Default/wms',
      params: {
        'LAYERS': 'Default:datalayer',
        'TILED': true,
        'CACHED': false,
        '_t': Date.now(), // Ensures cache busting
      },
      serverType: 'geoserver',
    }),
  });
  newLayer.set('id', 'dataLayer');
  return newLayer;
};

// Function to refresh the data layer dynamically
export const refreshLayer = (map: Map) => {
  const layers = map.getLayers().getArray();
  const dataLayer = layers.find(layer => layer.get('id') === 'dataLayer');

  if (dataLayer) {
    map.removeLayer(dataLayer);
  }

  const newLayer = createDataLayer();
  map.addLayer(newLayer);
};

// Map component
const MapView = () => {
  useGeographic();
  const mapElement = useRef(null);
  const { layer, mapRef } = useMapLayerContext();

  const getLayer = (): TileLayer => {
    const layerMap: Record<string, TileLayer> = {
      satellite: satelliteLayer,
      topographical: topographicLayer,
      default: defaultLayer,
    };

    const selectedLayer = layerMap[layer ?? "default"];
    if (!selectedLayer.get('id')) {
      selectedLayer.set('id', 'baseLayer');
    }

    let consecutiveErrors = 0;
    const errorThreshold = 5;
    let isOffline = false;

    const source = selectedLayer.getSource();
    if (source) {
      source.on('tileloaderror', () => {
        consecutiveErrors += 1;
        console.warn(`Tile load error (${consecutiveErrors}/${errorThreshold})`);

        if (consecutiveErrors >= errorThreshold && !isOffline) {
          console.error(`Multiple tile errors detected. Switching to offline layer.`);
          mapRef.current?.getLayers().setAt(0, offlineLayer);
          isOffline = true;
        }
      });
    }

    return selectedLayer;
  };


  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen()]),
        layers: [getLayer(), createDataLayer()],
        view: new View({
          center: [-75.6972, 45.4215], // Ottawa
          zoom: 3,
        }),
      });
    } else {
      const map = mapRef.current;
      const layers = map.getLayers().getArray();
      const baseLayer = layers.find(layer => layer.get('id') === 'baseLayer');

      if (baseLayer) {
        map.removeLayer(baseLayer);
      }
      map.addLayer(getLayer());
      refreshLayer(map); // Ensure dataLayer is reloaded correctly
    }
  }, [layer]);

  return (
    <div id="map-container" ref={mapElement}>
      <Footer />
    </div>
  );
};

export const changeLayer = (map: Map) => {
  refreshLayer(map);
};

export default MapView;
