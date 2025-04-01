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
import { useQuery, useQueryClient } from 'react-query';

const MySwal = withReactContent(Swal);

const SettingsPanel: React.FC<{
  refreshDatasets: () => void;
  setMetadataVisible: (visible: boolean) => void;
}> = ({ refreshDatasets, setMetadataVisible }) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient(); // Access the QueryClient from ClientLayout
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
    isCollectionsLoaded,
    setIsCollectionsLoaded
  } = useMapLayerContext();
  const [newApiEndpoint, setNewApiEndpoint] = useState<string>(
    'https://default-api-endpoint.com',
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [languageInitialized, setLanguageInitialized] = useState(false);

  // UseQuery for fetching config
  const {
    data: configData,
    isLoading: configLoading,
    error: configError,
  } = useQuery(
    ['config'],
    () => getConfig(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (config) => {
        if (config.endpoint) setNewApiEndpoint(config.endpoint);
        if (config.language && config.language !== i18n.language) {
          i18n.changeLanguage(config.language);
        }
        if (config.onlineMode != undefined) setIsOnline(config.onlineMode);
        setLanguageInitialized(true);
      },
    }
  );

  // Initialize language from local storage
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      !languageInitialized &&
      !configLoading &&
      !configError
    ) {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
      } else if (!savedLanguage) {
        localStorage.setItem('language', 'en');
        toast.info(t('default_language_retrieved'));
      }
      setLanguageInitialized(true);
    }
  }, [i18n, t, languageInitialized, configLoading, configError]);

  // Prompt for endpoint if none is saved
  useEffect(() => {
    if (
      !configLoading &&
      !configError &&
      (configData?.endpoint === 'No endpoint saved' || !configData?.endpoint)
    ) {
      promptForEndpoint(
        refreshDatasets,
        t,
        MySwal,
        handleSaveAndFetchEndpoint,
        getConfig,
        saveConfig,
      );
    }
  }, [configLoading, configError, configData]);

  // Toggle dropdown state
  const toggleDropdown = async (buttonName: string) => {
    if (buttonName === 'settings' && configData?.endpoint) {
      setNewApiEndpoint(configData.endpoint);
    }
    setDropdownState((prevState) => ({
      activeButton: prevState.activeButton === buttonName ? null : buttonName,
      isOpen: prevState.activeButton !== buttonName,
    }));
  };

  const handleSaveAndFetchEndpoint = async (
    endpointUrl: string,
  ): Promise<boolean> => {
    if (!isValidUrl(endpointUrl)) {
      toast.error(t('invalid_url'));
      return false;
    }

    try {
      // Use fetchQuery to cache verifyIfEndpointHasCollections
      const verificationMessage = await queryClient.fetchQuery(
        ['verifyEndpoint', endpointUrl],
        () => verifyIfEndpointHasCollections(endpointUrl),
        { staleTime: 5 * 60 * 1000 }
      );
      if (verificationMessage !== 'Collections found') {
        toast.error(t('no_collections_found'));
        return false;
      }

      // Reset collections before fetching new ones
      await resetCollections();
      await resetItems();
      await resetItemAssets();
      setSelectedAssetLayers([]);

      // Use fetchQuery to cache fetchCollectionsFromEndpoint
      const message = await queryClient.fetchQuery(
        ['fetchCollections', endpointUrl],
        () => fetchCollectionsFromEndpoint(endpointUrl),
        { staleTime: 5 * 60 * 1000 }
      );
      if (message === 'Collections fetched and saved successfully') {
        toast.success(t('collections_fetched_saved'));
      }

      // Update config
      const config = configData || (await getConfig());
      if (config.error) {
        toast.error(t('error_fetching_config_file'));
        return false;
      }
      config.endpoint = endpointUrl;
      config.loadedDataset = { id: '', title: '' };
      await saveConfig(config);
      queryClient.setQueryData(['config'], config); // Update cache manually

      refreshDatasets();
      setDropdownState({ activeButton: null, isOpen: false });
      setIsCollectionsLoaded(true);
      return true;
    } catch (error) {
      toast.error(t('error_fetching_collections'));
      return false;
    }
  };

  const handleLanguageSelect = async (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    const config = configData || (await getConfig());
    config.language = language;
    await saveConfig(config);
    queryClient.setQueryData(['config'], config);
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
      customClass: { popup: 'custom-swal-popup' },
    }).then(async (result) => {
      if (result.isConfirmed) {
        localStorage.setItem('language', 'en');
        localStorage.setItem('playbackSpeed', '1');
        localStorage.setItem('sliderValue', '0');
        setIsPlaying(false);
        setSliderValue(0);
        setSpeed(1);
        handleResetLayerStyle(true);
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        resetView();
        setSelectedAssetLayers([]);
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
      }
    });
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleSelectOnlineMode = async (onlineMode: boolean) => {
    setIsOnline(onlineMode);
    const config = configData || (await getConfig());
    if (config.error) {
      toast.error(t('error_fetching_config_file'));
      return;
    }
    config.onlineMode = onlineMode;
    await saveConfig(config);
    queryClient.setQueryData(['config'], config);
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
      changeLayer(map, false, 'reset');
      setSpeed(1);
      handleResetLayerStyle(true);
      setIsCollectionsLoaded(false);
      setSelectedStyleTab('item_layer');
      queryClient.invalidateQueries(['config']); // Invalidate config cache
      return 'Reset was successful';
    } catch (error) {
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
        config.endpoint = 'No endpoint saved';
        config.loadedDataset = { id: '', title: '' };
        await saveConfig(config);
        queryClient.setQueryData(['config'], config);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownState.isOpen]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiEndpoint);
    toast.success(t('copied_to_clipboard'));
  };

  // Default style values for item_layer
  const DEFAULT_FILL_COLOR = '#ff0000'; // Red
  const DEFAULT_FILL_OPACITY = '0.1';
  const DEFAULT_STROKE_COLOR = '#ff0000';
  const DEFAULT_STROKE_WIDTH = '2';
  const DEFAULT_DATA_FILL_COLOR = '#0000ff';
  const DEFAULT_DATA_FILL_OPACITY = '0.1';
  const DEFAULT_DATA_STROKE_COLOR = '#0000ff';
  const DEFAULT_DATA_STROKE_WIDTH = '2';

  // Tab selection state
  const [selectedStyleTab, setSelectedStyleTab] = useState<'item_layer' | 'data_layer'>('data_layer');

  // ItemLayer style state
  const [itemLayerFillColor, setItemLayerFillColor] = useState(DEFAULT_FILL_COLOR);
  const [itemLayerFillOpacity, setItemLayerFillOpacity] = useState(DEFAULT_FILL_OPACITY);
  const [itemLayerStrokeColor, setItemLayerStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [itemLayerStrokeWidth, setItemLayerStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);

  // DataLayer style state
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

  // Update itemLayer and dataLayer style
  const handleUpdateLayerStyle = () => {
    if (!mapRef.current) return;

    if (selectedStyleTab === 'item_layer') {
      updateLayerStyle(
        mapRef.current,
        'itemLayer',
        hexToRgb(itemLayerFillColor),
        itemLayerFillOpacity,
        hexToRgb(itemLayerStrokeColor),
        itemLayerStrokeWidth
      );
    } else {
      updateLayerStyle(
        mapRef.current,
        'dataLayer',
        hexToRgb(dataLayerFillColor),
        dataLayerFillOpacity,
        hexToRgb(dataLayerStrokeColor),
        dataLayerStrokeWidth,
      );
    }
  };

  // Reset itemLayer and dataLayer style
  const handleResetLayerStyle = (resetBoth = false) => {
    if (!mapRef.current) return;

    if (resetBoth || selectedStyleTab === 'item_layer') {
      // Reset itemLayer state
      setItemLayerFillColor(DEFAULT_FILL_COLOR);
      setItemLayerFillOpacity(DEFAULT_FILL_OPACITY);
      setItemLayerStrokeColor(DEFAULT_STROKE_COLOR);
      setItemLayerStrokeWidth(DEFAULT_STROKE_WIDTH);

      updateLayerStyle(
        mapRef.current,
        'itemLayer',
        hexToRgb(DEFAULT_FILL_COLOR),
        DEFAULT_FILL_OPACITY,
        hexToRgb(DEFAULT_STROKE_COLOR),
        DEFAULT_STROKE_WIDTH,
      );
    }

    if (resetBoth || selectedStyleTab === 'data_layer') {
      // Reset data layer state with blue defaults
      setDataLayerFillColor('#0000ff');
      setDataLayerFillOpacity('0.1');
      setDataLayerStrokeColor('#0000ff');
      setDataLayerStrokeWidth('2');

      updateLayerStyle(
        mapRef.current,
        'dataLayer',
        hexToRgb(DEFAULT_DATA_FILL_COLOR),
        DEFAULT_DATA_FILL_OPACITY,
        hexToRgb(DEFAULT_DATA_STROKE_COLOR),
        DEFAULT_DATA_STROKE_WIDTH,
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

      {/* Customize itemLayer and DataLayer colors */}
      {((timeStamps && timeStamps.length > 0) || (isCollectionsLoaded)) && (
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
                {(timeStamps && timeStamps.length > 0) && (
                  <button
                    className={`style-tab ${selectedStyleTab === 'item_layer' ? 'active' : ''}`}
                    onClick={() => setSelectedStyleTab('item_layer')}
                  >
                    {t('item_layer')}
                  </button>
                )}
                {isCollectionsLoaded && (
                  <button
                    className={`style-tab ${selectedStyleTab === 'data_layer' ? 'active' : ''}`}
                    onClick={() => setSelectedStyleTab('data_layer')}
                  >
                    {t('data_layer')}
                  </button>
                )}
              </div>
              <h2>
                {selectedStyleTab === 'item_layer' ? t('item_layer_style') : t('data_layer_style')}
              </h2>

              {selectedStyleTab === 'item_layer' ? (
                // itemLayer style controls
                <>
                  <div className="style-option">
                    <label>{t('fill')}:</label>
                    <input
                      type="color"
                      value={itemLayerFillColor}
                      onChange={(e) => setItemLayerFillColor(e.target.value)}
                    />
                  </div>

                  <div className="style-option">
                    <label>{t('fill_opacity')}:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={itemLayerFillOpacity}
                      onChange={(e) => setItemLayerFillOpacity(e.target.value)}
                    />
                    <span>{itemLayerFillOpacity}</span>
                  </div>

                  <div className="style-option">
                    <label>{t('stroke')}:</label>
                    <input
                      type="color"
                      value={itemLayerStrokeColor}
                      onChange={(e) => setItemLayerStrokeColor(e.target.value)}
                    />
                  </div>

                  <div className="style-option">
                    <label>{t('stroke_width')}:</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={itemLayerStrokeWidth}
                      onChange={(e) => setItemLayerStrokeWidth(e.target.value)}
                    />
                    <span>{itemLayerStrokeWidth}</span>
                  </div>
                </>
              ) : (
                // Data layer style controls
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
                <button
                  className="update-style-btn"
                  onClick={handleUpdateLayerStyle}
                >
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