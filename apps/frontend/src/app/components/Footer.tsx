import React, { useEffect, useRef, useState } from 'react';
import '../styles/footer.css';
import {
  FaAngleDown,
  FaAngleUp,
  FaBackward,
  FaPause,
  FaPlay,
  FaRegCompass,
  FaWind,
} from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { IoIosSettings } from 'react-icons/io';
import { BsDropletFill } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { useMapLayerContext } from '../context/MapContext';
import { toast } from 'react-toastify';
import { Map } from 'ol';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchTimestamps,
  getLoadedLayers,
  loadAssets,
  resetItemAssets,
} from '../services/api';
import { changeLayer, removeAllAssetLayers, toggleAssetLayer } from './MapView';

const Footer = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    speed,
    setSpeed,
    mapRef,
    timeStamps,
    sliderValue,
    setSliderValue,
    setTimeStamps,
    collectionId,
    loadedLayers,
    setLoadedLayers,
    isLoadingAssets,
    setIsLoadingAssets,
    selectedAssetLayers,
    setSelectedAssetLayers,
  } = useMapLayerContext();

  const [speedInitialized, setSpeedInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [loadedTimestamp, setLoadedTimestamp] = useState<string | null>(null);

  const speedValues = [0.5, 1, 1.5, 2, 4];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load speed from localStorage if available
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
          setSpeed(parseFloat(savedSpeed));
          toast.success(t('speed_retrieved'), { toastId: 'speed-success' });
        } else {
          toast.info(t('default_speed_retrieved'), {
            toastId: 'speed-default',
          });
        }
        setSpeedInitialized(true);
        initializeTimestampIfItemsPresent();
      } catch (error) {
        console.error('Error reading playback speed from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (speedInitialized && typeof window !== 'undefined') {
      try {
        // Save speed to localStorage whenever it changes
        localStorage.setItem('playbackSpeed', speed.toString());
      } catch (error) {
        console.error('Error saving playback speed to localStorage:', error);
      }
    }
  }, [speed, speedInitialized]);

  const handlePlayPause = () => setIsPlaying((prev) => !prev);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleSliderMove(e);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingRef.current) {
      handleSliderMove(e);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    const map = mapRef.current as Map;

    if (isPlaying && timeStamps.length > 0) {
      intervalRef.current = setInterval(() => {
        setSliderValue((prev) => {
          const newValue = prev < timeStamps.length - 1 ? prev + 1 : 0;
          changeLayer(map, false, timeStamps[newValue]);
          localStorage.setItem('sliderValue', newValue.toString());
          return newValue;
        });
      }, 1000 / speed);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isPlaying, speed, sliderValue, timeStamps]);

  const handleSliderMove = (e: MouseEvent | React.MouseEvent) => {
    if (sliderRef.current && timeStamps.length > 0) {
      const rect = sliderRef.current.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const newValue = Math.max(
        0,
        Math.min(
          Math.floor(position * timeStamps.length),
          timeStamps.length - 1,
        ),
      );

      setSliderValue(newValue);
      const map = mapRef.current as Map;
      changeLayer(map, false, timeStamps[newValue]);
      localStorage.setItem('sliderValue', newValue.toString());
    }
  };

  const handleStopPress = () => {
    const map = mapRef.current as Map;
    setIsPlaying(false);
    setSliderValue(0);
    localStorage.setItem('sliderValue', '0');
    changeLayer(map, false, timeStamps[0]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    // Format the date (YYYY-MM-DD) using UTC methods
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Format the time (HH:MM:SS) using UTC methods
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    return (
      <span className="timeMarkerText">
        <span>{dateStr}</span>
        <span>{timeStr}</span>
      </span>
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * This fetches and loads the stac items if they exist in the items table
   */
  const initializeTimestampIfItemsPresent = async () => {
    const timestampsResponse = await fetchTimestamps();
    if (timestampsResponse) {
      await setTimeStamps(timestampsResponse);
      const stringCurrentSliderValue = localStorage.getItem('sliderValue');

      // Check if there's a saved slider value in localStorage, otherwise default to 0
      const currentSliderValue = stringCurrentSliderValue
        ? parseInt(stringCurrentSliderValue)
        : 0;

      setSliderValue(currentSliderValue); // State update is async, so move changeLayer to useEffect

      const loadedAssetSilderValue = localStorage.getItem('loadedAssetSilderValue');
      if (loadedAssetSilderValue) {
        setLoadedTimestamp(timestampsResponse[parseInt(loadedAssetSilderValue)]);
      }
    }
  };

  const [hoveredThumb, setHoveredThumb] = useState(false);
  const [hoverBoxLocked, setHoverBoxLocked] = useState(false);
  const [hoveredBox, setHoveredBox] = useState(false);

  const formatTimestampForItemId = (timestamp: string): string => {
    const date = new Date(timestamp);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `wildfire_timestamp_${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
  };

  useEffect(() => {
    // Reset loadedTimestamp when timestamps array changes (new dataset loaded)
    if (timeStamps.length == 0){
      setLoadedTimestamp(null);
    }
    setHoverBoxLocked(false);
  }, [timeStamps]);

  // Handle slider value changes
  useEffect(() => {
    const currentTimestamp = timeStamps[sliderValue];

    // Only reset assets if we're not returning to the previously loaded timestamp
    if (currentTimestamp !== loadedTimestamp) {
      setLoadedLayers([]);
      setSelectedAssetLayers([]);

      if (mapRef.current) {
        removeAllAssetLayers(mapRef.current);
      }
    }

    // If we are returning to the loaded timestamp, refresh the layers data
    else if (currentTimestamp === loadedTimestamp) {
      getLoadedLayers().then(layers => {
        if (Array.isArray(layers) && layers.length > 0) {
          setLoadedLayers(layers);
        }
      });
    }

    // Always update the base map layer
    if (timeStamps.length > 0) {
      const map = mapRef.current as Map;
      changeLayer(map, false, currentTimestamp);
    }
  }, [sliderValue, timeStamps, loadedTimestamp]);

  const onloadAssetsClick = async () => {
    try {
      setIsLoadingAssets(true);
      setLoadedLayers([]);

      // To be fixed
      const selectedCollectionId = localStorage.getItem("selectedDatasetId");
      const itemId = formatTimestampForItemId(timeStamps[sliderValue]);
      if (!selectedCollectionId) {
        setIsLoadingAssets(false);
        return;
      }
      await resetItemAssets();
      const response = await loadAssets(selectedCollectionId, itemId);

      if (typeof response === 'object' && response.error) {
        toast.error(`Failed to load assets`);
        setIsLoadingAssets(false);
      } else {

        // To be fixed
        localStorage.setItem('loadedAssetSilderValue', sliderValue.toString());
        setLoadedTimestamp(timeStamps[sliderValue]);



        await pollLoadedLayersUntilComplete();
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
      setIsLoadingAssets(false);
    }
  };

  const [isLoadingComplete, setIsLoadingComplete] = useState(true);

  const pollLoadedLayersUntilComplete = async () => {
    // Clear any existing interval first
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    setIsLoadingComplete(false);

    try {
      let lastLayerCount = 0;
      let stableCount = 0;
      const stabilityThreshold = 2;

      while (true) {
        const layers = await getLoadedLayers();

        if (Array.isArray(layers)) {
          // Always update UI with the layers we have so far
          setLoadedLayers(layers);

          // Check if the layer count has stabilized (no new layers added)
          if (layers.length === lastLayerCount) {
            stableCount++;
          } else {
            stableCount = 0;
            lastLayerCount = layers.length;
          }

          // If layer count has been stable for several polling intervals and we have layers
          if (stableCount >= stabilityThreshold && layers.length > 0) {
            setIsLoadingComplete(true);
            setIsLoadingAssets(false);
            return;
          }
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (error) {
      console.error('Error polling loaded layers:', error);
      setIsLoadingComplete(true);
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  /**
   * Add layer if the timeStamps list is populated
   */
  useEffect(() => {
    if (timeStamps.length > 0) {
      const map = mapRef.current as Map;
      changeLayer(map, false, timeStamps[sliderValue]);
    }
  }, [sliderValue, timeStamps]); // Runs whenever sliderValue or timeStamps change

  const handleLayerClick = (layerName: string) => {
    const map = mapRef.current as Map;
    if (!map) {
      toast.error('Map not initialized');
      return;
    }

    // Find the layer data
    const layerData = loadedLayers.find(
      (layer) => layer.asset_name === layerName,
    );
    if (!layerData || !layerData.layer_url) {
      toast.error(`Layer URL not found for ${layerName}`);
      return;
    }

    // Check if this layer is already selected
    const isSelected = selectedAssetLayers.includes(layerName);

    if (isSelected) {
      // Remove from selected layers
      setSelectedAssetLayers((prev) =>
        prev.filter((name) => name !== layerName),
      );
      // Remove from map
      toggleAssetLayer(map, layerName, layerData.layer_url, false);
    } else {
      // Add to selected layers
      setSelectedAssetLayers((prev) => [...prev, layerName]);
      // Add to map
      toggleAssetLayer(map, layerName, layerData.layer_url, true);
    }
  };

  // Function to format layer name
  const formatLayerName = (name: string): string => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to get the appropriate icon for a layer
  // Function to get the appropriate icon for a layer
  const getLayerIcon = (layerName: string) => {
    switch (layerName) {
      case 'humidity':
        return (
          <BsDropletFill
            className="layerButtonIcon"
            color={
              selectedAssetLayers.includes(layerName) ? 'white' : '#00447E'
            }
          />
        );
      case 'wind_force':
        return (
          <FaWind
            className="layerButtonIcon"
            color={
              selectedAssetLayers.includes(layerName) ? 'white' : '#00447E'
            }
          />
        );
      case 'wind_direction':
        return (
          <FaRegCompass
            className="layerButtonIcon"
            color={
              selectedAssetLayers.includes(layerName) ? 'white' : '#00447E'
            }
          />
        );
      default:
        return (
          <IoIosSettings
            className="layerButtonIcon"
            color={
              selectedAssetLayers.includes(layerName) ? 'white' : '#00447E'
            }
          />
        );
    }
  };

  return (
    <div className="footerContainer" data-testid="footer-container">
      {/* Speed controls */}
      <div className="speedContainer">
        <div className="speedSlider">
          <div
            className="speedTrack"
            style={{
              width: `${(speedValues.indexOf(speed) / (speedValues.length - 1)) * 100}%`,
            }}
          ></div>
          {speedValues.map((s, index) => {
            // Calculate progressively larger sizes
            const baseSize = 12;
            const sizeIncrement = 2.5; // How much each point grows
            const pointSize = baseSize + index * sizeIncrement;

            return (
              <React.Fragment key={s}>
                <div
                  className={`speedPoint ${
                    s <= speed ? 'active-or-left' : 'right'
                  } ${s === speed ? 'active' : ''}`}
                  style={{
                    left: `${(index / (speedValues.length - 1)) * 100}%`,
                    width: `${pointSize}px`,
                    height: `${pointSize}px`,
                  }}
                  onClick={() => handleSpeedChange(s)}
                  data-testid={`speed-point-${s}`}
                  aria-label={`Set speed to ${s}x`}
                ></div>
                <span
                  className={`speedLabel ${
                    s <= speed ? 'active-or-left' : 'right'
                  } ${s === speed ? 'active' : ''}`}
                  style={{
                    left: `${(index / (speedValues.length - 1)) * 100}%`,
                  }}
                  onClick={() => handleSpeedChange(s)}
                >
                  {s}x
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* Playback controls */}
      <div className="sliderContainer">
        <div
          className="customSliderContainer"
          data-testid="slider"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
        >
          <div className="sliderTrack">
            {timeStamps.length > 0 && (
              <>
                {loadedTimestamp && (
                  <div
                    className="slider-loaded-tag"
                    style={{
                      left: `${
                        timeStamps.indexOf(loadedTimestamp) >= 0
                          ? (timeStamps.indexOf(loadedTimestamp) /
                              (timeStamps.length - 1)) *
                              94 +
                            3
                          : 0
                      }%`,
                      display:
                        timeStamps.indexOf(loadedTimestamp) >= 0
                          ? 'block'
                          : 'none',
                    }}
                    title="Assets loaded for this timestamp"
                  >
                    {t('loaded')}
                  </div>
                )}

                <div
                  className="timeMarkerHoverBox"
                  data-testid="hoverBox"
                  style={{
                    left: `${
                      timeStamps.length > 1
                        ? Math.min(96, Math.max(4, (sliderValue / (timeStamps.length - 1)) * 92 + 4))
                        : 4
                    }%`,
                  }}
                  data-hovered={
                    hoveredThumb || hoveredBox || hoverBoxLocked
                      ? 'true'
                      : 'false'
                  }
                  data-locked={hoverBoxLocked ? 'true' : 'false'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoverBoxLocked(true);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHoveredBox(true);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setHoveredBox(false);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {hoverBoxLocked ? (
                    <FaAngleDown
                      className="hoverBoxIcon"
                      size={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoverBoxLocked(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <FaAngleUp className="hoverBoxIcon" size={20} />
                  )}
                  <span className="hoverBoxText">
                    {t('weather_assets_label')}
                  </span>
                  {hoverBoxLocked && (
                    <>
                      {isLoadingAssets ? (
                        <div className="layerButtonsContainer" style={{ position: 'relative' }}>
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              zIndex: 10,
                              borderRadius: '4px',
                            }}
                          >
                            <div className="spinner"></div>
                            <span>{t('loading_label')}</span>
                          </div>

                          {/* Display layers as they load */}
                          {loadedLayers.length > 0 && loadedLayers.map((layer, index) => (
                            <button
                              key={index}
                              className={`layerButton ${selectedAssetLayers.includes(layer.asset_name) ? 'active' : ''}`}
                              data-testid={`layerButton-${layer.asset_name}`}
                              onClick={() => null} // Disabled during loading
                              disabled={true}
                              style={{
                                opacity: 0.7,
                                cursor: 'default',
                              }}
                            >
                              {getLayerIcon(layer.asset_name)}
                              {formatLayerName(layer.asset_name)}
                            </button>
                          ))}
                        </div>
                      ) : loadedLayers.length > 0 && loadedTimestamp === timeStamps[sliderValue] ? (
                        <div className="layerButtonsContainer" data-testid="layerButtonsContainer">
                          {loadedLayers.map((layer, index) => (
                            <button
                              key={index}
                              data-testid={`layerButton-${layer.asset_name}`}
                              className={`layerButton ${selectedAssetLayers.includes(layer.asset_name) ? 'active' : ''}`}
                              onClick={() => handleLayerClick(layer.asset_name)}
                            >
                              {getLayerIcon(layer.asset_name)}
                              {formatLayerName(layer.asset_name)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          className="loadAssetsButton"
                          data-testid="loadAssetsButton"
                          onClick={(e) => {
                            e.stopPropagation();
                            onloadAssetsClick();
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <FiDownload
                            color="white"
                            size={16}
                            style={{ marginRight: '8px' }}
                          />
                          {t('load_assets_button')}
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div
                  className="timeMarkerThumb"
                  style={{
                    left: `${
                      timeStamps.length > 1
                        ? Math.min(96, Math.max(4, (sliderValue / (timeStamps.length - 1)) * 92 + 4))
                        : 4
                    }%`,
                  }}
                  onMouseEnter={() => setHoveredThumb(true)}
                  onMouseLeave={() => setHoveredThumb(false)}
                  onClick={() => {
                    if (hoveredBox || hoveredThumb) {
                      setHoverBoxLocked(!hoverBoxLocked);
                    }
                  }}
                >
                  <span className="timeMarkerText">
                    {timeStamps[sliderValue]
                      ? formatTimestamp(timeStamps[sliderValue])
                      : ''}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          className="iconButton"
          onClick={handlePlayPause}
          data-testid="play-pause-button"
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {!isPlaying ? (
            <FaPlay className="controlIcon" size={30} data-testid="play-icon" />
          ) : (
            <FaPause
              className="controlIcon"
              size={30}
              data-testid="pause-icon"
            />
          )}
        </button>
        <button
          className="iconButton"
          onClick={handleStopPress}
          data-testid="stop-button"
        >
          <FaBackward
            className="controlIcon"
            size={35}
            data-testid="stop-icon"
          />
        </button>
      </div>
    </div>
  );
};

export default Footer;
