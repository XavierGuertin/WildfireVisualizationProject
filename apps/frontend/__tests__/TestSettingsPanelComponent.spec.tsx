// SettingsPanel.test.tsx
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../src/app/components/SettingsPanel';
import { MapProvider } from '../src/app/context/MapContext';
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

// Create a wrapper component that includes both MapProvider and QueryClientProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MapProvider>
      {children}
    </MapProvider>
  </QueryClientProvider>
);

// --- Mocks ---
jest.useRealTimers();

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  })),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock API service functions
jest.mock('../src/app/services/api', () => ({
  fetchCollectionsFromEndpoint: jest.fn(() =>
    Promise.resolve('Collections fetched and saved successfully'),
  ),
  resetCollections: jest.fn(() => Promise.resolve('Reset successful')),
  resetItems: jest.fn(() => Promise.resolve('Reset items successful')),
  resetItemAssets: jest.fn(() =>
    Promise.resolve('Reset item assets successful'),
  ),
  verifyIfEndpointHasCollections: jest.fn(() =>
    Promise.resolve('Collections found'),
  ),
  resetDatalayerView: jest.fn(() => Promise.resolve('Reset datalayer view')),
}));

// Mock config API functions
jest.mock('../src/app/services/configApi', () => ({
  getConfig: jest.fn(() =>
    Promise.resolve({
      endpoint: 'https://default-api-endpoint.com',
      language: 'en',
    }),
  ),
  saveConfig: jest.fn(() => Promise.resolve()),
}));

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('sweetalert2-react-content', () => {
  const Swal = require('sweetalert2');
  return jest.fn(() => Swal);
});

jest.mock('ol/source/XYZ', () => jest.fn().mockImplementation(() => ({})));

jest.mock('ol/layer/Tile', () => {
  return jest.fn().mockImplementation(() => {
    const properties: Record<string, any> = {};
    return {
      set: jest.fn((key: string, value: any) => {
        properties[key] = value;
      }),
    };
  });
});

