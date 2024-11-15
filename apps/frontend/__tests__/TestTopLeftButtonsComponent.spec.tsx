import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopLeftButtons from '../src/app/components/TopLeftButtons';

describe('Test TopLeftButtons component', () => {
  // Mock alert function to avoid JSDOM error
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open and close the settings dropdown', () => {
    render(<TopLeftButtons />);

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
    expect(settingsButton).toHaveClass('active');

    fireEvent.click(settingsButton); // Close settings dropdown
    expect(settingsButton).not.toHaveClass('active');
  });

  it('should open and close the language dropdown', () => {
    render(<TopLeftButtons />);

    const languageButton = screen.getByTestId('language-button');
    fireEvent.click(languageButton); // Open language dropdown
    expect(languageButton).toHaveClass('active');

    // Check if dropdown content is visible
    const dropdownContent = screen.getByText('English').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(languageButton); // Close language dropdown
    expect(languageButton).not.toHaveClass('active');
    expect(dropdownContent).not.toHaveClass('show'); // Confirm dropdown is closed
  });

  it('should select English and French in the language dropdown', () => {
    render(<TopLeftButtons />);

    const languageButton = screen.getByTestId('language-button');
    fireEvent.click(languageButton); // Open language dropdown

    fireEvent.click(screen.getByText('Français')); // Select French
    expect(screen.getByText('Français')).toBeInTheDocument(); // French should now be selected

    fireEvent.click(languageButton);
    fireEvent.click(screen.getByText('English')); // Select English
    expect(screen.getByText('English')).toBeInTheDocument(); // English should now be selected
  });

  it('should open and close the reset dropdown', () => {
    render(<TopLeftButtons />);

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton); // Open reset dropdown
    expect(resetButton).toHaveClass('active');

    // Check if dropdown content is visible
    const dropdownContent = screen.getByText('Reset').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(resetButton); // Close reset dropdown
    expect(resetButton).not.toHaveClass('active');
    expect(dropdownContent).not.toHaveClass('show'); // Confirm dropdown is closed
  });

  it('should trigger alert on reset and factory reset clicks', () => {
    render(<TopLeftButtons />);

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton); // Open reset dropdown

    fireEvent.click(screen.getByText('Reset'));
    expect(window.alert).toHaveBeenCalledWith('Reset initiated');

    fireEvent.click(resetButton); // Reopen reset dropdown
    fireEvent.click(screen.getByText('Factory Reset'));
    expect(window.alert).toHaveBeenCalledWith('Factory Reset initiated');
  });

  it('should close dropdowns when clicking outside', () => {
    render(<TopLeftButtons />);

    const languageButton = screen.getByTestId('language-button');
    fireEvent.click(languageButton); // Open language dropdown
    const dropdownContent = screen.getByText('English').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show'); // Confirm dropdown is visible

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);

    // Verify dropdown content is closed
    expect(dropdownContent).not.toHaveClass('show');
  });
});
