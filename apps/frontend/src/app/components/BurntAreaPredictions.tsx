import React, { useRef, useState, useEffect } from 'react';
import '../styles/BurntAreaPrediction.css';
import { useTranslation } from 'react-i18next';
import { Style, Fill, Stroke } from 'ol/style';
import { useMapLayerContext } from '../context/MapContext';
import { Feature } from 'ol';
import { Circle as CircleGeom } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

const spatialCoordinatesMap = '/assets/spatial-coordinates-map.png';

interface BurntAreaPredictionProps {
  dropdownState: {
    activeButton: string | null;
    isOpen: boolean;
  };
  toggleDropdown: (buttonName: string) => void;
}

const BurntAreaPrediction: React.FC<BurntAreaPredictionProps> = ({
                                                                   dropdownState,
                                                                   toggleDropdown,
                                                                 }) => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    x: '',
    y: '',
    month: 'jan',
    day: 'sun',
    temperature: '',
    relative_humidity: '',
    wind: '',
    rain: '',
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const ranges = {
    temperature: { min: 2.2, max: 33.3, unit: '°C' },
    relative_humidity: { min: 15.0, max: 100, unit: '%' },
    wind: { min: 0.4, max: 9.4, unit: 'km/h' },
    rain: { min: 0.0, max: 6.4, unit: 'mm/m²' },
  };

  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const validateInput = (name: string, value: string) => {
    const numValue = parseFloat(value);
    const range = ranges[name as keyof typeof ranges];
    if (isNaN(numValue)) return t('invalid_number');
    if (range && (numValue < range.min || numValue > range.max)) {
      return `${t('value_out_of_range')} ${range.min} - ${range.max}`;
    }
    return '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (['temperature', 'relative_humidity', 'wind', 'rain'].includes(name)) {
      const error = validateInput(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const predictBurntArea = async (data: any) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await fetch('http://127.0.0.1:8000/predict_area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      return result.predicted_burned_area;
    } catch (error) {
      console.error('Error predicting burnt area:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate all numeric fields
    for (const [name, value] of Object.entries(formData)) {
      if (['temperature', 'relative_humidity', 'wind', 'rain'].includes(name)) {
        const error = validateInput(name, value);
        if (error) newErrors[name] = error;
      }
    }
    if (!formData.x) newErrors.x = t('required');
    if (!formData.y) newErrors.y = t('required');

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const apiData = {
        X: parseInt(formData.x),
        Y: parseInt(formData.y),
        month: formData.month,
        day: formData.day,
        temp: parseFloat(formData.temperature),
        RH: parseFloat(formData.relative_humidity),
        wind: parseFloat(formData.wind),
        rain: parseFloat(formData.rain),
      };
      const result = await predictBurntArea(apiData);
      if (result !== null) setPrediction(result);
    }
  };

  const handleClearForm = () => {
    setFormData({
      x: '',
      y: '',
      month: 'jan',
      day: 'sun',
      temperature: '',
      relative_humidity: '',
      wind: '',
      rain: '',
    });
    setErrors({});
    setPrediction(null);
    setApiError(null);
    console.log("Form cleared!");
  };

  const toggleMap = () => setShowMap((prev) => !prev);

  const { mapRef } = useMapLayerContext();

  useEffect(() => {
    if (!mapRef.current) return;

    const removePredictionLayer = () => {
      const existingLayer = mapRef.current
        .getLayers()
        .getArray()
        .find((layer) => layer.get('id') === 'burnPredictionLayer');
      if (existingLayer) {
        mapRef.current.removeLayer(existingLayer);
        mapRef.current.renderSync();
      }
    };

    if (dropdownState.activeButton !== 'burnt-area') {
      removePredictionLayer();
      return;
    }

    if (prediction === null || errors.x || errors.y) return;

    const x = parseInt(formData.x || "5");
    const y = parseInt(formData.y || "5");

    const gridToLonLat = (x: number, y: number): [number, number] => {
      const cellSize = 0.005;
      const centerLon = -6.8;
      const centerLat = 41.88;
      const gridCenter = 5;
      const lon = centerLon + (x - gridCenter) * cellSize;
      const lat = centerLat + (gridCenter - y) * cellSize;
      const boundedLon = Math.max(-7.0, Math.min(-6.6, lon));
      const boundedLat = Math.max(41.7, Math.min(42.0, lat));
      return [boundedLon, boundedLat];
    };

    const [lon, lat] = gridToLonLat(x, y);

    removePredictionLayer();

    const areaM2 = prediction * 10000;
    const radiusM = Math.sqrt(areaM2 / Math.PI) * 10;
    const metersPerDegree = 111319.9;
    const latAdjustment = Math.cos((lat * Math.PI) / 180);
    const radiusDegrees = radiusM / (metersPerDegree * latAdjustment);

    const circleGeom = new CircleGeom([lon, lat], radiusDegrees);
    const feature = new Feature({
      geometry: circleGeom,
      name: 'Predicted Burn Area',
    });
    feature.setStyle(
      new Style({
        fill: new Fill({ color: 'rgba(255, 69, 0, 0.5)' }),
        stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.8)', width: 1 }),
      })
    );

    const vectorSource = new VectorSource({ features: [feature] });
    const vectorLayer = new VectorLayer({ source: vectorSource });
    vectorLayer.set('id', 'burnPredictionLayer');
    mapRef.current.addLayer(vectorLayer);

    mapRef.current.getView().setCenter([-6.8, 41.88]);
    mapRef.current.getView().setZoom(10);
    mapRef.current.getView().animate({
      center: [lon, lat],
      zoom: 15,
      duration: 1000,
    });

    mapRef.current.renderSync();

    return () => {
      removePredictionLayer();
    };
  }, [prediction, errors.x, errors.y, mapRef, dropdownState.activeButton, formData.x, formData.y]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowMap(false);
    };
    if (showMap) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showMap]);

  return (
    <div className="form-button-container" ref={formRef}>
      <div className="form-dropdown-button">
        <button
          className={`form-button ${dropdownState.activeButton === 'burnt-area' ? 'active' : ''}`}
          onClick={() => toggleDropdown('burnt-area')}
          aria-expanded={dropdownState.activeButton === 'burnt-area'}
          aria-label="burnt-area-predictions"
        >
          {t('burnt_area_prediction')}
        </button>
        {dropdownState.activeButton === 'burnt-area' && (
          <div className="form-dropdown-content show">
            <form onSubmit={handleFormSubmit}>
              <h3>{t('burnt_area_prediction')}</h3>
              <p className="location-info">{t('montesinho_park_portugal')}</p>
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('spatial_coordinates')} X</label>
                  <input
                    type="number"
                    name="x"
                    value={formData.x}
                    onChange={handleInputChange}
                    placeholder="X:"
                    required
                  />
                  {errors.x && <span className="error">{errors.x}</span>}
                </div>
                <div className="form-item">
                  <label>{t('spatial_coordinates')} Y</label>
                  <input
                    type="number"
                    name="y"
                    value={formData.y}
                    onChange={handleInputChange}
                    placeholder="Y:"
                    required
                  />
                  {errors.y && <span className="error">{errors.y}</span>}
                </div>
              </div>
              <button type="button" className="view-map-button" onClick={toggleMap}>
                {t('view_spatial_coordinates_map')}
              </button>
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('month')}</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="form-item">
                  <label>{t('day')}</label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    required
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('temperature')}</label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder={`${t('temperature')} (${ranges.temperature.unit})`}
                    step="0.1"
                    required
                  />
                  <span className="range-info">
                    {t('range')}: {ranges.temperature.min} - {ranges.temperature.max} {ranges.temperature.unit}
                  </span>
                  {errors.temperature && <span className="error">{errors.temperature}</span>}
                </div>
                <div className="form-item">
                  <label>{t('relative_humidity')}</label>
                  <input
                    type="number"
                    name="relative_humidity"
                    value={formData.relative_humidity}
                    onChange={handleInputChange}
                    placeholder={`${t('relative_humidity')} (${ranges.relative_humidity.unit})`}
                    step="0.1"
                    required
                  />
                  <span className="range-info">
                    {t('range')}: {ranges.relative_humidity.min} - {ranges.relative_humidity.max} {ranges.relative_humidity.unit}
                  </span>
                  {errors.relative_humidity && <span className="error">{errors.relative_humidity}</span>}
                </div>
              </div>
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('wind')}</label>
                  <input
                    type="number"
                    name="wind"
                    value={formData.wind}
                    onChange={handleInputChange}
                    placeholder={`${t('wind')} (${ranges.wind.unit})`}
                    step="0.1"
                    required
                  />
                  <span className="range-info">
                    {t('range')}: {ranges.wind.min} - {ranges.wind.max} {ranges.wind.unit}
                  </span>
                  {errors.wind && <span className="error">{errors.wind}</span>}
                </div>
                <div className="form-item">
                  <label>{t('rain')}</label>
                  <input
                    type="number"
                    name="rain"
                    value={formData.rain}
                    onChange={handleInputChange}
                    placeholder={`${t('rain')} (${ranges.rain.unit})`}
                    step="0.1"
                    required
                  />
                  <span className="range-info">
                    {t('range')}: {ranges.rain.min} - {ranges.rain.max} {ranges.rain.unit}
                  </span>
                  {errors.rain && <span className="error">{errors.rain}</span>}
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? t('loading') : t('load_simulation')}
                </button>
                <button type="button" onClick={handleClearForm} disabled={isLoading}>
                  {t('clear_simulation')}
                </button>
              </div>
            </form>
            {prediction !== null && (
              <div className="prediction-results">
                <h4>{t('prediction_results')}</h4>
                <p>
                  {t('predicted_burned_area')}: <strong>{prediction.toFixed(6)}</strong> ha
                </p>
              </div>
            )}
            {apiError && (
              <div className="api-error">
                <p>{t('api_error')}: {apiError}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {showMap && (
        <div className="map-modal">
          <div className="map-modal-content">
            <button className="close-modal-button" onClick={toggleMap}>×</button>
            <img src={spatialCoordinatesMap} alt={t('spatial_coordinates_map')} className="map-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BurntAreaPrediction;
