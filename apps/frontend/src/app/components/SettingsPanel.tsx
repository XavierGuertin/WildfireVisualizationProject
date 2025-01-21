import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import '../styles/SettingsPanel.css'; // Import the CSS file
import { IoSettingsOutline, IoLanguage, IoCheckmark, IoTrashOutline } from "react-icons/io5";
import { PiArrowClockwiseFill } from "react-icons/pi";

const SettingsPanel: React.FC = () => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation
  const [dropdownState, setDropdownState] = useState<{
    activeButton: string | null;
    isOpen: boolean;
  }>({ activeButton: null, isOpen: false });

  const [newApiEndpoint, setNewApiEndpoint] = useState<string>("https://default-api-endpoint.com");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize language from local storage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Toggles dropdown state
  const toggleDropdown = (buttonName: string) => {
    setDropdownState((prevState) => ({
      activeButton: prevState.activeButton === buttonName ? null : buttonName,
      isOpen: prevState.activeButton !== buttonName,
    }));
  };

  // Handles settings selection
  const handleSaveEndpoint = () => {
    if (isValidUrl(newApiEndpoint)) {
      alert(`${t('api_endpoint')} ${t('save')}: ${newApiEndpoint}`);
      setDropdownState({ activeButton: null, isOpen: false });
    } else {
      alert(t('invalid_url'));
    }
  };

  // Cancel button clicked
  const handleCancelEndpoint = () => {
    setDropdownState({ activeButton: null, isOpen: false });
  };

  // Handles language selection
  const handleLanguageSelect = (language: string) => {
    i18n.changeLanguage(language); // Change the application language
    localStorage.setItem('language', language); // Save to local storage
    setDropdownState({ activeButton: null, isOpen: false });
  };

  // Handles reset actions
  const handleReset = () => {
    alert(t('reset_initiated'));
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleFactoryReset = () => {
    alert(t('factory_reset_initiated'));
    setDropdownState({ activeButton: null, isOpen: false });
  };

  // Check if valid URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownState({ activeButton: null, isOpen: false });
      }
    };

    if (dropdownState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownState.isOpen]);

  return (
    <div className="button-container" ref={dropdownRef}>
      {/* Settings button */}
      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'settings' ? 'active' : ''}`}
          onClick={() => toggleDropdown('settings')}
          aria-expanded={dropdownState.activeButton === 'settings'}
        >
          <IoSettingsOutline size={32} />
        </button>
        {dropdownState.activeButton === 'settings' && (
          <div className="dropdown-content show">
            <div className="settings-prompt">
              <label htmlFor="api-endpoint-input">{t('api_endpoint')}:</label>
              <div className="settings-prompt-row">
                <input
                  id="api-endpoint-input"
                  type="text"
                  placeholder={t('enter_new_api_endpoint')}
                  value={newApiEndpoint}
                  onChange={(e) => setNewApiEndpoint(e.target.value)}
                />
                <div className="settings-prompt-buttons">
                  <button onClick={handleSaveEndpoint}>{t('save')}</button>
                  <button onClick={handleCancelEndpoint}>{t('cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Language Dropdown */}
      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'language' ? 'active' : ''}`}
          onClick={() => toggleDropdown('language')}
          aria-expanded={dropdownState.activeButton === 'language'}
        >
          <IoLanguage size={32} />
        </button>
        {dropdownState.activeButton === 'language' && (
          <div className="dropdown-content show">
            <button onClick={() => handleLanguageSelect('en')}>
              {i18n.language === 'en' ? <IoCheckmark size={24} fill="black" /> : <PiArrowClockwiseFill size={24} fill="none" />}
              {t('english')}
            </button>
            <button onClick={() => handleLanguageSelect('fr')}>
              {i18n.language === 'fr' ? <IoCheckmark size={24} fill="black" /> : <PiArrowClockwiseFill size={24} fill="none" />}
              {t('french')}
            </button>
          </div>
        )}
      </div>

      {/* Reset Dropdown */}
      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'reset' ? 'active' : ''}`}
          onClick={() => toggleDropdown('reset')}
          aria-expanded={dropdownState.activeButton === 'reset'}
        >
          <PiArrowClockwiseFill size={32} />
        </button>
        {dropdownState.activeButton === 'reset' && (
          <div className="dropdown-content show">
            <button onClick={handleReset}>
              <PiArrowClockwiseFill size={24} />
              {t('reset')}
            </button>
            <button onClick={handleFactoryReset} style={{ color: '#dc143c' }}>
              <IoTrashOutline size={24} fill="red" />
              {t('factory_reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
