// components/TopLeftButtons.tsx

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

const Button = styled.button`
  width: 50px;
  height: 50px;
  background-color: #00447E;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;

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
  margin-top: 5px;
  border-radius: 10px;
  z-index: 1;

  & > button {
    background: none;
    color: black;
    border: none;
    padding: 10px;
    text-align: left;
    width: 100%;
    cursor: pointer;

    &:hover {
      background-color: #f1f1f1;
    }
  }
`;

const TopLeftButtons: React.FC = () => {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [resetDropdownOpen, setResetDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  //Settings Button Click
  const handleSettingsClick = () => {
    setLanguageDropdownOpen(false); // Close language dropdown if open
    setResetDropdownOpen(false); // Close reset dropdown if open
  };

  //Language Button Click
  const handleLanguageClick = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
    setResetDropdownOpen(false); // Close other dropdown if open
  };

  const handleEnglish = () => {
    alert("Set Language to English");
    setLanguageDropdownOpen(false);
  };

  const handleFrench = () => {
    alert("Set Language to French");
    setLanguageDropdownOpen(false);
  };

  //Reset Button Click
  const handleResetClick = () => {
    setResetDropdownOpen(!resetDropdownOpen);
    setLanguageDropdownOpen(false); // Close other dropdown if open
  };

  const handleFactoryReset = () => {
    alert("Factory Reset initiated");
    setResetDropdownOpen(false);
  };

  const handleHardReset = () => {
    alert("Hard Reset initiated");
    setResetDropdownOpen(false);
  };

  // Close dropdowns if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
        setResetDropdownOpen(false);
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
      <Button onClick={handleSettingsClick}>
        <img src="/assets/settings-white-outline-icon-removebg-preview.png" alt="Settings" />
      </Button>
      <DropdownButton>
        <Button onClick={handleLanguageClick}>
          <img src="/assets/Language-Logo.png" alt="Language" />
        </Button>
        <DropdownContent $show={languageDropdownOpen}>
          <button onClick={handleEnglish}>English</button>
          <button onClick={handleFrench}>French</button>
        </DropdownContent>
      </DropdownButton>
      <DropdownButton>
        <Button onClick={handleResetClick}>
          <img src="/assets/Reset-Logo.png" alt="Reset" />
        </Button>
        <DropdownContent $show={resetDropdownOpen}>
          <button onClick={handleFactoryReset}>Factory Reset</button>
          <button onClick={handleHardReset}>Hard Reset</button>
        </DropdownContent>
      </DropdownButton>
    </ButtonContainer>
  );
};

export default TopLeftButtons;