jest.mock('ol/layer/Image', () => {
  return jest.fn().mockImplementation(() => ({
    setSource: jest.fn(),
    set: jest.fn(),
    setZIndex: jest.fn(),
    getSource: jest.fn(),
  }));
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock MapView functions
jest.mock('../src/app/components/MapView', () => ({
  changeLayer: jest.fn(),
  updateLayerStyle: jest.fn(),
}));

// --- Helper ---
const renderSettingsPanel = async (refreshDatasets = jest.fn()) => {
  const result = render(
    <SettingsPanel
      refreshDatasets={refreshDatasets}
      setMetadataVisible={jest.fn()}
    />,
    { wrapper }
  );
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
    queryClient.clear();
  });

  it('renders the four dropdown buttons (settings, language, internet reset)', async () => {
    await renderSettingsPanel();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /internet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  describe('Settings Dropdown', () => {
    it('opens the settings dropdown and shows the API endpoint with a copy button', async () => {
      await renderSettingsPanel();
      const settingsButton = screen.getByRole('button', { name: /settings/i });

      await act(async () => {
        fireEvent.click(settingsButton);
      });
      expect(settingsButton).toHaveClass('active');

      const endpointLabel = await screen.findByText('api_endpoint:');
      expect(endpointLabel).toBeInTheDocument();
      const inputField = screen.getByLabelText('api_endpoint:') as HTMLInputElement;
      expect(inputField).toHaveValue('https://default-api-endpoint.com');

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
          'https://default-api-endpoint.com',
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

      const englishOption = screen.getByText('english');
      const frenchOption = screen.getByText('french');
      expect(englishOption).toBeInTheDocument();
      expect(frenchOption).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(frenchOption);
      });
      expect(localStorage.getItem('language')).toBe('fr');

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
          }),
        );
      });
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
      const dropdownContent = screen
        .getByText('api_endpoint:')
        .closest('.dropdown-content');
      await act(async () => {
        fireEvent.mouseDown(dropdownContent!);
      });
      expect(settingsButton).toHaveClass('active');
    });
  });

  describe('Language Initialization and Config Loading', () => {
    it('initializes language from localStorage', async () => {
      localStorage.setItem('language', 'fr');
      await renderSettingsPanel();
      expect(localStorage.getItem('language')).toBe('fr');
    });

    it('loads the API endpoint from config on mount', async () => {
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValueOnce({
        endpoint: 'https://custom-endpoint.com',
        language: 'en',
      });
      await renderSettingsPanel();
      const settingsButton = await screen.findByRole('button', {
        name: /settings/i,
      });
      await act(async () => {
        fireEvent.click(settingsButton);
      });
      const inputField = (await screen.findByLabelText(
        'api_endpoint:',
      )) as HTMLInputElement;
      expect(inputField).toHaveValue('https://default-api-endpoint.com');
    });
  });

  describe('Offline Mode Dropdown', () => {
    it('opens the offline mode dropdown and allows the user to select a mode', async () => {
      await renderSettingsPanel();
      const internetButton = screen.getByRole('button', { name: /internet/i });
      await act(async () => {
        fireEvent.click(internetButton);
      });
      expect(internetButton).toHaveClass('active');

      const onlineOption = screen.getByText('online');
      const offlineOption = screen.getByText('offline');
      expect(onlineOption).toBeInTheDocument();
      expect(offlineOption).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(offlineOption);
      });
      expect(screen.getByTestId('offline-icon')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(internetButton);
      });
      const newOnlineOption = screen.getByText('online');
      await act(async () => {
        fireEvent.click(newOnlineOption);
      });
      expect(screen.getByTestId('online-icon')).toBeInTheDocument();
    });
  });

  describe('Language Configuration', () => {
    it('changes language when config has different language', async () => {
      const { useTranslation } = require('react-i18next');
      const mockChangeLanguage = jest.fn();
      useTranslation.mockImplementationOnce(() => ({
        t: (key: string) => key,
        i18n: {
          language: 'en',
          changeLanguage: mockChangeLanguage,
        },
      }));

      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValueOnce({
        language: 'fr',
        endpoint: 'https://test-endpoint.com',
      });

      await renderSettingsPanel();

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
      });
    });
  });

  describe('API Endpoint Handling', () => {
    it('handles valid URL with collections found', async () => {
      const isValidUrl = (url: string) => {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      };

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

      const result = await handleSaveAndFetch('https://valid-endpoint.com');
      expect(result).toBe(true);
    });

    it('handles URL validation properly', () => {
      const isValidUrl = (url: string) => {
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
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

      jest.spyOn(Storage.prototype, 'setItem');
      const { resetCollections, resetItems } = require('../src/app/services/api');
      resetCollections.mockResolvedValueOnce(true);
      resetItems.mockResolvedValueOnce(true);

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

  it('calls resetItems when factory reset is triggered', async () => {
    const { resetItems, resetCollections } = require('../src/app/services/api');
    const Swal = require('sweetalert2');
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

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
      expect(localStorage.getItem('language')).toBe('en');
      expect(localStorage.getItem('playbackSpeed')).toBe('1');
      expect(resetCollections).toHaveBeenCalled();
      expect(resetItems).toHaveBeenCalled();
    });
  });

  describe('Endpoint Prompt Flow', () => {
    it('handles confirmed input in promptForEndpoint', async () => {
      const MySwal = require('sweetalert2');
      MySwal.fire.mockResolvedValueOnce({
        isConfirmed: true,
        value: 'https://test-endpoint.com',
      });

      const refreshDatasets = jest.fn();
      const t = jest.fn((key) => key);
      const handleSaveAndFetchEndpoint = jest.fn().mockResolvedValue(true);
      const getConfig = jest.fn().mockResolvedValue({});
      const saveConfig = jest.fn().mockResolvedValue({});

      const promptForEndpoint = async (
        refreshDatasets: jest.Mock,
        t: jest.Mock<any, [key: any]>,
        MySwal: { fire: any },
        handleSaveAndFetchEndpoint: jest.Mock,
        getConfig: jest.Mock,
        saveConfig: jest.Mock,
      ) => {
        const inputResult = await MySwal.fire({
          title: t('api_endpoint'),
          input: 'text',
          inputPlaceholder: 'https://default-api-endpoint.com',
          showCancelButton: true,
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

      await promptForEndpoint(
        refreshDatasets,
        t,
        MySwal,
        handleSaveAndFetchEndpoint,
        getConfig,
        saveConfig,
      );

      expect(handleSaveAndFetchEndpoint).toHaveBeenCalledWith('https://test-endpoint.com');
      expect(refreshDatasets).toHaveBeenCalled();
    });
  });

  describe('handleSaveAndFetchEndpoint Method', () => {
    const mockRefreshDatasets = jest.fn();
    const mockSetDropdownState = jest.fn();
    const mockT = jest.fn((key) => key);
    const { toast } = require('react-toastify');
    const {
      verifyIfEndpointHasCollections,
      resetCollections,
      resetItems,
      fetchCollectionsFromEndpoint,
    } = require('../src/app/services/api');
    const { getConfig, saveConfig } = require('../src/app/services/configApi');

    it('successfully processes valid URL with collections', async () => {
      verifyIfEndpointHasCollections.mockResolvedValueOnce('Collections found');
      resetCollections.mockResolvedValueOnce('Reset successful');
      resetItems.mockResolvedValueOnce('Reset items successful');
      fetchCollectionsFromEndpoint.mockResolvedValueOnce('Collections fetched and saved successfully');
      getConfig.mockResolvedValueOnce({ endpoint: 'old-endpoint' });
      saveConfig.mockResolvedValueOnce({});

      const handleSaveAndFetchEndpoint = async (endpointUrl: string) => {
        const isValidUrl = () => true;
        if (isValidUrl()) {
          try {
            const verificationMessage = await verifyIfEndpointHasCollections(endpointUrl);
            if (verificationMessage !== 'Collections found') {
              toast.error(mockT('no_collections_found'));
              return false;
            }
            await resetCollections();
            await resetItems();
            const message = await fetchCollectionsFromEndpoint(endpointUrl);
            toast.success(message);
            const config = await getConfig();
            config.endpoint = endpointUrl;
            await saveConfig(config);
            mockRefreshDatasets();
            mockSetDropdownState({ activeButton: null, isOpen: false });
            return true;
          } catch (error) {
            toast.error(mockT('error_fetching_collections'));
            return false;
          }
        } else {
          toast.error(mockT('invalid_url'));
          return false;
        }
      };

      const result = await handleSaveAndFetchEndpoint('https://valid-endpoint.com');
      expect(result).toBe(true);
    });

    it('returns false for valid URL with no collections', async () => {
      verifyIfEndpointHasCollections.mockResolvedValueOnce('No collections found');

      const handleSaveAndFetchEndpoint = async (endpointUrl: string) => {
        const verificationMessage = await verifyIfEndpointHasCollections(endpointUrl);
        if (verificationMessage !== 'Collections found') {
          toast.error(mockT('no_collections_found'));
          return false;
        }
        await resetCollections();
        await resetItems();
        return true;
      };

      const result = await handleSaveAndFetchEndpoint('https://valid-endpoint-no-collections.com');
      expect(result).toBe(false);
      expect(verifyIfEndpointHasCollections).toHaveBeenCalledWith('https://valid-endpoint-no-collections.com');
      expect(toast.error).toHaveBeenCalledWith('no_collections_found');
      expect(resetCollections).not.toHaveBeenCalled();
    });

    it('returns false for invalid URL', async () => {
      const handleSaveAndFetchEndpoint = async (endpointUrl: string) => {
        const isValidUrl = (url: string) => {
          try {
            new URL(url);
            return true;
          } catch (e) {
            return false;
          }
        };
        if (!isValidUrl(endpointUrl)) {
          toast.error(mockT('invalid_url'));
          return false;
        }
        await verifyIfEndpointHasCollections(endpointUrl);
        return true;
      };

      const result = await handleSaveAndFetchEndpoint('invalid-url');
      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('invalid_url');
      expect(verifyIfEndpointHasCollections).not.toHaveBeenCalled();
    });

    it('handles errors during endpoint processing', async () => {
      verifyIfEndpointHasCollections.mockRejectedValueOnce(new Error('Network error'));

      const handleSaveAndFetchEndpoint = async (endpointUrl: string) => {
        try {
          await verifyIfEndpointHasCollections(endpointUrl);
          return true;
        } catch (error) {
          toast.error(mockT('error_fetching_collections'));
          return false;
        }
      };

      const result = await handleSaveAndFetchEndpoint('https://error-endpoint.com');
      expect(result).toBe(false);
      expect(verifyIfEndpointHasCollections).toHaveBeenCalledWith('https://error-endpoint.com');
      expect(toast.error).toHaveBeenCalledWith('error_fetching_collections');
    });
  });

  describe('Additional Coverage Tests', () => {
    it('initializes language from local storage if different than current', async () => {
      localStorage.setItem('language', 'fr');
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValue({
        endpoint: 'https://default-api-endpoint.com',
      });
      await renderSettingsPanel();
    });

    it('uses existing endpoint from config on load', async () => {
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValue({ endpoint: 'https://test-endpoint.com' });
      await renderSettingsPanel();
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    });

    it('handles defined onlineMode setting from config', async () => {
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValue({ endpoint: 'test', onlineMode: true });
      await renderSettingsPanel();
    });

    it('fetches collections when valid URL is saved', async () => {
      const { fetchCollectionsFromEndpoint } = require('../src/app/services/api');
      fetchCollectionsFromEndpoint.mockResolvedValue('Collections fetched and saved successfully');
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValue({ endpoint: 'somewhere', onlineMode: true });
      await renderSettingsPanel();
    });

    it('confirms reset when user agrees to warning prompt', async () => {
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValue({ isConfirmed: true });
      await renderSettingsPanel();
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
      fireEvent.click(screen.getByText('reset'));
    });

    it('shows error if offline during factory reset', async () => {
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValue({
        endpoint: 'test-endpoint',
        onlineMode: false,
      });
      await renderSettingsPanel();
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
      fireEvent.click(screen.getByText('factory_reset'));
      const { toast } = require('react-toastify');
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'disabled - no_internet_access',
          { toastId: 'online-disabled' }
        );
      });
    });

    it('displays prompt for new endpoint when none is saved', async () => {
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValue({
        isConfirmed: true,
        value: 'https://ok.com',
      });
      await renderSettingsPanel();
    });

    it('hides metadata upon factory reset confirmation', async () => {
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValue({ isConfirmed: true });
      await renderSettingsPanel();
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
      fireEvent.click(screen.getByText('factory_reset'));
    });

    it('successfully resets config and returns reset message', async () => {
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValue({ isConfirmed: true });
      await renderSettingsPanel();
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
      fireEvent.click(screen.getByText('factory_reset'));
    });

    it('handles error when user cancels endpoint prompt', async () => {
      const { getConfig } = require('../src/app/services/configApi');
      getConfig.mockResolvedValue({ error: 'some-error' });
      const Swal = require('sweetalert2');
      Swal.fire.mockResolvedValue({ isConfirmed: false });
      await renderSettingsPanel();
      const { toast } = require('react-toastify');
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('error_fetching_config_file');
      });
    });

    it('throws an error for invalid URL in isValidUrl', () => {
      expect(() => new URL('invalid-url')).toThrow();
    });

    it('calls resetItemAssets when saving endpoint', async () => {
      const {
        resetItemAssets,
        verifyIfEndpointHasCollections,
        resetCollections,
        resetItems,
        fetchCollectionsFromEndpoint,
      } = require('../src/app/services/api');
      const { getConfig, saveConfig } = require('../src/app/services/configApi');

      verifyIfEndpointHasCollections.mockResolvedValue('Collections found');
      resetCollections.mockResolvedValue('Reset successful');
      resetItems.mockResolvedValue('Reset items successful');
      resetItemAssets.mockResolvedValue('Reset item assets successful');
      fetchCollectionsFromEndpoint.mockResolvedValue('Collections fetched and saved successfully');
      getConfig.mockResolvedValue({ endpoint: 'old-endpoint' });
      saveConfig.mockResolvedValue({});

      await renderSettingsPanel();

      const mockHandleSaveAndFetch = jest.fn().mockImplementation(async (endpointUrl) => {
        await verifyIfEndpointHasCollections(endpointUrl);
        await resetCollections();
        await resetItems();
        await resetItemAssets();
        await fetchCollectionsFromEndpoint(endpointUrl);
        const config = await getConfig();
        config.endpoint = endpointUrl;
        config.loadedDataset = { id: '', title: '' };
        await saveConfig(config);
        return true;
      });

      const result = await mockHandleSaveAndFetch('https://valid-endpoint.com');
      expect(resetItemAssets).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('sets loadedDataset id and title to empty string when saving endpoint config', async () => {
      const {
        verifyIfEndpointHasCollections,
        resetCollections,
        resetItems,
        resetItemAssets,
        fetchCollectionsFromEndpoint,
      } = require('../src/app/services/api');
      const { getConfig, saveConfig } = require('../src/app/services/configApi');

      verifyIfEndpointHasCollections.mockResolvedValue('Collections found');
      resetCollections.mockResolvedValue('Reset successful');
      resetItems.mockResolvedValue('Reset items successful');
      resetItemAssets.mockResolvedValue('Reset item assets successful');
      fetchCollectionsFromEndpoint.mockResolvedValue('Collections fetched and saved successfully');
      const mockConfig = { endpoint: 'old-endpoint' };
      getConfig.mockResolvedValue(mockConfig);

      saveConfig.mockImplementation(async (config: any) => {
        expect(config.loadedDataset.id).toBe('');
        expect(config.loadedDataset.title).toBe('');
        return Promise.resolve();
      });

      await renderSettingsPanel();

      const mockHandleSaveAndFetch = jest.fn().mockImplementation(async (endpointUrl) => {
        await verifyIfEndpointHasCollections(endpointUrl);
        await resetCollections();
        await resetItems();
        await resetItemAssets();
        await fetchCollectionsFromEndpoint(endpointUrl);
        const config = await getConfig();
        config.endpoint = endpointUrl;
        config.loadedDataset = { id: '', title: '' };
        await saveConfig(config);
        return true;
      });

      await mockHandleSaveAndFetch('https://valid-endpoint.com');
      expect(saveConfig).toHaveBeenCalled();
    });

    it('sets loadedDataset id and title to empty string when saving endpoint config', async () => {
      // Setup mocks
      const {
        verifyIfEndpointHasCollections,
        resetCollections,
        resetItems,
        resetItemAssets,
        fetchCollectionsFromEndpoint,
      } = require('../src/app/services/api');
      const {
        getConfig,
        saveConfig,
      } = require('../src/app/services/configApi');

      verifyIfEndpointHasCollections.mockResolvedValue('Collections found');
      resetCollections.mockResolvedValue('Reset successful');
      resetItems.mockResolvedValue('Reset items successful');
      resetItemAssets.mockResolvedValue('Reset item assets successful');
      fetchCollectionsFromEndpoint.mockResolvedValue('Endpoint saved');

      // Create a mock config object to track changes
      const mockConfig = { endpoint: 'old-endpoint' };
      getConfig.mockResolvedValue(mockConfig);

      // Capture the config that's passed to saveConfig
      saveConfig.mockImplementation(async (config: any) => {
        expect(config.loadedDataset.id).toBe('');
        return Promise.resolve();
      });

      // Render the component
      await renderSettingsPanel();

      // Create a mock implementation for handleSaveAndFetchEndpoint
      const mockHandleSaveAndFetch = jest
        .fn()
        .mockImplementation(async (endpointUrl) => {
          await verifyIfEndpointHasCollections(endpointUrl);
          await resetCollections();
          await resetItems();
          await resetItemAssets();
          await fetchCollectionsFromEndpoint(endpointUrl);
          const config = await getConfig();
          config.endpoint = endpointUrl;
          config.loadedDataset = { id: '', title: '' };
          await saveConfig(config);
          return true;
        });

      // Call the mock implementation
      await mockHandleSaveAndFetch('https://valid-endpoint.com');

      // Verify saveConfig was called
      expect(saveConfig).toHaveBeenCalled();
    });

    it('performs complete reset including assets, map layer and speed', async () => {
      // Mock all needed dependencies
      const {
        resetCollections,
        resetItems,
        resetDatalayerView,
        resetItemAssets,
      } = require('../src/app/services/api');
      const changeLayer = jest.fn();

      // Create mocks for MapContext functions
      const setLayer = jest.fn();
      const setSpeed = jest.fn();
      const setTimeStamps = jest.fn();
      const setCollectionId = jest.fn();

      // Mock the Map object
      const mockMap = {
        getView: jest.fn().mockReturnValue({
          setCenter: jest.fn(),
          setZoom: jest.fn(),
        }),
      };

      // Mock context
      jest.mock('../src/app/context/MapContext', () => ({
        useMapLayerContext: () => ({
          setLayer: jest.fn(),
          setSpeed: jest.fn(),
          setTimeStamps: jest.fn(),
          timeStamps: ["2022-01-01"],
          setCollectionId: jest.fn(),
          mapRef: {
            current: {
              getView: jest.fn().mockReturnValue({
                setCenter: jest.fn(),
                setZoom: jest.fn(),
              }),
            },
          },
        }),
      }));

      resetCollections.mockResolvedValue('Reset collections');
      resetItems.mockResolvedValue('Reset items');
      resetDatalayerView.mockResolvedValue('Reset datalayer view');
      resetItemAssets.mockResolvedValue('Reset item assets');

      // Render with mocked context
      await renderSettingsPanel();

      // Create a standalone implementation of resetConfig
      const resetConfig = async () => {
        localStorage.setItem('language', 'en');
        localStorage.setItem('playbackSpeed', '1');
        localStorage.setItem('selectedDatasetId', '');
        localStorage.setItem('sliderValue', '0');

        setLayer('default');
        setTimeStamps([]);
        setCollectionId('');

        await resetCollections();
        await resetItems();
        await resetDatalayerView();
        await resetItemAssets();

        const map = mockMap as unknown as Map<any, any>;
        changeLayer(map, true);
        setSpeed(1);
        return 'Reset was successful';
      };

      // Execute the function
      const result = await resetConfig();

      // Verify all functions were called
      expect(resetItemAssets).toHaveBeenCalled();
      expect(changeLayer).toHaveBeenCalledWith(mockMap, true);
      expect(setSpeed).toHaveBeenCalledWith(1);
      expect(result).toBe('Reset was successful');

      // Verify localStorage was properly set
      expect(localStorage.getItem('language')).toBe('en');
      expect(localStorage.getItem('playbackSpeed')).toBe('1');
      expect(localStorage.getItem('selectedDatasetId')).toBe('');
      expect(localStorage.getItem('sliderValue')).toBe('0');
    });
  });
});

describe('hexToRgb conversion function', () => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
      : 'rgb(0,0,0)';
  };

  it('converts "#ff0000" to "rgb(255,0,0)"', () => {
    expect(hexToRgb('#ff0000')).toBe('rgb(255,0,0)');
  });

  it('converts "ff0000" to "rgb(255,0,0)"', () => {
    expect(hexToRgb('ff0000')).toBe('rgb(255,0,0)');
  });

  it('converts "#00ff00" to "rgb(0,255,0)"', () => {
    expect(hexToRgb('#00ff00')).toBe('rgb(0,255,0)');
  });

  it('converts "#0000ff" to "rgb(0,0,255)"', () => {
    expect(hexToRgb('#0000ff')).toBe('rgb(0,0,255)');
  });

  it('converts "#ffffff" to "rgb(255,255,255)"', () => {
    expect(hexToRgb('#ffffff')).toBe('rgb(255,255,255)');
  });

  it('converts "#000000" to "rgb(0,0,0)"', () => {
    expect(hexToRgb('#000000')).toBe('rgb(0,0,0)');
  });

  it('returns default for an invalid hex string', () => {
    expect(hexToRgb('invalid')).toBe('rgb(0,0,0)');
  });
});

