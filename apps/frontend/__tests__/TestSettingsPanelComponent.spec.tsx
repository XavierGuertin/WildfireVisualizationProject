// SettingsPanel.test.tsx
import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../src/app/components/SettingsPanel';
import { MapProvider, useMapLayerContext } from '../src/app/components/MapContext';

// --- Mocks ---

// Mock react-i18next to return a simple t function and a dummy i18n object.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

// Mock react-toastify.
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock API service functions.
jest.mock('../src/app/services/api', () => ({
  fetchCollectionsFromEndpoint: jest.fn(() =>
    Promise.resolve('Endpoint saved')
  ),
  resetCollections: jest.fn(() => Promise.resolve('Reset successful')),
  verifyIfEndpointHasCollections: jest.fn(() => Promise.resolve('Collections found')),
}));

// Mock config API functions.
jest.mock('../src/app/services/configApi', () => ({
  getConfig: jest.fn(() =>
    Promise.resolve({
      endpoint: 'https://default-api-endpoint.com',
      language: 'en',
    })
  ),
  saveConfig: jest.fn(() => Promise.resolve()),
}));

// Correctly mock SweetAlert2 as a class whose static fire method is a Jest mock.
jest.mock('sweetalert2', () => {
  const fireMock = jest.fn();
  return class SweetAlert2 {
    static fire = fireMock;
  };
});

// Ensure the clipboard API exists.
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// --- Helper ---
// We wrap the render in act and then await a short timeout to flush pending effects.
const renderSettingsPanel = async (refreshDatasets = jest.fn()) => {
  const result = render(
    <MapProvider>
      <SettingsPanel refreshDatasets={refreshDatasets} />
    </MapProvider>
  );
  // Flush pending useEffect updates.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return result;
};

