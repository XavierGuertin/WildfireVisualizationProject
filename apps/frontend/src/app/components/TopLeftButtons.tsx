import React, { useState, useEffect, useRef } from 'react';
import '../styles/topleftbuttons.css'; // Import the CSS file

const TopLeftButtons: React.FC = () => {
  const [isSettingsPromptOpen, setIsSettingsPromptOpen] = useState(false);
  const [newApiEndpoint, setNewApiEndpoint] = useState<string>("https://default-api-endpoint.com");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [resetDropdownOpen, setResetDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [activeButton, setActiveButton] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Settings button clicked
  const handleSettingsClick = () => {
    setActiveButton(activeButton === "settings" ? "" : "settings");
    setIsSettingsPromptOpen(!isSettingsPromptOpen);
    setLanguageDropdownOpen(false);
    setResetDropdownOpen(false);
  }

  // Save button clicked
  const handleSaveEndpoint = () => {
    if (isValidUrl(newApiEndpoint)) {
      alert(`API Endpoint saved: ${newApiEndpoint}`);
      setIsSettingsPromptOpen(false);
    } else {
      alert("Invalid URL. Please enter a valid API endpoint.");
    }
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

  // Cancel button clicked
  const handleCancelEndpoint = () => {
    setIsSettingsPromptOpen(false);
  };

  // Language button clicked
  const handleLanguageClick = () => {
    setActiveButton(activeButton === "language" ? "" : "language");
    setLanguageDropdownOpen(!languageDropdownOpen);
    setResetDropdownOpen(false);
    setIsSettingsPromptOpen(false);
  };

  // Language dropdown button clicked
  const handleLanguageSelect = (language: string) => {
    alert(`Set Language to ${language}`);
    setSelectedLanguage(language);
    setLanguageDropdownOpen(false);
    setActiveButton("");
  };

  // Reset button clicked
  const handleResetClick = () => {
    setActiveButton(activeButton === "reset" ? "" : "reset");
    setResetDropdownOpen(!resetDropdownOpen);
    setLanguageDropdownOpen(false);
    setIsSettingsPromptOpen(false);
  };

  // Soft reset dropdown button clicked
  const handleReset = () => {
    alert("Reset initiated");
    setResetDropdownOpen(false);
    setActiveButton("");
  };

  // Factory reset dropdown button clicked
  const handleFactoryReset = () => {
    alert("Factory Reset initiated");
    setResetDropdownOpen(false);
    setActiveButton("");
  };

  // If mouse clicked outside button-dropdowns, close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
        setResetDropdownOpen(false);
        setIsSettingsPromptOpen(false);
        setActiveButton(""); // Reset active button
      }
    };

    if (languageDropdownOpen || resetDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageDropdownOpen, resetDropdownOpen, isSettingsPromptOpen]);

  return (
    <div className="button-container" ref={dropdownRef}>
      {/* Settings button */}
      <button data-testid="settings-button" className={`button ${activeButton === "settings" ? "active" : ""}`} onClick={handleSettingsClick}>
        <img src="/assets/settings-white-outline-icon-removebg-preview.png" alt="Settings" />
      </button>

      {/* Settings Prompt */}
      {isSettingsPromptOpen && (
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
      )}

      {/* Language dropdown button */}
      <div className="dropdown-button">
        <button data-testid="language-button" className={`button ${activeButton === "language" ? "active" : ""}`} onClick={handleLanguageClick}>
          <img src="/assets/Language-Logo.png" alt="Language" />
        </button>
        <div className={`dropdown-content ${languageDropdownOpen ? "show" : ""}`}>
          <button onClick={() => handleLanguageSelect("English")}>
            {selectedLanguage === "English" && <img src="/assets/checkmark.png" alt="Tick" />}
            {selectedLanguage !== "English" && <img src="/assets/Mini-Reset Arrow.png" style={{ opacity: 0 }} alt="Nothing/Spacer" />}
            English
          </button>
          <button onClick={() => handleLanguageSelect("French")}>
            {selectedLanguage === "French" && <img src="/assets/checkmark.png" alt="Tick" />}
            {selectedLanguage !== "French" && <img src="/assets/Mini-Reset Arrow.png" style={{ opacity: 0 }} alt="Nothing/Spacer" />}
            Français
          </button>
        </div>
      </div>

      {/* Reset dropdown button */}
      <div className="dropdown-button">
        <button data-testid="reset-button" className={`button ${activeButton === "reset" ? "active" : ""}`} onClick={handleResetClick}>
          <img src="/assets/Reset-Logo.png" alt="Reset" />
        </button>
        <div className={`dropdown-content ${resetDropdownOpen ? "show" : ""}`}>
          <button onClick={handleReset}>
            <img src="/assets/Mini-Reset Arrow.png" alt="Reset" />
            Reset
          </button>
          <button onClick={handleFactoryReset} style={{ color: '#dc143c' }}>
            <img src="/assets/garbage_logo-removebg-preview.png" alt="Factory Reset" />
            Factory Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopLeftButtons;
