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
import { IoIosSettings } from 'react-icons/io';
import { BsDropletFill } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { useMapLayerContext } from '../context/MapContext';
import { toast } from 'react-toastify';
import { changeLayer } from './MapView';
import { Map } from 'ol';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchTimestamps,
  getLoadedLayers,
  loadAssets,
  resetItemAssets,
} from '../services/api';

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
      setTimeStamps(timestampsResponse);
      const stringCurrentSliderValue = localStorage.getItem('sliderValue');

      // Check if there's a saved slider value in localStorage, otherwise default to 0
      const currentSliderValue = stringCurrentSliderValue
        ? parseInt(stringCurrentSliderValue)
        : 0;

      setSliderValue(currentSliderValue); // State update is async, so move changeLayer to useEffect
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
    setLoadedTimestamp(null);
    setHoverBoxLocked(false);

    // Also reset any selected layer
    setSelectedLayer(null);
  }, [timeStamps]);

  // Resets assets when sliderValue changes
  useEffect(() => {
    // Reset assets when timestamp changes
    setLoadedLayers([]);

    if (timeStamps.length > 0) {
      const map = mapRef.current as Map;
      changeLayer(map, false, timeStamps[sliderValue]);
    }
  }, [sliderValue]);

  const onloadAssetsClick = async () => {
    try {
      const itemId = formatTimestampForItemId(timeStamps[sliderValue]);
      setIsLoadingAssets(true);
      await resetItemAssets();
      const response = await loadAssets(collectionId, itemId);

      if (typeof response === 'object' && response.error) {
        toast.error(`Failed to load assets: ${response.error}`);
        setIsLoadingAssets(false);
      } else {
        toast.success('Asset loading initiated');
        setLoadedTimestamp(timeStamps[sliderValue]); // <- Set the loaded timestamp here
        const interval = setInterval(pollLoadedLayers, 1000);
        setPollingInterval(interval);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
      setIsLoadingAssets(false);
    }
  };

  const pollLoadedLayers = async () => {
    try {
      const layers = await getLoadedLayers();
      if (Array.isArray(layers) && layers.length > 0) {
        setLoadedLayers(layers);
        setIsLoadingAssets(false);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Error polling loaded layers:', error);
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
    // Implement layer display logic here
    toast.info(`Showing ${layerName} layer`);
    setSelectedLayer(layerName === selectedLayer ? null : layerName);
  };

  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Function to format layer name
  const formatLayerName = (name: string): string => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to get the appropriate icon for a layer
  const getLayerIcon = (layerName: string) => {
    switch (layerName) {
      case 'humidity':
        return (
          <BsDropletFill
            className="layerButtonIcon"
            color={selectedLayer === layerName ? 'white' : '#00447E'}
          />
        );
      case 'wind_force':
        return (
          <FaWind
            className="layerButtonIcon"
            color={selectedLayer === layerName ? 'white' : '#00447E'}
          />
        );
      case 'wind_direction':
        return (
          <FaRegCompass
            className="layerButtonIcon"
            color={selectedLayer === layerName ? 'white' : '#00447E'}
          />
        );
      default:
        return (
          <IoIosSettings
            className="layerButtonIcon"
            color={selectedLayer === layerName ? 'white' : '#00447E'}
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
                  style={{
                    left: `${
                      timeStamps.length > 1
                        ? (sliderValue / (timeStamps.length - 1)) * 94 + 3
                        : 5
                    }%`,
                  }}
                  data-hovered={
                    hoveredThumb || hoveredBox || hoverBoxLocked
                      ? 'true'
                      : 'false'
                  }
                  data-locked={hoverBoxLocked ? 'true' : 'false'}
                  onClick={() => setHoverBoxLocked(true)}
                  onMouseEnter={() => setHoveredBox(true)}
                  onMouseLeave={() => setHoveredBox(false)}
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
                  <span className="hoverBoxText">Weather Assets</span>
                  {hoverBoxLocked && (
                    <>
                      {isLoadingAssets ? (
                        <div className="loadingSpinner">
                          <div className="spinner"></div>
                          <span>Loading assets...</span>
                        </div>
                      ) : loadedLayers.length > 0 &&
                        loadedTimestamp === timeStamps[sliderValue] ? (
                        <div className="layerButtonsContainer">
                          {loadedLayers.map((layer, index) => (
                            <button
                              key={index}
                              className={`layerButton ${selectedLayer === layer.asset_name ? 'active' : ''}`}
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
                          onClick={onloadAssetsClick}
                        >
                          Load Assets
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
                        ? (sliderValue / (timeStamps.length - 1)) * 94 + 3
                        : 5
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
