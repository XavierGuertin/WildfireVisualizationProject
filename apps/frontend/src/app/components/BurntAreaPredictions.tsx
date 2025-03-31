import React, { useRef, useState, useEffect } from 'react';
import '../styles/BurntAreaPrediction.css';
import { useTranslation } from 'react-i18next';
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
  const [selectedMonth, setSelectedMonth] = useState<string>('jan');
  const [selectedDay, setSelectedDay] = useState<string>('sun');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Define the valid ranges for each field
  const ranges = {
    temperature: { min: 2.2, max: 33.3, unit: '°C' },
    relative_humidity: { min: 15.0, max: 100, unit: '%' },
    wind: { min: 0.4, max: 9.4, unit: 'km/h' },
    rain: { min: 0.0, max: 6.4, unit: 'mm/m²' },
  };

  // Define the options for months and days
  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  // Validation function for input fields
  const validateInput = (name: string, value: string) => {
    const numValue = parseFloat(value);
    const range = ranges[name as keyof typeof ranges];

    if (isNaN(numValue)) {
      return t('invalid_number');
    }

    if (numValue < range.min || numValue > range.max) {
      return `${t('value_out_of_range')} ${range.min} - ${range.max}`;
    }

    return '';
  };

  // Handle input change and validate
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateInput(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // API call to predict burnt area
  const predictBurntArea = async (data: any) => {
    try {
      setIsLoading(true);
      setApiError(null);

      const response = await fetch('http://127.0.0.1:8000/predict_area', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

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

  // Form submission handler
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check for any errors before submitting
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const newErrors: { [key: string]: string } = {};

    for (const [name, value] of formData.entries()) {
      if (['temperature', 'relative_humidity', 'wind', 'rain'].includes(name)) {
        const error = validateInput(name as string, value as string);
        if (error) {
          newErrors[name as string] = error;
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Prepare data for API call
      const apiData = {
        X: parseInt(formData.get('x') as string),
        Y: parseInt(formData.get('y') as string),
        month: formData.get('month'),
        day: formData.get('day'),
        temp: parseFloat(formData.get('temperature') as string),
        RH: parseFloat(formData.get('relative_humidity') as string),
        wind: parseFloat(formData.get('wind') as string),
        rain: parseFloat(formData.get('rain') as string),
      };

      // Call API
      const result = await predictBurntArea(apiData);
      if (result !== null) {
        setPrediction(result);
      }
    }
  };

  // Clear form handler
  const handleClearForm = () => {
    const form = formRef.current?.querySelector('form');
    if (form) {
      form.reset();
    }
    setErrors({});
    setSelectedMonth('jan');
    setSelectedDay('sun');
    setPrediction(null);
    setApiError(null);
    console.log("Form cleared!");
  };

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap((prev) => !prev);
  };

  // Add Escape key support for closing the modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMap(false);
      }
    };

    if (showMap) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showMap]);

  return (
    <div className="form-button-container" ref={formRef}>
      {/* Button for Burnt Area Predictions */}
      <div className="form-dropdown-button">
        <button
          className={`form-button ${dropdownState.activeButton === 'burnt-area' ? 'active' : ''}`}
          onClick={() => toggleDropdown('burnt-area')}
          aria-expanded={dropdownState.activeButton === 'burnt-area'}
          aria-label="burnt-area-predictions"
        >
          {t('burnt_area_prediction')}
        </button>

        {/* Dropdown Content */}
        {dropdownState.activeButton === 'burnt-area' && (
          <div className="form-dropdown-content show">
            {/* Form inside dropdown */}
            <form onSubmit={handleFormSubmit}>
              <h3>{t('burnt_area_prediction')}</h3>
              <p className="location-info">{t('montesinho_park_portugal')}</p>

              {/* Row 1: Spatial Coordinates (X, Y) */}
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('spatial_coordinates')} X</label>
                  <input type="number" name="x" placeholder="X:" required />
                </div>
                <div className="form-item">
                  <label>{t('spatial_coordinates')} Y</label>
                  <input type="number" name="y" placeholder="Y:" required />
                </div>
              </div>
              <button
                type="button"
                className="view-map-button"
                onClick={toggleMap}
              >
                {t('view_spatial_coordinates_map')}
              </button>

              {/* Row 2: Month and Day */}
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('month')}</label>
                  <select
                    name="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    required
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-item">
                  <label>{t('day')}</label>
                  <select
                    name="day"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    required
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Temperature and Relative Humidity */}
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('temperature')}</label>
                  <input
                    type="number"
                    name="temperature"
                    placeholder={`${t('temperature')} (${ranges.temperature.unit})`}
                    step="0.1"
                    onChange={handleInputChange}
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
                    placeholder={`${t('relative_humidity')} (${ranges.relative_humidity.unit})`}
                    step="0.1"
                    onChange={handleInputChange}
                    required
                  />
                  <span className="range-info">
                    {t('range')}: {ranges.relative_humidity.min} - {ranges.relative_humidity.max} {ranges.relative_humidity.unit}
                  </span>
                  {errors.relative_humidity && <span className="error">{errors.relative_humidity}</span>}
                </div>
              </div>

              {/* Row 4: Wind and Rain */}
              <div className="form-group form-row">
                <div className="form-item">
                  <label>{t('wind')}</label>
                  <input
                    type="number"
                    name="wind"
                    placeholder={`${t('wind')} (${ranges.wind.unit})`}
                    step="0.1"
                    onChange={handleInputChange}
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
                    placeholder={`${t('rain')} (${ranges.rain.unit})`}
                    step="0.1"
                    onChange={handleInputChange}
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

            {/* Prediction Results */}
            {prediction !== null && (
              <div className="prediction-results">
                <h4>{t('prediction_results')}</h4>
                <p>
                  {t('predicted_burned_area')}: <strong>{prediction.toFixed(6)}</strong> ha
                </p>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="api-error">
                <p>{t('api_error')}: {apiError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="map-modal">
          <div className="map-modal-content">
            <button className="close-modal-button" onClick={toggleMap}>
              ×
            </button>
            <img
              src={spatialCoordinatesMap}
              alt={t('spatial_coordinates_map')}
              className="map-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BurntAreaPrediction;