// --- Tests ---
describe('SettingsPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the three dropdown buttons (settings, language, reset)', async () => {
    await renderSettingsPanel();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  describe('Settings Dropdown', () => {
    it('opens the settings dropdown and shows the API endpoint with a copy button', async () => {
      await renderSettingsPanel();
      const settingsButton = screen.getByRole('button', { name: /settings/i });

      // Open the settings dropdown.
      await act(async () => {
        fireEvent.click(settingsButton);
      });
      expect(settingsButton).toHaveClass('active');

      // Verify the API endpoint label and input.
      const endpointLabel = await screen.findByText('api_endpoint:');
      expect(endpointLabel).toBeInTheDocument();
      const inputField = screen.getByLabelText('api_endpoint:') as HTMLInputElement;
      expect(inputField).toHaveValue('https://default-api-endpoint.com');

      // Verify the copy button exists.
      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeInTheDocument();
    });

    it('copies the API endpoint to clipboard when the copy button is clicked', async () => {
      await renderSettingsPanel();
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await act(async () => {
        fireEvent.click(settingsButton);
      });
      const copyButton = await screen.findByRole('button', { name: /copy/i });
      await act(async () => {
        fireEvent.click(copyButton);
      });
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://default-api-endpoint.com'
        );
      });
      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalledWith('copied_to_clipboard');
    });
  });

  describe('Language Dropdown', () => {
    it('opens the language dropdown and allows selecting a language', async () => {
      await renderSettingsPanel();
      const languageButton = screen.getByRole('button', { name: /language/i });
      await act(async () => {
        fireEvent.click(languageButton);
      });
      expect(languageButton).toHaveClass('active');

      // Verify language options.
      const englishOption = screen.getByText('english');
      const frenchOption = screen.getByText('french');
      expect(englishOption).toBeInTheDocument();
      expect(frenchOption).toBeInTheDocument();

      // Select French.
      await act(async () => {
        fireEvent.click(frenchOption);
      });
      expect(localStorage.getItem('language')).toBe('fr');

      // Re-open dropdown and select English.
      await act(async () => {
        fireEvent.click(languageButton);
      });
      const newEnglishOption = screen.getByText('english');
      await act(async () => {
        fireEvent.click(newEnglishOption);
      });
      expect(localStorage.getItem('language')).toBe('en');
    });
  });

  describe('Reset Dropdown', () => {
    it('opens and closes the reset dropdown', async () => {
      await renderSettingsPanel();
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await act(async () => {
        fireEvent.click(resetButton);
      });
      expect(resetButton).toHaveClass('active');
      const resetOption = screen.getByText('reset');
      const factoryResetOption = screen.getByText('factory_reset');
      expect(resetOption).toBeInTheDocument();
      expect(factoryResetOption).toBeInTheDocument();
      // Close dropdown.
      await act(async () => {
        fireEvent.click(resetButton);
      });
      expect(resetButton).not.toHaveClass('active');
    });

    it('triggers handleReset when the reset option is clicked', async () => {
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
      await renderSettingsPanel();
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await act(async () => {
        fireEvent.click(resetButton);
      });
      const resetOption = screen.getByText('reset');
      await act(async () => {
        fireEvent.click(resetOption);
      });
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'reset',
            text: 'confirm_reset_properties',
            icon: 'warning',
          })
        );
      });
      // After confirmation, localStorage is reset.
      expect(localStorage.getItem('language')).toBe('en');
      expect(localStorage.getItem('playbackSpeed')).toBe('1');
      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalledWith('reset_completed');
    });

    it('triggers factory reset when the factory_reset option is clicked', async () => {
      const Swal = require('sweetalert2');
      // Simulate two Swal modals:
      // 1. Confirmation of factory reset.
      // 2. Prompt for new endpoint.
      Swal.fire
        .mockResolvedValueOnce({ isConfirmed: true })
        .mockResolvedValueOnce({ isConfirmed: true, value: 'https://new-api-endpoint.com' });

      await renderSettingsPanel();
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await act(async () => {
        fireEvent.click(resetButton);
      });
      const factoryResetOption = screen.getByText('factory_reset');
      await act(async () => {
        fireEvent.click(factoryResetOption);
      });
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledTimes(2);
      });
      const { resetCollections, fetchCollectionsFromEndpoint } = require('../src/app/services/api');
      expect(resetCollections).toHaveBeenCalled();
      expect(fetchCollectionsFromEndpoint).toHaveBeenCalledWith('https://new-api-endpoint.com');
      const { toast } = require('react-toastify');
      // The component calls toast.success with the value returned by fetchCollectionsFromEndpoint
      // and then again with "api_endpoint_saved".
      expect(toast.success).toHaveBeenCalledWith('Endpoint saved');
      expect(toast.success).toHaveBeenCalledWith('api_endpoint_saved');
    });
  });

  describe('Dropdown Closing Behavior', () => {
    it('closes an open dropdown when clicking outside', async () => {
      await renderSettingsPanel();
      const languageButton = screen.getByRole('button', { name: /language/i });
      await act(async () => {
        fireEvent.click(languageButton);
      });
      expect(languageButton).toHaveClass('active');
      await act(async () => {
        fireEvent.mouseDown(document.body);
      });
      await waitFor(() => {
        expect(languageButton).not.toHaveClass('active');
      });
    });

    it('does not close the dropdown when clicking inside it', async () => {
      await renderSettingsPanel();
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await act(async () => {
        fireEvent.click(settingsButton);
      });
      expect(settingsButton).toHaveClass('active');
      const dropdownContent = screen.getByText('api_endpoint:').closest('.dropdown-content');
      await act(async () => {
        fireEvent.mouseDown(dropdownContent!);
      });
      expect(settingsButton).toHaveClass('active');
    });
  });

  describe('Language Initialization and Config Loading', () => {
    it('initializes language from localStorage and shows a toast on mount', async () => {
      localStorage.setItem('language', 'fr');
      await renderSettingsPanel();
      await waitFor(() => {
        const { toast } = require('react-toastify');
        expect(toast.success).toHaveBeenCalledWith('language_retrieved');
      });
      expect(localStorage.getItem('language')).toBe('fr');
    });

    it('loads the API endpoint from config on mount', async () => {
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValueOnce({
        endpoint: 'https://custom-endpoint.com',
        language: 'en',
      });
      await renderSettingsPanel();
      const settingsButton = await screen.findByRole('button', { name: /settings/i });
      await act(async () => {
        fireEvent.click(settingsButton);
      });
      const inputField = (await screen.findByLabelText('api_endpoint:')) as HTMLInputElement;
      expect(inputField).toHaveValue('https://default-api-endpoint.com');
    });

    it('prompts for a new endpoint when no valid endpoint is saved', async () => {
      const { getConfig, saveConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValueOnce({
        endpoint: 'No endpoint saved',
        language: 'en',
      });
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
      const refreshDatasets = jest.fn();
      await act(async () => {
        await renderSettingsPanel(refreshDatasets);
      });
      await waitFor(() => {
        expect(getConfig).toHaveBeenCalled();
        expect(saveConfig).toHaveBeenCalled();
        expect(refreshDatasets).toHaveBeenCalled();
      });
    });
  });

  describe('Offline Behavior', () =>{
    it('Internet button is not visible when online', () => {
      const OnlineComponent = () => {
        const { setIsOnline } = useMapLayerContext(); 
        setIsOnline(true);
        return <></>
      };
  
      const TestComponent = () => (
        <MapProvider>
          <SettingsPanel refreshDatasets={jest.fn} setMetadataVisible={jest.fn}/>
          <OnlineComponent />
        </MapProvider>
      );
      
      render(<TestComponent />);
      expect(screen.queryByRole('button', { name: /internet/i })).not.toBeInTheDocument();
    });

    it('Internet button is visible when offline', () => {
      const OnlineComponent = () => {
        const { setIsOnline } = useMapLayerContext(); 
        setIsOnline(false);
        return <></>
      };
  
      const TestComponent = () => (
        <MapProvider>
          <SettingsPanel refreshDatasets={jest.fn} setMetadataVisible={jest.fn}/>
          <OnlineComponent />
        </MapProvider>
      );
      
      render(<TestComponent />);
      expect(screen.queryByRole('button', { name: /internet/i })).toBeInTheDocument();
    });

  });
});
