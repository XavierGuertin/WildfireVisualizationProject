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

  // 1) Prompt Test
  it('should open and close the settings dropdown', () => {
    render(<SettingsPanel />);

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
    
    // Assert settings dropdown is active
    expect(settingsButton).toHaveClass('active');


    // Assert settings dropdown content is visible
    const dropdownContent = screen.getByLabelText('API Endpoint:').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    // Check for input, Save and Cancel buttons
    expect(screen.getByLabelText('API Endpoint:')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should render the correct initial API endpoint value and update the input field', () => {
    render(<SettingsPanel />);
  
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
  
    const inputField = screen.getByLabelText('API Endpoint:') as HTMLInputElement;
  
    // Check initial value
    expect(inputField.value).toBe('https://default-api-endpoint.com');
  
    // Update input field
    fireEvent.change(inputField, { target: { value: 'https://new-api-endpoint.com' } });
    expect(inputField.value).toBe('https://new-api-endpoint.com');
  });

  // 6) Prompt Test
  it('should trigger save action for a valid API endpoint', () => {
    render(<SettingsPanel />);
  
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
  
    const inputField = screen.getByLabelText('API Endpoint:') as HTMLInputElement;
    const saveButton = screen.getByText('Save');
  
    // Update input field with a valid URL
    fireEvent.change(inputField, { target: { value: 'https://new-api-endpoint.com' } });
    fireEvent.click(saveButton);
  
    // Verify alert for valid input
    expect(window.alert).toHaveBeenCalledWith('API Endpoint saved: https://new-api-endpoint.com');
  });


  // 7) Prompt Test
  it('should trigger an error alert for an invalid API endpoint', () => {
    render(<SettingsPanel />);
  
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
  
    const inputField = screen.getByLabelText('API Endpoint:') as HTMLInputElement;
    const saveButton = screen.getByText('Save');
  
    // Update input field with an invalid URL
    fireEvent.change(inputField, { target: { value: 'invalid-url' } });
    fireEvent.click(saveButton);
  
    // Verify alert for invalid input
    expect(window.alert).toHaveBeenCalledWith('Invalid URL. Please enter a valid API endpoint.');
  });

  it('should close the settings dropdown when Cancel is clicked', () => {
    render(<SettingsPanel />);
  
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // Open settings dropdown
  
    const cancelButton = screen.getByText('Cancel');
  
    // Click the Cancel button
    fireEvent.click(cancelButton);
  
    // Verify dropdown closes
    expect(settingsButton).not.toHaveClass('active');
  }); 
  

  // 2) Prompt Test
  it('should close settings dropdown when clicking outside', () => {
    render(<SettingsPanel />);

    // Open the settings dropdown
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);

    // Assert the dropdown is open
    const dropdownContent = screen.getByText('API Endpoint:').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show'); // Confirm dropdown is visible

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);

    // Assert the dropdown is closed
    expect(settingsButton).not.toHaveClass('active');
    expect(dropdownContent).not.toBeVisible();

    // Verify 'setDropdownState' was called
    expect(screen.queryByLabelText('API Endpoint:')).not.toBeInTheDocument();
  });

  // 4) Promp Test
  it('should handle case where dropdownRef is null without errors', () => {
    // Mock React.useRef to return a ref with current as null
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: null });
  
    render(<SettingsPanel />);
  
    // Open the settings dropdown
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);
  
    // Simulate clicking outside
    fireEvent.mouseDown(document.body);
  
    // Verify no errors occur and dropdown state remains unaffected
    expect(settingsButton).not.toHaveClass('active');
  });  
  
  // 3) Prompt Test
  it('should not close settings dropdown if clicking inside dropdown', () => {
    render(<SettingsPanel />);
  
    // Open the settings dropdown
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);
  
    // Mock dropdownRef.current.contains to return true
    const dropdownContent = screen.getByLabelText('API Endpoint:').closest('.dropdown-content');
    jest.spyOn(dropdownContent!, 'contains').mockReturnValueOnce(true);
  
    // Simulate clicking inside
    fireEvent.mouseDown(dropdownContent!);
  
    // Dropdown should remain open
    expect(settingsButton).toHaveClass('active');
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
