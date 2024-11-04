'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

const MapView = () => {
  const mapElement = useRef(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([-75.6972, 45.4215]), // Centered at Ottawa for example
          zoom: 5
        })
      });
    }

    // Adding the wildfire layer (initially empty)
    const wildfireLayer = new VectorLayer({
      source: new VectorSource({
        url: '', // Initially empty, can be updated later when data becomes available
        format: new GeoJSON()
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
  }, []);

  const zoomIn = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      const zoom = view?.getZoom();
      if (zoom !== undefined) {
        view.setZoom(zoom + 1);
      }
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      const zoom = view?.getZoom();
      if (zoom !== undefined) {
        view.setZoom(zoom - 1);
      }
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      if (view) {
        view.setCenter(fromLonLat([-75.6972, 45.4215]));
        view.setZoom(5);
      }
    }
  };

  const pan = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      if (view) {
        const panAmount = 100000; // Adjust this value as needed
        const currentCenter = view.getCenter();
        if (currentCenter) {
          switch (direction) {
            case 'up':
              currentCenter[1] += panAmount;
              break;
            case 'down':
              currentCenter[1] -= panAmount;
              break;
            case 'left':
              currentCenter[0] -= panAmount;
              break;
            case 'right':
              currentCenter[0] += panAmount;
              break;
          }
          view.setCenter(currentCenter);
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const element = document.getElementById('map-container');
      if (element) {
        element.requestFullscreen();
      }
    }
  };

  const updateWildfireLayer = () => {
    // logic to update wildfire layers
  };

  return (
    <>
      <div id="map-container" ref={mapElement} style={{ height: '100vh', width: '100%' }}></div>
    </>
  );
};

export default MapView;
