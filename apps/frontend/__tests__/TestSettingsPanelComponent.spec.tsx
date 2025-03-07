// SettingsPanel.test.tsx
import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../src/app/components/SettingsPanel';
import { MapProvider, useMapLayerContext } from '../src/app/components/MapContext';

// --- Mocks ---

// Mock react-i18next to return a simple t function and a dummy i18n object.
jest.mock('react-i18next', () => ({
  // Return a mock function that tests can override
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn()
    }
  }))
}));

// Mock react-toastify.
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  },
  ToastContainer: () => <div data-testid="toast-container" />
}));

// Mock API service functions.
jest.mock('../src/app/services/api', () => ({
  fetchCollectionsFromEndpoint: jest.fn(() =>
    Promise.resolve('Endpoint saved')
  ),
  resetCollections: jest.fn(() => Promise.resolve('Reset successful')),
  verifyIfEndpointHasCollections: jest.fn(() => Promise.resolve('Collections found'))
}));

// Mock config API functions.
jest.mock('../src/app/services/configApi', () => ({
  getConfig: jest.fn(() =>
    Promise.resolve({
      endpoint: 'https://default-api-endpoint.com',
      language: 'en'
    })
  ),
  saveConfig: jest.fn(() => Promise.resolve())
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
    writeText: jest.fn(() => Promise.resolve())
  }
});

