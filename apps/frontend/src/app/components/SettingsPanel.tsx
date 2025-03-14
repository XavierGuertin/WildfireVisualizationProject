import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/SettingsPanel.css';
import {
  IoCheckmark,
  IoCopyOutline,
  IoLanguage,
  IoSettingsOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { PiArrowClockwiseFill, PiGlobeXLight, PiGlobeLight } from 'react-icons/pi';
import {
  fetchCollectionsFromEndpoint,
  resetCollections,
  resetDatalayerView,
  resetItems,
  verifyIfEndpointHasCollections
} from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useMapLayerContext } from '../context/MapContext';
import { getConfig, saveConfig } from '../services/configApi';
import { changeLayer } from './MapView';
import { Map } from 'ol';

const MySwal = withReactContent(Swal);

const SettingsPanel: React.FC<{
  refreshDatasets: () => void;
  setMetadataVisible: (visible: boolean) => void;
}> = ({ refreshDatasets, setMetadataVisible }) => {
  const { t, i18n } = useTranslation();
  const [dropdownState, setDropdownState] = useState<{
    activeButton: string | null;
    isOpen: boolean;
  }>({ activeButton: null, isOpen: false });
  const { setLayer, setSpeed, resetView, isOnline, setIsOnline, setSliderValue, mapRef } = useMapLayerContext();
  const [newApiEndpoint, setNewApiEndpoint] = useState<string>(
    'https://default-api-endpoint.com',
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [languageInitialized, setLanguageInitialized] = useState(false);
  // Initialize language from local storage and handle toast messages
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      !languageInitialized
    ) {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        // If a language is saved in localStorage, use it
        if (savedLanguage !== i18n.language) {
          i18n.changeLanguage(savedLanguage); // Change language only if different from current one
        }
        toast.success(t('language_retrieved')); // Show success message if language is retrieved
      } else {
        // If no language is saved, use the default language
        localStorage.setItem('language', 'en');
        toast.info(t('default_language_retrieved')); // Show default language message
      }
      setLanguageInitialized(true); // Mark language initialization as done
    }
  }, [i18n, t, languageInitialized]);

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getConfig();
      if (config.endpoint) {
        setNewApiEndpoint(config.endpoint);
      }
      if (config.language && config.language !== i18n.language) {
        i18n.changeLanguage(config.language);
        toast.success(t('language_retrieved'));
      }
      setLanguageInitialized(true);

      if(config.onlineMode != undefined){
        setIsOnline(config.onlineMode);
      }

      // Check if endpoint is "No endpoint saved" and prompt user to enter a new one
      if (
        config.endpoint === 'No endpoint saved' ||
        config.endpoint === undefined
      ) {
        await promptForEndpoint(
          refreshDatasets,
          t,
          MySwal,
          handleSaveAndFetchEndpoint,
          getConfig,
          saveConfig,
        );
      }
    };
    fetchConfig();
  }, [i18n]);

  // Toggles dropdown state
  const toggleDropdown = async (buttonName: string) => {
    if (buttonName === 'settings') {
      const config = await getConfig();
      if (config.endpoint) {
        setNewApiEndpoint(config.endpoint);
      }
    }
    setDropdownState((prevState) => ({
      activeButton: prevState.activeButton === buttonName ? null : buttonName,
      isOpen: prevState.activeButton !== buttonName,
    }));
  };

  const handleSaveAndFetchEndpoint = async (
    endpointUrl: string,
  ): Promise<boolean> => {
    if (isValidUrl(endpointUrl)) {
      try {
        // Check if the URL retrieves collections
        const verificationMessage =
          await verifyIfEndpointHasCollections(endpointUrl);
        if (verificationMessage !== 'Collections found') {
          toast.error(t('no_collections_found'));
          return false;
        }

        // Reset collections before fetching new ones
        await resetCollections();
        await resetItems();

        const message = await fetchCollectionsFromEndpoint(endpointUrl);
        toast.success(message);

        // Save the new endpoint to config file
        const config = await getConfig();
        // If an error occurred during fetching config, show error and do not save changes
        if (config.error) {
          toast.error(t('error_fetching_config_file'));
          return false;
        }

        config.endpoint = endpointUrl;
        config.loadedDataset = "";
        await saveConfig(config);

        toast.success(t('api_endpoint_saved'));

        refreshDatasets(); // Trigger the refresh

        setDropdownState({ activeButton: null, isOpen: false });
        return true;
      } catch (error: any) {
        toast.error(t('error_fetching_collections'));
        return false;
      }
    } else {
      toast.error(t('invalid_url'));
      return false;
    }
  };

  const handleLanguageSelect = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleReset = async () => {
    MySwal.fire({
      title: t('reset'),
      text: t('confirm_reset_properties'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yes'),
      customClass: {
        popup: 'custom-swal-popup',
      },
    }).then(async (result: { isConfirmed: any }) => {
      if (result.isConfirmed) {
        // reset localStorage properties to default properties
        localStorage.setItem('language', 'en');
        localStorage.setItem('playbackSpeed', '1');
        localStorage.setItem('sliderValue', '0')
        setSliderValue(0)

        toast.success(t('reset_completed'));
      }
    });

    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleFactoryReset = async () => {
    if(!isOnline){
      toast.error(`${t('disabled')} - ${t('no_internet_access')}`, {
        toastId: 'online-disabled',
      });
      return;
    }

    MySwal.fire({
      title: t('factory_reset'),
      text: t('confirm_factory_reset_data_from_endpoint'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yes'),
      customClass: {
        popup: 'custom-swal-popup',
      },
    }).then(async (result: { isConfirmed: any }) => {
      if (result.isConfirmed) {
        resetView();
        try {
          await resetConfig();
          await promptForEndpoint(
            refreshDatasets,
            t,
            MySwal,
            handleSaveAndFetchEndpoint,
            getConfig,
            saveConfig,
          );
          setMetadataVisible(false); // Hide metadata container
        } catch (error: any) {
          toast.error(error.message);
        }
      }
    });

    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleSelectOnlineMode = async (onlineMode: boolean) => {
    setIsOnline(onlineMode);

    const config = await getConfig();
    // If an error occurred during fetching config, show error and do not save changes
    if (config.error) {
      toast.error(t('error_fetching_config_file'));
      return false;
    }
    config.onlineMode = onlineMode;
    await saveConfig(config);
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const resetConfig = async () => {
    try {
      localStorage.setItem('language', 'en');
      localStorage.setItem('playbackSpeed', '1');
      localStorage.setItem('selectedDatasetId','')
      localStorage.setItem('sliderValue', '0');
      setSliderValue(0);

      setLayer('default');
      await resetCollections();
      await resetItems();
      await resetDatalayerView();
      const map = mapRef.current as Map;
      changeLayer(map, true)
      setSpeed(1);
      return 'Reset was successful';
    } catch (error: any) {
      throw new Error(`Error resetting config: ${error.message}`);
    }
  };

  const promptForEndpoint = async (
    refreshDatasets: () => void,
    t: any,
    MySwal: any,
    handleSaveAndFetchEndpoint: any,
    getConfig: any,
    saveConfig: any,
  ) => {
    let success = false;
    while (!success) {
      const inputResult = await MySwal.fire({
        title: t('api_endpoint'),
        input: 'text',
        inputPlaceholder: 'https://default-api-endpoint.com',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        showCancelButton: true,
        confirmButtonText: t('save'),
        cancelButtonText: t('cancel'),
      });

      if (inputResult.isConfirmed) {
        success = await handleSaveAndFetchEndpoint(inputResult.value);
      } else {
        const config = await getConfig();
        // If an error occurred during fetching config, show error and do not save changes
        if (config.error) {
          toast.error(t('error_fetching_config_file'));
          break;
        }

        config.endpoint = 'No endpoint saved';
        config.loadedDataset = "";
        await saveConfig(config);

        refreshDatasets(); // Trigger the refresh
        break; // Exit the loop if the user cancels the input dialog
      }
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownState({ activeButton: null, isOpen: false });
      }
    };

    if (dropdownState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownState.isOpen]);

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getConfig();
      if (config.endpoint) {
        setNewApiEndpoint(config.endpoint);
      }
    };
    fetchConfig();
  }, [dropdownState.activeButton === 'settings']);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiEndpoint);
    toast.success(t('copied_to_clipboard'));
  };

  return (
    <div className="button-container" ref={dropdownRef}>
      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'settings' ? 'active' : ''}`}
          onClick={() => toggleDropdown('settings')}
          aria-expanded={dropdownState.activeButton === 'settings'}
          aria-label="settings"
        >
          <IoSettingsOutline size={32} />
        </button>
        {dropdownState.activeButton === 'settings' && (
          <div className="dropdown-content show">
            <div className="settings-prompt">
              <label htmlFor="api-endpoint-input">{t('api_endpoint')}:</label>
              <div className="settings-prompt-row">
                <input
                  id="api-endpoint-input"
                  type="text"
                  placeholder={t('enter_new_api_endpoint')}
                  value={newApiEndpoint}
                  disabled
                />
                <button onClick={copyToClipboard} aria-label="copy">
                  <IoCopyOutline size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'language' ? 'active' : ''}`}
          onClick={() => toggleDropdown('language')}
          aria-expanded={dropdownState.activeButton === 'language'}
          aria-label="language"
        >
          <IoLanguage size={32} />
        </button>
        {dropdownState.activeButton === 'language' && (
          <div className="dropdown-content show">
            <button onClick={() => handleLanguageSelect('en')}>
              {i18n.language === 'en' ? (
                <IoCheckmark size={24} fill="black" />
              ) : (
                <PiArrowClockwiseFill size={24} fill="none" />
              )}
              {t('english')}
            </button>
            <button onClick={() => handleLanguageSelect('fr')}>
              {i18n.language === 'fr' ? (
                <IoCheckmark size={24} fill="black" />
              ) : (
                <PiArrowClockwiseFill size={24} fill="none" />
              )}
              {t('french')}
            </button>
          </div>
        )}
      </div>

      <div className="dropdown-button">
        <button
            className={`button ${dropdownState.activeButton === 'internet' ? 'active' : ''}`}
            onClick={() => toggleDropdown('internet')}
            aria-expanded={dropdownState.activeButton === 'internet'}
            aria-label="internet"
            data-testid="internet-dropdown-button"
          >
            {isOnline ? (
              <PiGlobeLight size={32} data-testid="online-icon"/>
              ) : (
              <PiGlobeXLight size={32} data-testid="offline-icon"/>
              )}
          </button>
        {dropdownState.activeButton === 'internet' && (
        <div className="dropdown-content show">
          <button onClick={() => handleSelectOnlineMode(true)}>
              {isOnline ? (
                <IoCheckmark size={24} fill="black" />
              ) : (
                <PiArrowClockwiseFill size={24} fill="none" />
              )}
              {t('online')}
            </button>
            <button onClick={() => handleSelectOnlineMode(false)}>
              {!isOnline ? (
                <IoCheckmark size={24} fill="black" />
              ) : (
                <PiArrowClockwiseFill size={24} fill="none" />
              )}
              {t('offline')}
            </button>
        </div>
        )}
      </div>

      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'reset' ? 'active' : ''}`}
          onClick={() => toggleDropdown('reset')}
          aria-expanded={dropdownState.activeButton === 'reset'}
          aria-label="reset"
          data-testid="reset-dropdown-button"
        >
          <PiArrowClockwiseFill size={32} />
        </button>
        {dropdownState.activeButton === 'reset' && (
          <div className="dropdown-content show">
            <button onClick={handleReset} data-testid="reset-button">
              <PiArrowClockwiseFill size={24} />
              {t('reset')}
            </button>
            <button
              onClick={handleFactoryReset}
              data-testid="factory-reset-button"
              style={{ color: '#dc143c' }}
            >
              <IoTrashOutline size={24} fill="red" />
              {t('factory_reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
