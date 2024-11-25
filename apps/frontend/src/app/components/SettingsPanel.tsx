import React, { useState, useEffect, useRef } from 'react';
import '../styles/SettingsPanel.css'; // Import the CSS file
import { IoSettingsOutline, IoLanguage, IoCheckmark, IoTrashOutline } from "react-icons/io5";
import { PiArrowClockwiseFill } from "react-icons/pi";

const SettingsPanel: React.FC = () => {
  const [dropdownState, setDropdownState] = useState<{
    activeButton: string | null;
    isOpen: boolean;
  }>({ activeButton: null, isOpen: false });

  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newApiEndpoint, setNewApiEndpoint] = useState<string>("https://default-api-endpoint.com");

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
      alert(`API Endpoint saved: ${newApiEndpoint}`);
      setDropdownState({ activeButton: null, isOpen: false });
    } else {
      alert('Invalid URL. Please enter a valid API endpoint.');
    }
  };

  // Cancel button clicked
  const handleCancelEndpoint = () => {
    setDropdownState({ activeButton:null, isOpen: false});
  };

  // Handles language selection
  const handleLanguageSelect = (language: string) => {
    alert(`Set Language to ${language}`);
    setSelectedLanguage(language);
    setDropdownState({ activeButton: null, isOpen: false });
  };

  // Handles reset actions
  const handleReset = () => {
    alert('Reset initiated');
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleFactoryReset = () => {
    alert('Factory Reset initiated');
    setDropdownState({ activeButton: null, isOpen: false });
  };

  // check if valid URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // If mouse clicked outside button-dropdowns, close dropdowns
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
          data-testid="settings-button" 
          className={`button ${dropdownState.activeButton === 'settings' ? 'active' : ''}`}
          onClick={() => toggleDropdown('settings')}
          aria-expanded={dropdownState.activeButton === 'settings'}
        >
          <IoSettingsOutline size={32}/>
        </button>
        {dropdownState.activeButton === 'settings' && (
          <div className="dropdown-content show">
            <div className="settings-prompt">
              <label htmlFor="api-endpoint-input">API Endpoint:</label>
              <div className="settings-prompt-row">
                <input
                    id="api-endpoint-input"
                    type="text"
                    placeholder="Enter new API endpoint"
                    value={newApiEndpoint}
                    onChange={(e) => setNewApiEndpoint(e.target.value)}
                />
                <div className="settings-prompt-buttons">
                  <button onClick={handleSaveEndpoint}>Save</button>
                  <button onClick={handleCancelEndpoint}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Language Dropdown */}
      <div className="dropdown-button">
        <button
          data-testid="language-button"
          className={`button ${dropdownState.activeButton === 'language' ? 'active' : ''}`}
          onClick={() => toggleDropdown('language')}
          aria-expanded={dropdownState.activeButton === 'language'}
        >
          <IoLanguage size={32}/>
        </button>
        {dropdownState.activeButton === 'language' && (
          <div className="dropdown-content show">
            <button onClick={() => handleLanguageSelect('English')}>
              {selectedLanguage === 'English' ?  <IoCheckmark size={24} fill='black'/> : <PiArrowClockwiseFill size={24} fill='black'/>}
              English
            </button>
            <button onClick={() => handleLanguageSelect('French')}>
              {selectedLanguage === 'French' ?  <IoCheckmark size={24} fill='black'/> : <PiArrowClockwiseFill size={24} fill='black'/>}
              Français
            </button>
          </div>
        )}
      </div>

      {/* Reset Dropdown */}
      <div className="dropdown-button">
        <button
          data-testid="reset-button"
          className={`button ${dropdownState.activeButton === 'reset' ? 'active' : ''}`}
          onClick={() => toggleDropdown('reset')}
          aria-expanded={dropdownState.activeButton === 'reset'}
        >
          <PiArrowClockwiseFill size={32}/>
        </button>
        {dropdownState.activeButton === 'reset' && (
          <div className="dropdown-content show">
            <button onClick={handleReset}>
              <PiArrowClockwiseFill size={24}/>
              Reset
            </button>
            <button onClick={handleFactoryReset} style={{ color: '#dc143c' }}>
              <IoTrashOutline size={24} fill='red'/>
              Factory Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
