import React, { useRef } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import '../styles/BurntAreaPrediction.css';
import { useTranslation } from 'react-i18next';

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

  // Form submission handler
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted!");
  };

  // Clear form handler
  const handleClearForm = () => {
    const form = formRef.current?.querySelector('form');
    if (form) {
      form.reset();
    }
    console.log("Form cleared!");
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
          <IoSettingsOutline className="icon" />
        </button>

        {/* Dropdown Content */}
        {dropdownState.activeButton === 'burnt-area' && (
          <div className="form-dropdown-content show">
            {/* Form inside dropdown */}
            <form onSubmit={handleFormSubmit}>
              <h3>{t('burnt_area_prediction')}</h3>
              <div className="form-group">
                <label>{t('spatial_coordinates')}</label>
                <div className="coordinate-inputs">
                  <input type="number" placeholder="X:" required />
                  <input type="number" placeholder="Y:" required />
                </div>
              </div>
              <div className="form-group">
                <label>{t('temperature')}</label>
                <input
                  type="number"
                  placeholder={t('temperature')}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('relative_humidity')}</label>
                <input
                  type="number"
                  placeholder={t('relative_humidity')}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('wind')}</label>
                <input type="number" placeholder={t('wind')} required />
              </div>
              <div className="form-group">
                <label>{t('rain')}</label>
                <input type="number" placeholder={t('rain')} required />
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
    </div>
  );
};

export default BurntAreaPrediction;
