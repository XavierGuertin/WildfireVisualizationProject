'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import "../styles/map.css"
import { Map, View, Feature} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { FullScreen, defaults as defaultControls} from 'ol/control.js';
import {useGeographic} from 'ol/proj.js';
import { useMapLayerContext } from './MapContext';
import Polygon from 'ol/geom/Polygon.js';
import XYZ from 'ol/source/XYZ';

//Maptiler API key and attributions
const apiKey = process.env.MAPTILER_API_KEY;
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

//layer definitions
const defaultLayer = new TileLayer({
  source: new XYZ({
    url: `https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=${apiKey}`,
    attributions: attributions
  })
});

const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${apiKey}`,
    attributions: attributions
  })
});

const topographicLayer = new TileLayer({
  source: new XYZ({
    url: `https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=${apiKey}`,
    attributions: attributions
  })
})

//Map component
const MapView = () => {
  useGeographic();
  const mapElement = useRef(null);
  const mapRef = useRef<Map | null>(null);
  const {layer} = useMapLayerContext();
  
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

    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen()]),
        layers: [getLayer()],
        view: new View({
          center: [-75.6972, 45.4215], // Centered at Ottawa for example
          zoom: 5
        })
      });
    }

    else{
      mapRef.current?.getLayers().clear();
      mapRef.current?.addLayer(getLayer());
    }

    //create polygon
    const coordinates = [[-128, 60.5], [-129, 61], [-130, 60], [-129, 59.5]];
    const polygonFeature = new Feature({
      geometry: new Polygon([coordinates])
    });

    // Adding the wildfire layer (initially empty)
    const wildfireLayer = new VectorLayer({
      source: new VectorSource({
        // url: '', // Initially empty, can be updated later when data becomes available
        // format: new GeoJSON()
        features: [polygonFeature]
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)'
        })
      })
    });
    if (mapRef.current) {
      mapRef.current.addLayer(wildfireLayer);
    }
  }, [layer]);

  //functions
  const resetView = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      if (view) {
        view.setCenter([-75.6972, 45.4215]);
        view.setZoom(5);
      }
    }
  };

  return (
      <div id="map-container" ref={mapElement} style={{ height: '100vh', width: '100%' }}></div>
  );
};


export default MapView;
