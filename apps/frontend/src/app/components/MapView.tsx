'use client';

import React, { useContext, useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
// import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
// import Toolbar from './Toolbar';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import styled from 'styled-components';

import {FullScreen, Control, defaults as defaultControls} from 'ol/control.js';
import "../styles/map.css"
import {useGeographic} from 'ol/proj.js';
// import Navbar from './Navbar';
import { useLayerContext } from './MapContext';
import { LineString, Point } from 'ol/geom';
import { Feature } from 'ol';
import Polygon from 'ol/geom/Polygon.js';
import ImageTile from 'ol/source/ImageTile.js';
import XYZ from 'ol/source/XYZ';

//Maptiler API key and attributions
const apiKey = "kbDhTzqy5lUtiESSNyqp";
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

const MapView = () => {
  useGeographic();
  const mapElement = useRef(null);
  const mapRef = useRef<Map | null>(null);
  const layer = useLayerContext();

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current as unknown as HTMLElement,
        controls: defaultControls().extend([new FullScreen(), DefaultControl, SatelliteControl, TopographicControl]),
        layers: [defaultLayer],
        view: new View({
          center: [-75.6972, 45.4215], // Centered at Ottawa for example
          zoom: 5
        })
      });
    }

    // console.log(layer.name);
    // if (!mapRef.current) {
    //   mapRef.current = new Map({
    //     target: mapElement.current as unknown as HTMLElement,
    //     controls: defaultControls().extend([new FullScreen()]),
    //     layers: [
    //       new TileLayer({
    //         source: new OSM()
    //       })
    //     ],
    //     view: new View({
    //       center: [-75.6972, 45.4215], // Centered at Ottawa for example
    //       zoom: 5
    //     })
    //   });
    // }


    // //create polygon
    // const coordinates = [[-128, 60.5], [-129, 61], [-130, 60], [-129, 59.5]];
    // const polygonFeature = new Feature({
    //   geometry: new Polygon([coordinates])
    // });

    // // Adding the wildfire layer (initially empty)
    // const wildfireLayer = new VectorLayer({
    //   source: new VectorSource({
    //     // url: '', // Initially empty, can be updated later when data becomes available
    //     // format: new GeoJSON()
    //     features: [polygonFeature]
    //   }),
    //   style: new Style({
    //     stroke: new Stroke({
    //       color: 'red',
    //       width: 2
    //     }),
    //     fill: new Fill({
    //       color: 'rgba(255, 0, 0, 0.1)'
    //     })
    //   })
    // });
    // if (mapRef.current) {
    //   mapRef.current.addLayer(wildfireLayer);
    // }
  }, []);

  //Custom controls
  //Default custom control
  var button = document.createElement('button');
  button.innerHTML = 'D';
  
  var handleDefaultLayer = function() {
    mapRef.current?.getLayers().clear();
    mapRef.current?.addLayer(defaultLayer);
  };
  
  button.addEventListener('click', handleDefaultLayer, false);
  
  var element = document.createElement('div');
  element.className = 'defaultLayer ol-unselectable ol-control';
  element.appendChild(button);
  
  var DefaultControl = new Control({
      element: element
  });

  //Satellite custom control
  var button = document.createElement('button');
  button.innerHTML = 'S';
  
  var handleSatelliteLayer = function() {
    mapRef.current?.getLayers().clear();
    mapRef.current?.addLayer(satelliteLayer);
  };
  
  button.addEventListener('click', handleSatelliteLayer, false);
  
  var element = document.createElement('div');
  element.className = 'satelliteLayer ol-unselectable ol-control';
  element.appendChild(button);
  
  var SatelliteControl = new Control({
      element: element
  });

  //Topographic  custom control
  var button = document.createElement('button');
  button.innerHTML = 'T';
  
  var handleTopographicLayer = function() {
    mapRef.current?.getLayers().clear();
    mapRef.current?.addLayer(topographicLayer);
  };
  
  button.addEventListener('click', handleTopographicLayer, false);
  
  var element = document.createElement('div');
  element.className = 'topographicLayer ol-unselectable ol-control';
  element.appendChild(button);
  
  var TopographicControl = new Control({
      element: element
  });

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

  const reload = () =>{
    if(layer.name === "satellite"){
      mapRef.current?.getLayers().clear();
      mapRef.current?.addLayer(satelliteLayer);
    }

    else{
      mapRef.current?.getLayers().clear();
      mapRef.current?.addLayer(defaultLayer);
    }
  };

  return (
    <>
      <div id="map-container" ref={mapElement} style={{ height: '100vh', width: '100%' }}></div>
      <button onClick={reload}>CLICK</button>
    </>
  );
};


export default MapView;
