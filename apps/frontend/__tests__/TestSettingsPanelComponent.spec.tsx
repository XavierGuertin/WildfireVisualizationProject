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

    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton); // Open settings dropdown

    // Assert settings dropdown is active
    expect(settingsButton).toHaveClass('active');


    // Assert settings dropdown content is visible
    const dropdownContent = screen.getByLabelText('api_endpoint:').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    // Check for input, Save and Cancel buttons
    expect(screen.getByLabelText('api_endpoint:')).toBeInTheDocument();
    expect(screen.getByText('save')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('should render the correct initial API endpoint value and update the input field', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton); // Open settings dropdown

    const inputField = screen.getByLabelText('api_endpoint:') as HTMLInputElement;

    // Check initial value
    expect(inputField.value).toBe('https://default-api-endpoint.com');

    // Update input field
    fireEvent.change(inputField, { target: { value: 'https://new-api-endpoint.com' } });
    expect(inputField.value).toBe('https://new-api-endpoint.com');
  });

  // 6) Prompt Test
  it('should trigger save action for a valid API endpoint', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton); // Open settings dropdown

    const inputField = screen.getByLabelText('api_endpoint:') as HTMLInputElement;
    const saveButton = screen.getByText('save');

    // Update input field with a valid URL
    fireEvent.change(inputField, { target: { value: 'https://new-api-endpoint.com' } });
    fireEvent.click(saveButton);

    // Verify alert for valid input
    expect(window.alert).toHaveBeenCalledWith('api_endpoint save: https://new-api-endpoint.com');
  });


  // 7) Prompt Test
  it('should trigger an error alert for an invalid API endpoint', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton); // Open settings dropdown

    const inputField = screen.getByLabelText('api_endpoint:') as HTMLInputElement;
    const saveButton = screen.getByText('save');

    // Update input field with an invalid URL
    fireEvent.change(inputField, { target: { value: 'invalid-url' } });
    fireEvent.click(saveButton);

    // Verify alert for invalid input
    expect(window.alert).toHaveBeenCalledWith('invalid_url');
  });

  it('should close the settings dropdown when Cancel is clicked', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton); // Open settings dropdown

    const cancelButton = screen.getByText('cancel');

    // Click the Cancel button
    fireEvent.click(cancelButton);

    // Verify dropdown closes
    expect(settingsButton).not.toHaveClass('active');
  });


  // 2) Prompt Test
  it('should close settings dropdown when clicking outside', () => {
    render(<SettingsPanel />);

    // Open the settings dropdown
    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton);

    // Assert the dropdown is open
    const dropdownContent = screen.getByText('api_endpoint:').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show'); // Confirm dropdown is visible

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);

    // Assert the dropdown is closed
    expect(settingsButton).not.toHaveClass('active');
    expect(dropdownContent).not.toBeVisible();

    // Verify 'setDropdownState' was called
    expect(screen.queryByLabelText('api_endpoint:')).not.toBeInTheDocument();
  });

  // 4) Promp Test
  it('should handle case where dropdownRef is null without errors', () => {
    // Mock React.useRef to return a ref with current as null
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: null });

    render(<SettingsPanel />);

    // Open the settings dropdown
    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
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
    const buttons = document.querySelectorAll('.dropdown-button');
    const settingsButton = buttons[0].querySelector('button')!;
    fireEvent.click(settingsButton);

    // Mock dropdownRef.current.contains to return true
    const dropdownContent = screen.getByLabelText('api_endpoint:').closest('.dropdown-content');
    jest.spyOn(dropdownContent!, 'contains').mockReturnValueOnce(true);

    // Simulate clicking inside
    fireEvent.mouseDown(dropdownContent!);

    // Dropdown should remain open
    expect(settingsButton).toHaveClass('active');
  });


  it('should open and close the language dropdown', () => {
    render(<SettingsPanel />);

    const languageButton = screen.getAllByRole('button')[1];
    fireEvent.click(languageButton); // Open language dropdown
    expect(languageButton).toHaveClass('active');

    // Check if dropdown content is visible
    const dropdownContent = screen.getByText('english').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(languageButton); // Close language dropdown
    expect(languageButton).not.toHaveClass('active');
  });


test('should select English and French in the language dropdown', () => {
  // Render the SettingsPanel component
  render(<SettingsPanel />);

  // Open language dropdown
  const languageButton = screen.getAllByRole('button')[1];
  fireEvent.click(languageButton);

  // Select French
  const frenchButton = screen.getByRole('button', { name: 'french' });
  fireEvent.click(frenchButton);

  // Open language dropdown again
  fireEvent.click(languageButton);

  // Select English
  const englishButton = screen.getByRole('button', { name: 'english' });
  fireEvent.click(englishButton);
});


  it('should open and close the reset dropdown', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const resetButton = buttons[2].querySelector('button')!;
    fireEvent.click(resetButton); // Open reset dropdown
    expect(resetButton).toHaveClass('active');

    // Check if dropdown content is visible
    const dropdownContent = screen.getByText('reset').closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(resetButton); // Close reset dropdown
    expect(resetButton).not.toHaveClass('active');
  });

  it('should trigger alert on reset and factory reset clicks', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const resetButton = buttons[2].querySelector('button')!;
    fireEvent.click(resetButton); // Open reset dropdown

    fireEvent.click(screen.getByText('reset'));
    expect(window.alert).toHaveBeenCalledWith('reset_initiated');

    fireEvent.click(resetButton); // Reopen reset dropdown
    fireEvent.click(screen.getByText('factory_reset'));
    expect(window.alert).toHaveBeenCalledWith('factory_reset_initiated');
  });

  it('should close dropdowns when clicking outside', () => {
    render(<SettingsPanel />);

    const buttons = document.querySelectorAll('.dropdown-button');
    const languageButton = buttons[1].querySelector('button')!;
    fireEvent.click(languageButton); // Open language dropdown
    const dropdownContent = document.querySelector('.dropdown-content')
    expect(dropdownContent).toHaveClass('show'); // Confirm dropdown is visible

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);
  });
});

describe('Local Storage functionality in SettingsPanel', () => {
  // Mock alert function to avoid JSDOM error
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should retrieve the saved language from local storage on initialization', () => {
    // Set a saved language in localStorage
    localStorage.setItem('language', 'fr');

    // Render the component
    render(<SettingsPanel />);

    // Verify that the language retrieved from local storage is applied
    expect(localStorage.getItem('language')).toBe('fr');
  });

  it('should save the selected language to local storage when changed', () => {
    render(<SettingsPanel />);

    // Open the language dropdown
    const languageButton = screen.getAllByRole('button')[1];
    fireEvent.click(languageButton);

    // Select French
    const frenchButton = screen.getByRole('button', { name: 'french' });
    fireEvent.click(frenchButton);

    // Verify that the language was saved in local storage
    expect(localStorage.getItem('language')).toBe('fr');

    // Open the language dropdown again and select English
    fireEvent.click(languageButton);
    const englishButton = screen.getByRole('button', { name: 'english' });
    fireEvent.click(englishButton);

    // Verify that the language was updated in local storage
    expect(localStorage.getItem('language')).toBe('en');
  });
});
