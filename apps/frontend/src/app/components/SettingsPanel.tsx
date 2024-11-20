import React, { useState, useEffect, useRef } from 'react';
import '../styles/SettingsPanel.css'; // Import the CSS file

const SettingsPanel: React.FC = () => {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [resetDropdownOpen, setResetDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [activeButton, setActiveButton] = useState<string>(""); // Track active button
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Settings button clicked
  const handleSettingsClick = () => {
    setActiveButton(activeButton === "settings" ? "" : "settings");
    setLanguageDropdownOpen(false);
    setResetDropdownOpen(false);
  };

  // Language button clicked
  const handleLanguageClick = () => {
    setActiveButton(activeButton === "language" ? "" : "language");
    setLanguageDropdownOpen(!languageDropdownOpen);
    setResetDropdownOpen(false);
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
  }, [languageDropdownOpen, resetDropdownOpen]);

  return (
    <div className="button-container" ref={dropdownRef}>
      {/* Settings button */}
      <button data-testid="settings-button" className={`button ${activeButton === "settings" ? "active" : ""}`} onClick={handleSettingsClick}>
        <img src="/assets/settings-white-outline-icon-removebg-preview.png" alt="Settings" />
      </button>

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

export default SettingsPanel;
