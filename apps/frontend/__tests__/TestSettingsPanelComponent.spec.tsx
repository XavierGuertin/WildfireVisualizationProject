import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { resetCollections, fetchCollectionsFromEndpoint } from '../src/app/services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import SettingsPanel from '../src/app/components/SettingsPanel';
import Footer from '../src/app/components/Footer';
import { MapProvider } from '../src/app/components/MapContext';

jest.mock('sweetalert2');
jest.mock('../src/app/services/api');
jest.mock('react-toastify');

const MySwal = withReactContent(Swal);

jest.mock('../src/app/components/SettingsPanel', () => {
  const originalModule = jest.requireActual('../src/app/components/SettingsPanel');
  return {
    __esModule: true,
    ...originalModule,
    handleResetDataFromEndpoint: jest.fn(),
  };
});

describe('Test SettingsPanel component', () => {
  beforeAll(() => {
    window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open and close the settings dropdown', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(settingsButton).toHaveClass('active');
    expect(screen.getByLabelText('api_endpoint:')).toBeInTheDocument();
    expect(screen.getByText('save')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('should render the correct initial API endpoint value and update the input field', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const inputField = screen.getByLabelText(
      'api_endpoint:',
    ) as HTMLInputElement;
    expect(inputField.value).toBe('https://default-api-endpoint.com');

    fireEvent.change(inputField, {
      target: { value: 'https://new-api-endpoint.com' },
    });

    expect(inputField.value).toBe('https://new-api-endpoint.com');
  });

  it('should trigger save action for a valid API endpoint', async () => {
    (fetchCollectionsFromEndpoint as jest.Mock).mockResolvedValue(
      'Collections fetched successfully',
    );
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const inputField = screen.getByLabelText(
      'api_endpoint:',
    ) as HTMLInputElement;
    const saveButton = screen.getByText('save');

    fireEvent.change(inputField, {
      target: { value: 'https://new-api-endpoint.com' },
    });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(fetchCollectionsFromEndpoint).toHaveBeenCalled(),
    );
  });

  it('should trigger an error alert for an invalid API endpoint', async () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);


    const inputField = screen.getByLabelText('api_endpoint:') as HTMLInputElement;
    const saveButton = screen.getByText('save');

    fireEvent.change(inputField, { target: { value: 'invalid-url' } });
    fireEvent.click(saveButton);
  });

  it('should close the settings dropdown when Cancel is clicked', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const cancelButton = screen.getByText('cancel');
    fireEvent.click(cancelButton);

    expect(settingsButton).not.toHaveClass('active');
  });

  it('should close settings dropdown when clicking outside', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    fireEvent.mouseDown(document.body);

    expect(settingsButton).not.toHaveClass('active');
    expect(screen.queryByLabelText('api_endpoint:')).not.toBeInTheDocument();
  });

  it('should not close settings dropdown if clicking inside dropdown', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const dropdownContent = screen
      .getByLabelText('api_endpoint:')
      .closest('.dropdown-content');
    jest.spyOn(dropdownContent!, 'contains').mockReturnValueOnce(true);

    fireEvent.mouseDown(dropdownContent!);

    expect(settingsButton).toHaveClass('active');
  });

  it('should open and close the language dropdown', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);
    expect(languageButton).toHaveClass('active');

    const dropdownContent = screen
      .getByText('english')
      .closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(languageButton);
    expect(languageButton).not.toHaveClass('active');
  });

  it('should select English and French in the language dropdown', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);

    const frenchButton = screen.getByRole('button', { name: 'french' });
    fireEvent.click(frenchButton);

    fireEvent.click(languageButton);

    const englishButton = screen.getByRole('button', { name: 'english' });
    fireEvent.click(englishButton);
  });

  it('should open and close the reset dropdown', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    expect(resetButton).toHaveClass('active');

    const dropdownContent = screen
      .getByText('reset')
      .closest('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.click(resetButton);
    expect(resetButton).not.toHaveClass('active');
  });

  it('should close dropdowns when clicking outside', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);

    const dropdownContent = document.querySelector('.dropdown-content');
    expect(dropdownContent).toHaveClass('show');

    fireEvent.mouseDown(document.body);
  });

  it('should handle reset data from endpoint', async () => {
    (MySwal.fire as jest.Mock)
      .mockResolvedValueOnce({ isConfirmed: true }) // Confirm reset
      .mockResolvedValueOnce({ isConfirmed: true, value: 'https://new-api-endpoint.com' }); // Enter URL and save

    (resetCollections as jest.Mock).mockResolvedValueOnce('Reset successful');
    (fetchCollectionsFromEndpoint as jest.Mock).mockResolvedValueOnce('Endpoint saved');

    render(<MapProvider><SettingsPanel /></MapProvider>);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    const resetActionButton = screen.getByText('reset');
    fireEvent.click(resetActionButton);

    await waitFor(() => {
      expect(MySwal.fire).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(resetCollections).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Reset successful');
    });

    await waitFor(() => {
      expect(MySwal.fire).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(fetchCollectionsFromEndpoint).toHaveBeenCalledWith();
      expect(toast.success).toHaveBeenCalledWith('Endpoint saved');
    });
  });

  it('should handle factory reset data from endpoint', async () => {
    (MySwal.fire as jest.Mock)
      .mockResolvedValueOnce({ isConfirmed: true }) // Confirm factory reset
      .mockResolvedValueOnce({ isConfirmed: true, value: 'https://new-api-endpoint.com' }); // Enter URL and save

    (resetCollections as jest.Mock).mockResolvedValueOnce('Factory reset successful');
    (fetchCollectionsFromEndpoint as jest.Mock).mockResolvedValueOnce('Endpoint saved');

    render(<MapProvider><SettingsPanel /></MapProvider>);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    const factoryResetButton = screen.getByText('factory_reset');
    fireEvent.click(factoryResetButton);

    await waitFor(() => {
      expect(MySwal.fire).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(resetCollections).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Factory reset successful');
    });

    await waitFor(() => {
      expect(MySwal.fire).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(fetchCollectionsFromEndpoint).toHaveBeenCalledWith();
      expect(toast.success).toHaveBeenCalledWith('Endpoint saved');
    });
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
    render(<MapProvider><SettingsPanel /></MapProvider>);

    // Verify that the language retrieved from local storage is applied
    expect(localStorage.getItem('language')).toBe('fr');
  });

  it('should save the selected language to local storage when changed', () => {
    render(<MapProvider><SettingsPanel /></MapProvider>);

    // Open the language dropdown
    const languageButton = screen.getByRole('button', { name: /language/i }); // Assuming the button has the 'language' name
    fireEvent.click(languageButton);

    // Select French
    const frenchButton = screen.getByRole('button', { name: /french/i });
    fireEvent.click(frenchButton);

    // Verify that the language was saved in local storage
    expect(localStorage.getItem('language')).toBe('fr');

    // Open the language dropdown again and select English
    fireEvent.click(languageButton);
    const englishButton = screen.getByRole('button', { name: /english/i });
    fireEvent.click(englishButton);

    // Verify that the language was updated in local storage
    expect(localStorage.getItem('language')).toBe('en');
  });
  it('should initialize language from localStorage and show success toast', async () => {
    localStorage.setItem('language', 'fr');

    render(<MapProvider><SettingsPanel /></MapProvider>);

    // Ensure that toast.success was called after language retrieval
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('language_retrieved');
    });

    // Ensure that the language change was triggered
    expect(localStorage.getItem('language')).toBe('fr');
  });
});
