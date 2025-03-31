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
import {
  PiArrowClockwiseFill,
  PiGlobeLight,
  PiGlobeXLight,
} from 'react-icons/pi';
import {
  fetchCollectionsFromEndpoint,
  resetCollections,
  resetDatalayerView,
  resetItemAssets,
  resetItems,
  verifyIfEndpointHasCollections,
} from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useMapLayerContext } from '../context/MapContext';
import { getConfig, saveConfig } from '../services/configApi';
import { changeLayer, updateLayerStyle } from './MapView';
import { Map } from 'ol';
import { LuPalette } from 'react-icons/lu';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const MySwal = withReactContent(Swal);

interface Config {
  endpoint?: string;
  language?: string;
  onlineMode?: boolean;
  loadedDataset?: { id: string; title: string };
  error?: string;
  [key: string]: any;
}

const SettingsPanel: React.FC<{
  refreshDatasets: () => void;
  setMetadataVisible: (visible: boolean) => void;
}> = ({ refreshDatasets, setMetadataVisible }) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [dropdownState, setDropdownState] = useState<{
    activeButton: string | null;
    isOpen: boolean;
  }>({ activeButton: null, isOpen: false });
  const {
    setLayer,
    setSpeed,
    resetView,
    isOnline,
    setIsOnline,
    setSliderValue,
    mapRef,
    timeStamps,
    setTimeStamps,
    setCollectionId,
    setIsPlaying,
    setSelectedAssetLayers,
  } = useMapLayerContext();
  const [newApiEndpoint, setNewApiEndpoint] = useState<string>(
    'https://default-api-endpoint.com',
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [languageInitialized, setLanguageInitialized] = useState(false);

  /**
   * Fetches and caches the application configuration once on mount.
   * @returns Cached config data or undefined if fetch fails.
   */
  const { data: configData, isLoading: configLoading } = useQuery(
    ['config'],
    () => getConfig(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: () => toast.error(t('error_fetching_config_file')),
      onSuccess: (config) => {
        if (config && typeof config === 'object') {
          setNewApiEndpoint(config.endpoint || 'https://default-api-endpoint.com');
          if (config.language && config.language !== i18n.language) {
            i18n.changeLanguage(config.language);
          }
          if (config.onlineMode != undefined) setIsOnline(config.onlineMode);
        }
      },
    }
  );

  /**
   * Saves the application configuration and updates the cache.
   * @param config - The configuration object to save.
   * @returns Promise resolving with void (no return data assumed).
   */
  const saveConfigMutation = useMutation<void, unknown, Config>(
    (config: Config) => saveConfig(config),
    {
      onSuccess: () => {
        // Update the cache with the latest configData if available
        if (configData) {
          queryClient.setQueryData(['config'], configData);
        }
      },
      onError: (error: unknown) => toast.error(t('error_saving_config')),
    }
  );

  /**
   * Initializes language from local storage and syncs with config.
   */
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      !languageInitialized &&
      !configLoading &&
      configData
    ) {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
      } else if (!savedLanguage) {
        localStorage.setItem('language', 'en');
        toast.info(t('default_language_retrieved'));
        if (configData && typeof configData === 'object') {
          const newConfig = { ...configData, language: 'en' };
          saveConfigMutation.mutate(newConfig);
        }
      }
      setLanguageInitialized(true);
    }
  }, [i18n, t, languageInitialized, configLoading, configData]);

  /**
   * Prompts for an endpoint if none is saved in the cached config.
   */
  useEffect(() => {
    if (!configLoading && configData && typeof configData === 'object') {
      if (!configData.endpoint || configData.endpoint === 'No endpoint saved') {
        promptForEndpoint(
          refreshDatasets,
          t,
          MySwal,
          handleSaveAndFetchEndpoint,
          getConfig,
          saveConfig,
        );
      }
    }
  }, [configLoading, configData, refreshDatasets, t]);

  /**
   * Toggles dropdown state using cached config data for settings.
   * @param buttonName - The name of the button triggering the dropdown.
   */
  const toggleDropdown = (buttonName: string) => {
    if (buttonName === 'settings' && configData?.endpoint) {
      setNewApiEndpoint(configData.endpoint); // Use cached data instead of fetching
    }
    setDropdownState((prevState) => ({
      activeButton: prevState.activeButton === buttonName ? null : buttonName,
      isOpen: prevState.activeButton !== buttonName,
    }));
  };

  /**
   * Handles language selection and updates config via mutation.
   * @param language - The selected language code (e.g., 'en', 'fr').
   */
  const handleLanguageSelect = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    if (configData && typeof configData === 'object') {
      const newConfig = { ...configData, language };
      saveConfigMutation.mutate(newConfig);
    }
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleSaveAndFetchEndpoint = async (
    endpointUrl: string,
  ): Promise<boolean> => {
    if (isValidUrl(endpointUrl)) {
      try {
        const verificationMessage = await verifyIfEndpointHasCollections(endpointUrl);
        if (verificationMessage !== 'Collections found') {
          toast.error(t('no_collections_found'));
          return false;
        }

        await resetCollections();
        await resetItems();
        await resetItemAssets();
        setSelectedAssetLayers([]);

        const message = await fetchCollectionsFromEndpoint(endpointUrl);
        if (message === 'Collections fetched and saved successfully') {
          toast.success(t('collections_fetched_saved'));
        }

        const config = configData || (await getConfig());
        if (config.error) {
          toast.error(t('error_fetching_config_file'));
          return false;
        }

        const newConfig = { ...config, endpoint: endpointUrl, loadedDataset: { id: '', title: '' } };
        saveConfigMutation.mutate(newConfig);

        refreshDatasets();
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

  const handleReset = async () => {
    MySwal.fire({
      title: t('reset'),
      text: t('confirm_reset_properties'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yes'),
      customClass: { popup: 'custom-swal-popup' },
    }).then(async (result: { isConfirmed: any }) => {
      if (result.isConfirmed) {
        localStorage.setItem('language', 'en');
        localStorage.setItem('playbackSpeed', '1');
        localStorage.setItem('sliderValue', '0');
        setIsPlaying(false);
        setSliderValue(0);
        setSpeed(1);
        handleResetLayerStyle(true);
        if (configData && typeof configData === 'object') {
          const newConfig = { ...configData, language: 'en' };
          saveConfigMutation.mutate(newConfig);
        }
        toast.success(t('reset_completed'));
      }
    });

    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleFactoryReset = async () => {
    if (!isOnline) {
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
      customClass: { popup: 'custom-swal-popup' },
    }).then(async (result: { isConfirmed: any }) => {
      if (result.isConfirmed) {
        resetView();
        setSelectedAssetLayers([]);
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
          setMetadataVisible(false);
        } catch (error: any) {
          toast.error(error.message);
        }
      }
    });

    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleSelectOnlineMode = async (onlineMode: boolean) => {
    setIsOnline(onlineMode);
    const config = configData || (await getConfig());
    if (config.error) {
      toast.error(t('error_fetching_config_file'));
      return false;
    }
    const newConfig = { ...config, onlineMode };
    saveConfigMutation.mutate(newConfig);
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const resetConfig = async () => {
    try {
      localStorage.setItem('language', 'en');
      localStorage.setItem('playbackSpeed', '1');
      localStorage.setItem('selectedDatasetId', '');
      localStorage.setItem('sliderValue', '0');
      setIsPlaying(false);
      setSliderValue(0);
      setLayer('default');
      setTimeStamps([]);
      setCollectionId('');
      setSpeed(1);

      await resetCollections();
      await resetItems();
      await resetDatalayerView();
      await resetItemAssets();
      const map = mapRef.current as Map;
      changeLayer(map, true);
      changeLayer(map, false, "reset");
      setSpeed(1);
      handleResetLayerStyle(true);
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
        const config = configData || (await getConfig());
        if (config.error) {
          toast.error(t('error_fetching_config_file'));
          break;
        }
        const newConfig = { ...config, endpoint: 'No endpoint saved', loadedDataset: { id: '', title: '' } };
        saveConfigMutation.mutate(newConfig);
        refreshDatasets();
        break;
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiEndpoint);
    toast.success(t('copied_to_clipboard'));
  };

  // Default style values for Polygon
  const DEFAULT_FILL_COLOR = '#ff0000';
  const DEFAULT_FILL_OPACITY = '0.1';
  const DEFAULT_STROKE_COLOR = '#ff0000';
  const DEFAULT_STROKE_WIDTH = '2';

  // Default style values for DataLayer
  const DEFAULT_DATA_FILL_COLOR = '#0000ff';
  const DEFAULT_DATA_FILL_OPACITY = '0.1';
  const DEFAULT_DATA_STROKE_COLOR = '#0000ff';
  const DEFAULT_DATA_STROKE_WIDTH = '2';

  const [selectedStyleTab, setSelectedStyleTab] = useState<'polygon' | 'dataLayer'>('polygon');
  const [polygonFillColor, setPolygonFillColor] = useState(DEFAULT_FILL_COLOR);
  const [polygonFillOpacity, setPolygonFillOpacity] = useState(DEFAULT_FILL_OPACITY);
  const [polygonStrokeColor, setPolygonStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [polygonStrokeWidth, setPolygonStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [dataLayerFillColor, setDataLayerFillColor] = useState(DEFAULT_DATA_FILL_COLOR);
  const [dataLayerFillOpacity, setDataLayerFillOpacity] = useState(DEFAULT_DATA_FILL_OPACITY);
  const [dataLayerStrokeColor, setDataLayerStrokeColor] = useState(DEFAULT_DATA_STROKE_COLOR);
  const [dataLayerStrokeWidth, setDataLayerStrokeWidth] = useState(DEFAULT_DATA_STROKE_WIDTH);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
      : 'rgb(0,0,0)';
  };

  const handleUpdateLayerStyle = () => {
    if (!mapRef.current) return;
    if (selectedStyleTab === 'polygon') {
      updateLayerStyle(
        mapRef.current,
        'itemLayer',
        hexToRgb(polygonFillColor),
        polygonFillOpacity,
        hexToRgb(polygonStrokeColor),
        polygonStrokeWidth
      );
    } else {
      updateLayerStyle(
        mapRef.current,
        'dataLayer',
        hexToRgb(dataLayerFillColor),
        dataLayerFillOpacity,
        hexToRgb(dataLayerStrokeColor),
        dataLayerStrokeWidth
      );
    }
  };

  const handleResetLayerStyle = (resetBoth = false) => {
    if (!mapRef.current) return;
    if (resetBoth || selectedStyleTab === 'polygon') {
      setPolygonFillColor(DEFAULT_FILL_COLOR);
      setPolygonFillOpacity(DEFAULT_FILL_OPACITY);
      setPolygonStrokeColor(DEFAULT_STROKE_COLOR);
      setPolygonStrokeWidth(DEFAULT_STROKE_WIDTH);
      updateLayerStyle(
        mapRef.current,
        'itemLayer',
        hexToRgb(DEFAULT_FILL_COLOR),
        DEFAULT_FILL_OPACITY,
        hexToRgb(DEFAULT_STROKE_COLOR),
        DEFAULT_STROKE_WIDTH
      );
    }
    if (resetBoth || selectedStyleTab === 'dataLayer') {
      setDataLayerFillColor('#0000ff');
      setDataLayerFillOpacity('0.1');
      setDataLayerStrokeColor('#0000ff');
      setDataLayerStrokeWidth('2');
      updateLayerStyle(
        mapRef.current,
        'dataLayer',
        hexToRgb('#0000ff'),
        '0.1',
        hexToRgb('#0000ff'),
        '2'
      );
    }
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
            <PiGlobeLight size={32} data-testid="online-icon" />
          ) : (
            <PiGlobeXLight size={32} data-testid="offline-icon" />
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

      {timeStamps && timeStamps.length > 0 && (
        <div className="dropdown-button">
          <button
            className={`button ${dropdownState.activeButton === 'style' ? 'active' : ''}`}
            onClick={() => toggleDropdown('style')}
            aria-expanded={dropdownState.activeButton === 'style'}
            aria-label="style"
            data-testid="style-dropdown-button"
          >
            <LuPalette size={32} />
          </button>
          {dropdownState.activeButton === 'style' && (
            <div className="dropdown-content show">
              <div className="style-options">
                <div className="style-tabs">
                  <button
                    className={`style-tab ${selectedStyleTab === 'polygon' ? 'active' : ''}`}
                    onClick={() => setSelectedStyleTab('polygon')}
                  >
                    {t('polygon')}
                  </button>
                  <button
                    className={`style-tab ${selectedStyleTab === 'dataLayer' ? 'active' : ''}`}
                    onClick={() => setSelectedStyleTab('dataLayer')}
                  >
                    {t('data_layer')}
                  </button>
                </div>
                <h2>
                  {selectedStyleTab === 'polygon' ? t('polygon_style') : t('data_layer_style')}
                </h2>
                {selectedStyleTab === 'polygon' ? (
                  <>
                    <div className="style-option">
                      <label>{t('fill')}:</label>
                      <input
                        type="color"
                        value={polygonFillColor}
                        onChange={(e) => setPolygonFillColor(e.target.value)}
                      />
                    </div>
                    <div className="style-option">
                      <label>{t('fill_opacity')}:</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={polygonFillOpacity}
                        onChange={(e) => setPolygonFillOpacity(e.target.value)}
                      />
                      <span>{polygonFillOpacity}</span>
                    </div>
                    <div className="style-option">
                      <label>{t('stroke')}:</label>
                      <input
                        type="color"
                        value={polygonStrokeColor}
                        onChange={(e) => setPolygonStrokeColor(e.target.value)}
                      />
                    </div>
                    <div className="style-option">
                      <label>{t('stroke_width')}:</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={polygonStrokeWidth}
                        onChange={(e) => setPolygonStrokeWidth(e.target.value)}
                      />
                      <span>{polygonStrokeWidth}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="style-option">
                      <label>{t('fill')}:</label>
                      <input
                        type="color"
                        value={dataLayerFillColor}
                        onChange={(e) => setDataLayerFillColor(e.target.value)}
                      />
                    </div>
                    <div className="style-option">
                      <label>{t('fill_opacity')}:</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={dataLayerFillOpacity}
                        onChange={(e) => setDataLayerFillOpacity(e.target.value)}
                      />
                      <span>{dataLayerFillOpacity}</span>
                    </div>
                    <div className="style-option">
                      <label>{t('stroke')}:</label>
                      <input
                        type="color"
                        value={dataLayerStrokeColor}
                        onChange={(e) => setDataLayerStrokeColor(e.target.value)}
                      />
                    </div>
                    <div className="style-option">
                      <label>{t('stroke_width')}:</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={dataLayerStrokeWidth}
                        onChange={(e) => setDataLayerStrokeWidth(e.target.value)}
                      />
                      <span>{dataLayerStrokeWidth}</span>
                    </div>
                  </>
                )}
                <div className="style-buttons">
                  <button className="update-style-btn" onClick={handleUpdateLayerStyle}>
                    {t('update_style')}
                  </button>
                  <button
                    className="reset-style-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleResetLayerStyle();
                    }}
                  >
                    {t('reset_style')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
