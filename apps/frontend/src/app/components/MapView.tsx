import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import Footer from './Footer';
import { useMapLayerContext } from './MapContext';

const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

const MapView = () => {
  const { layer } = useMapLayerContext();
  const [polygons, setPolygons] = useState([]);

  const getLayer = () => {
    if (layer === 'satellite') {
      return (
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, etc.'
          url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        />
      );
    }

    if (layer === 'topographical') {
      return (
        <TileLayer
          attribution='Map data &copy; OpenStreetMap contributors, CC-BY-SA, Tiles courtesy of Andy Allan'
          url='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        />
      );
    }

    return (
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
    );
  };

  useEffect(() => {
    // Fetch data from backend and set polygons
    fetch(`${backendUrl}/api/data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const features = data.items
          .map((item) => {
            const { type, coordinates } = item.geometry;
            if (type === 'Polygon') {
              const latLngs = coordinates.map((ring) =>
                ring.map((coord) => [coord[1], coord[0]])
              );
              return latLngs;
            } else if (type === 'MultiPolygon') {
              const latLngs = coordinates.map((polygon) =>
                polygon.map((ring) => ring.map((coord) => [coord[1], coord[0]]))
              );
              return latLngs;
            } else {
              return null;
            }
          })
          .filter((feature) => feature !== null);
        setPolygons(features);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

    console.log(`Backend URL: ${backendUrl}`);
  }, []);

  return (
    <div id="map-container" style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[45.4215, -75.6972]} // Centered at Ottawa
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {getLayer()}
        {polygons.map((latLngs, idx) => (
          <Polygon
            key={idx}
            positions={latLngs}
            pathOptions={{
              color: 'red',
              weight: 2,
              fillColor: 'rgba(255, 0, 0, 0.1)',
            }}
          />
        ))}
      </MapContainer>
      <Footer />
    </div>
  );
};

export default MapView;

