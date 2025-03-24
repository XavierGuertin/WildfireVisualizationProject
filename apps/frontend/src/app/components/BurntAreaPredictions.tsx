import React, { useRef, useState } from 'react';
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

  // Define the valid ranges for each field
  const ranges = {
    temperature: { min: 2.2, max: 33.3, unit: '°C' },
    relative_humidity: { min: 15.0, max: 100, unit: '%' },
    wind: { min: 0.4, max: 9.4, unit: 'km/h' },
    rain: { min: 0.0, max: 6.4, unit: 'mm/m²' },
  };

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

  // Form submission handler
  const handleFormSubmit = (event: React.FormEvent) => {
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
      console.log("Form submitted!");
      // Proceed with form submission logic here
    }
  };

  // Clear form handler
  const handleClearForm = () => {
    const form = formRef.current?.querySelector('form');
    if (form) {
      form.reset();
    }
    setErrors({});
    console.log("Form cleared!");
  };

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap((prev) => !prev);
  };

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
              <div className="form-group">
                <label>{t('spatial_coordinates')}</label>
                <div className="coordinate-inputs">
                  <input type="number" placeholder="X:" required />
                  <input type="number" placeholder="Y:" required />
                </div>
                <button
                  type="button"
                  className="view-map-button"
                  onClick={toggleMap}
                >
                  {t('view_spatial_coordinates_map')}
                </button>
              </div>
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-buttons">
                <button type="submit">{t('load_simulation')}</button>
                <button type="button" onClick={handleClearForm}>
                  {t('clear_simulation')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="map-modal">
          <div className="map-modal-content">
            <button className="close-modal-button" onClick={toggleMap}>
              &times;
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
