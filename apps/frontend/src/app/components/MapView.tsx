'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import "../styles/map.css";
import { Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import { FullScreen, defaults as defaultControls} from 'ol/control.js';
import {useGeographic} from 'ol/proj.js';
import { useMapLayerContext } from './MapContext';
import XYZ from 'ol/source/XYZ';
import Footer from './Footer';
import {TileWMS} from 'ol/source';

//Attributions
interface GeoJSONFeature {
  geometry: {
    coordinates: number[][][];
  };
}

interface GeoJSONResponse {
  items: GeoJSONFeature[];
}

//Maptiler API key and attributions
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const attributions = '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

//layer definitions
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
})

const dataLayer = new TileLayer({
  source: new TileWMS({
    url:'http://localhost:8090/geoserver/Default/wms',
    params: {
      'LAYERS': 'Default:datalayer',
      'TILED': true,
    },
    serverType: 'geoserver',
  }),
});

export const changeLayer = () => {
  dataLayer.getSource()?.updateParams({'TIMESTAMP' : Date.now()});
}

//Map component
const MapView = () => {
  useGeographic();
  const mapElement = useRef(null);

  //Context imports
  const {layer, mapRef} = useMapLayerContext();

  const getLayer = () => {
    if(layer === "satellite"){
      return satelliteLayer;
    }

    if(layer === "topographical"){
      return topographicLayer;
    }

    return defaultLayer;
  }

  useEffect(() => {
    // Initialize map on first render
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen()]),
        layers: [getLayer()],
        view: new View({
          center: [-75.6972, 45.4215], // Centered at Ottawa
          zoom: 1,
        })
      });
    }
    else {
      mapRef.current?.getLayers().clear();
      mapRef.current?.addLayer(getLayer());
    }
    mapRef.current?.addLayer(dataLayer);
    console.log(`Backend URL: ${backendUrl}`);
  }, [layer]);

  return (
    <div id="map-container" ref={mapElement}>
      <Footer />
    </div>
  );
};

export default MapView;
