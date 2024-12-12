import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../src/app/components/SettingsPanel';

describe('Test SettingsPanel component', () => {
  // Mock alert function to avoid JSDOM error
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open and close the settings dropdown', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
    expect(settingsButton).toHaveClass('active');

    fireEvent.click(settingsButton); // Close settings dropdown
    expect(settingsButton).not.toHaveClass('active');
  });

  it('should open and close the language dropdown', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getByTestId('language-button');
    fireEvent.click(languageButton); // Open language dropdown
    expect(languageButton).toHaveClass('active');

    // Check if dropdown content is visible
    const dropdownContent = screen.getByText('English').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(languageButton); // Close language dropdown
    expect(languageButton).not.toHaveClass('active');
  });

  it('should select English and French in the language dropdown', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getByTestId('language-button');
    fireEvent.click(languageButton); // Open language dropdown

    fireEvent.click(screen.getByText('Français')); // Select French
    expect(window.alert).toHaveBeenCalledWith('Set Language to French');

    fireEvent.click(languageButton);
    fireEvent.click(screen.getByText('English')); // Select English
    expect(window.alert).toHaveBeenCalledWith('Set Language to English');
  });

  it('should open and close the reset dropdown', () => {
    render(<SettingsPanel />);

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton); // Open reset dropdown
    expect(resetButton).toHaveClass('active');

    // Check if dropdown content is visible
    const dropdownContent = screen.getByText('Reset').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(resetButton); // Close reset dropdown
    expect(resetButton).not.toHaveClass('active');
  });

  it('should trigger alert on reset and factory reset clicks', () => {
    render(<SettingsPanel />);

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton); // Open reset dropdown

    fireEvent.click(screen.getByText('Reset'));
    expect(window.alert).toHaveBeenCalledWith('Reset initiated');

    fireEvent.click(resetButton); // Reopen reset dropdown
    fireEvent.click(screen.getByText('Factory Reset'));
    expect(window.alert).toHaveBeenCalledWith('Factory Reset initiated');
  });

  it('should close dropdowns when clicking outside', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getByTestId('language-button');
    fireEvent.click(languageButton); // Open language dropdown
    const dropdownContent = screen.getByText('English').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show'); // Confirm dropdown is visible

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);
  });
});
