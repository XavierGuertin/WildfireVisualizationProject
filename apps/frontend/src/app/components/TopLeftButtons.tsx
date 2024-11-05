import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 20px;
  z-index: 1000;
`;

const Button = styled.button<{ active?: boolean }>`
  width: 50px;
  height: 50px;
  background-color: #00447E;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: ${({ active }) => (active ? '2px solid white' : 'none')};

  &:hover {
    background-color: #0056b3;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DropdownButton = styled.div`
  position: relative;
`;

const DropdownContent = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => ($show ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  min-width: 150px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 5px 0;
  border-radius: 10px;
  z-index: 1;
  margin-top: 3px;

  & > button {
    background: none;
    color: black;
    border: none;
    padding: 5px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;

    &:hover::before {
      content: "";
      position: absolute;
      left: 3%;
      width: 94%;
      height: 100%;
      background-color: #f1f1f1;
      z-index: -1;
      border-radius: 10px;
    }

    img {
      width: 25px;
      height: 25px;
      margin-right: 10px;
    }

    span {
      flex: 1;
      text-align: center;
    }
  }
`;

const TopLeftButtons: React.FC = () => {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [resetDropdownOpen, setResetDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [activeButton, setActiveButton] = useState(""); // Track active button
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSettingsClick = () => {
    if (activeButton === "settings") {
      setActiveButton(""); // Deactivate if already active
    } else {
      setActiveButton("settings"); // Set active button to settings
    }
    setLanguageDropdownOpen(false);
    setResetDropdownOpen(false);
  };

  const handleLanguageClick = () => {
    if (activeButton === "language") {
      setActiveButton(""); // Deactivate if already active
    } else {
      setActiveButton("language"); // Set active button to language
    }
    setLanguageDropdownOpen(!languageDropdownOpen);
    setResetDropdownOpen(false);
  };

  const handleLanguageSelect = (language: string) => {
    alert(`Set Language to ${language}`);
    setSelectedLanguage(language);
    setLanguageDropdownOpen(false);
    setActiveButton("");
  };

  const handleResetClick = () => {
    // Check if the reset button is already active
    if (activeButton === "reset") {
      setActiveButton(""); // Deactivate if already active
    } else {
      setActiveButton("reset"); // Set active button to reset
    }
    setResetDropdownOpen(!resetDropdownOpen);
    setLanguageDropdownOpen(false);
  };

  const handleReset = () => {
    alert("Reset initiated");
    setResetDropdownOpen(false);
    setActiveButton("");
  };

  const handleFactoryReset = () => {
    alert("Factory Reset initiated");
    setResetDropdownOpen(false);
    setActiveButton("");
  };

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
    <ButtonContainer ref={dropdownRef}>
      <Button onClick={handleSettingsClick} active={activeButton === "settings"}>
        <img src="/assets/settings-white-outline-icon-removebg-preview.png" alt="Settings" />
      </Button>
      <DropdownButton>
        <Button onClick={handleLanguageClick} active={activeButton === "language"}>
          <img src="/assets/Language-Logo.png" alt="Language" />
        </Button>
        <DropdownContent $show={languageDropdownOpen}>
          <button onClick={() => handleLanguageSelect("English")}>
            {selectedLanguage === "English" && <img src="/assets/checkmark.png" alt="Tick" />}
            {selectedLanguage !== "English" && <img src="/assets/Mini-Reset Arrow.png" style={{opacity: 0}} alt="Nothing/Spacer" />}
            English
          </button>
          <button onClick={() => handleLanguageSelect("French")}>
            {selectedLanguage === "French" && <img src="/assets/checkmark.png" alt="Tick" />}
            {selectedLanguage !== "French" && <img src="/assets/Mini-Reset Arrow.png" style={{opacity: 0}} alt="Nothing/Spacer" />}
            Français
          </button>
        </DropdownContent>
      </DropdownButton>
      <DropdownButton>
        <Button onClick={handleResetClick} active={activeButton === "reset"}>
          <img src="/assets/Reset-Logo.png" alt="Reset" />
        </Button>
        <DropdownContent $show={resetDropdownOpen}>
          <button onClick={handleReset}>
            <img src="/assets/Mini-Reset Arrow.png" alt="Reset" />
            Reset
          </button>
          <button onClick={handleFactoryReset} style={{ color: '#dc143c' }}>
            <img src="/assets/garbage_logo-removebg-preview.png" alt="Factory Reset" />
            Factory Reset
          </button>
        </DropdownContent>
      </DropdownButton>
    </ButtonContainer>
  );
};

export default TopLeftButtons;