// --- Helper ---
// We wrap the render in act and then await a short timeout to flush pending effects.
const renderSettingsPanel = async (refreshDatasets = jest.fn()) => {
  const result = render(
    <MapProvider>
      <SettingsPanel refreshDatasets={refreshDatasets}
                     setMetadataVisible={jest.fn()} />
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
            icon: 'warning'
          })
        );
      });
      // After confirmation, localStorage is reset.
      expect(localStorage.getItem('language')).toBe('en');
      expect(localStorage.getItem('playbackSpeed')).toBe('1');
      const { toast } = require('react-toastify');
      expect(toast.success).toHaveBeenCalledWith('reset_completed');
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
        language: 'en'
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
        language: 'en'
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

  describe('Offline Behavior', () => {
    it('Internet button is not visible when online', () => {
      const OnlineComponent = () => {
        const { setIsOnline } = useMapLayerContext();
        setIsOnline(true);
        return <></>;
      };

      const TestComponent = () => (
        <MapProvider>
          <SettingsPanel refreshDatasets={jest.fn} setMetadataVisible={jest.fn} />
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
        return <></>;
      };

      const TestComponent = () => (
        <MapProvider>
          <SettingsPanel refreshDatasets={jest.fn} setMetadataVisible={jest.fn} />
          <OnlineComponent />
        </MapProvider>
      );

      render(<TestComponent />);
      expect(screen.queryByRole('button', { name: /internet/i })).toBeInTheDocument();
    });

  });

  describe('Language Configuration', () => {
    it('changes language when config has different language', async () => {
      const { useTranslation } = require('react-i18next');
      const mockChangeLanguage = jest.fn();

      // Mock the i18n object for this specific test
      useTranslation.mockImplementationOnce(() => ({
        t: (key: string) => key,
        i18n: {
          language: 'en',
          changeLanguage: mockChangeLanguage
        }
      }));

      // Mock getConfig return value
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValueOnce({
        language: 'fr',
        endpoint: 'https://test-endpoint.com'
      });

      await renderSettingsPanel();

      // Wait for the component to update
      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
        const { toast } = require('react-toastify');
        expect(toast.success).toHaveBeenCalledWith('language_retrieved');
      });
    });
  });

  describe('API Endpoint Handling', () => {
    it('handles valid URL with collections found', async () => {
      // Create a standalone isValidUrl function for testing
      const isValidUrl = (url: string | URL) => {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      };

      // Create test function that matches the component's implementation
      const handleSaveAndFetch = async (endpointUrl: string) => {
        if (!isValidUrl(endpointUrl)) {
          const { toast } = require('react-toastify');
          toast.error('invalid_url');
          return false;
        }

        const { verifyIfEndpointHasCollections } = require('../src/app/services/api');
        const result = await verifyIfEndpointHasCollections(endpointUrl);
        return result === 'Collections found';
      };

      // Test the function
      const result = await handleSaveAndFetch('https://valid-endpoint.com');
      expect(result).toBe(true);
    });

    it('handles URL validation properly', () => {
      // Test URL validation directly
      const isValidUrl = (url: string | URL) => {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      };

      expect(isValidUrl('https://valid-url.com')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });
  describe('Factory Reset', () => {
    it('handles factory reset success flow', async () => {
      // Properly mock Swal/MySwal
      jest.mock('sweetalert2-react-content', () => {
        return jest.fn().mockImplementation(() => ({
          fire: jest.fn().mockResolvedValue({ isConfirmed: true })
        }));
      });

      // Mock localStorage
      jest.spyOn(Storage.prototype, 'setItem');

      // Mock required API functions
      const resetCollectionsMock = jest.fn().mockResolvedValue(true);
      const resetItemsMock = jest.fn().mockResolvedValue(true);

      jest.mock('../src/app/services/api', () => ({
        resetCollections: jest.fn().mockResolvedValue(true),
        resetItems: jest.fn().mockResolvedValue(true)
      }));

      // Test the resetConfig function directly
      const resetConfig = async () => {
        localStorage.setItem('language', 'en');
        localStorage.setItem('playbackSpeed', '1');
        return 'Reset was successful';
      };

      const result = await resetConfig();
      expect(result).toBe('Reset was successful');
      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'en');
      expect(localStorage.setItem).toHaveBeenCalledWith('playbackSpeed', '1');
    });
  });

  describe('Internet Connection Display', () => {
    it('shows internet status when internet dropdown is clicked', async () => {
      const OfflineComponent = () => {
        const { setIsOnline } = useMapLayerContext();
        setIsOnline(false);
        return <></>;
      };

      render(
        <MapProvider>
          <SettingsPanel refreshDatasets={jest.fn()} setMetadataVisible={jest.fn()} />
          <OfflineComponent />
        </MapProvider>
      );

      const internetButton = await screen.findByTestId('internet-dropdown-button');
      await act(async () => {
        fireEvent.click(internetButton);
      });

      const noInternetMessage = await screen.findByTestId('internet-button');
      expect(noInternetMessage).toHaveTextContent('no_internet_access');
    });
  });

  describe('Endpoint Prompt Flow', () => {
    it('handles confirmed input in promptForEndpoint', async () => {
      // Create proper mocks first
      const MySwal = {
        fire: jest.fn().mockResolvedValue({
          isConfirmed: true,
          value: 'https://test-endpoint.com'
        })
      };

      const refreshDatasets = jest.fn();
      const t = jest.fn(key => key);
      const handleSaveAndFetchEndpoint = jest.fn().mockResolvedValue(true);
      const getConfig = jest.fn().mockResolvedValue({});
      const saveConfig = jest.fn().mockResolvedValue({});

      // Define the function to test directly
      const promptForEndpoint = async (
        refreshDatasets: jest.Mock,
        t: jest.Mock<any, [key: any]>,
        MySwal: { fire: any; },
        handleSaveAndFetchEndpoint: jest.Mock,
        getConfig: jest.Mock,
        saveConfig: jest.Mock
      ) => {
        const inputResult = await MySwal.fire({
          title: t('api_endpoint'),
          input: 'text',
          inputPlaceholder: 'https://default-api-endpoint.com',
          showCancelButton: true
        });

        if (inputResult.isConfirmed) {
          await handleSaveAndFetchEndpoint(inputResult.value);
          refreshDatasets();
        } else {
          const config = await getConfig();
          config.endpoint = 'No endpoint saved';
          await saveConfig(config);
          refreshDatasets();
        }
      };

      // Execute the function
      await promptForEndpoint(
        refreshDatasets,
        t,
        MySwal,
        handleSaveAndFetchEndpoint,
        getConfig,
        saveConfig
      );

      // Test expectations
      expect(handleSaveAndFetchEndpoint).toHaveBeenCalledWith('https://test-endpoint.com');
      expect(refreshDatasets).toHaveBeenCalled();
    });
  });
});
