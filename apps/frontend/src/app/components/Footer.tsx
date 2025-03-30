import React, { useEffect, useRef, useState } from 'react';
import '../styles/footer.css';
import { FaBackward, FaPause, FaPlay } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useMapLayerContext } from '../context/MapContext';
import { toast } from 'react-toastify';
import { Map } from 'ol';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchTimestamps,
  getLoadedLayers,
  loadAssetLayers,
  fetchItemIds,
} from '../services/api';
import { changeLayer, toggleAssetLayer } from './MapView';

const Footer = () => {
  const { t } = useTranslation();
  const {
    speed,
    setSpeed,
    mapRef,
    timeStamps,
    sliderValue,
    setSliderValue,
    setTimeStamps,
    setLoadedLayers,
    selectedAssetLayers,
    isPlaying,
    setIsPlaying,
    itemIds,
    setItemIds,
    isProcessLoading,
  } = useMapLayerContext();

  const [speedInitialized, setSpeedInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [pendingSliderValue, setPendingSliderValue] = useState(sliderValue);
  const pendingSliderRef = useRef(sliderValue);

  const speedValues = [0.25, 0.5, 1, 1.5, 2];

  const processLoadedLayers = async (itemId: string) => {
    setLoadedLayers([]);
    if (!isProcessLoading) {
      if (itemId) {
        await loadAssetLayers(itemId);
        const response = await getLoadedLayers();
        if (response.error !== 'Failed to fetch loaded layers') {
          setLoadedLayers(response);

          const map = mapRef.current as Map;
          if (selectedAssetLayers.length > 0) {
            selectedAssetLayers.forEach((layer) => {
              if (response.length > 0) {
                const layerData = response.find(
                  (obj: { asset_name: string, item_id: string }) => obj.asset_name === layer && obj.item_id === itemId,
                );
                toggleAssetLayer(map, layer, '', false, layerData.min, layerData.max);
                toggleAssetLayer(map, layer, layerData.layer_url, true, layerData.min, layerData.max);
              }
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!isProcessLoading) processLoadedLayers(itemIds[sliderValue]);
  }, [isProcessLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load speed from localStorage if available
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
          setSpeed(parseFloat(savedSpeed));
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

  const handlePlayPause = () => {
    if (timeStamps.length === 0) return;
    setIsPlaying((prev) => !prev);
  };
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

  // Set global slider value when mouse up from sliding timeline
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const finalValue = pendingSliderRef.current;

    setSliderValue(finalValue);
    const map = mapRef.current as Map;
    if (timeStamps.length > 0) {
      changeLayer(map, false, timeStamps[finalValue]);
      localStorage.setItem('sliderValue', finalValue.toString());
    }
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
      }, 4500 / speed);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isPlaying, speed, sliderValue, timeStamps]);

  // Change temp slider value to lessen load on backend calls
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

      setPendingSliderValue(newValue);
      pendingSliderRef.current = newValue;
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
    const stringCurrentSliderValue = localStorage.getItem('sliderValue');
    // Check if there's a saved slider value in localStorage, otherwise default to 0
    const currentSliderValue = stringCurrentSliderValue
      ? parseInt(stringCurrentSliderValue)
      : 0;
    if (timestampsResponse) {
      await setTimeStamps(timestampsResponse);

      setSliderValue(currentSliderValue); // State update is async, so move changeLayer to useEffect
    }
    const itemIdsResponse = await fetchItemIds();

    if (Array.isArray(itemIdsResponse)) {
      await setItemIds(itemIdsResponse);

      if (itemIdsResponse.length > 0) {
        await processLoadedLayers(itemIdsResponse[currentSliderValue]);
      }
    }
  };

  // Handle slider value changes
  useEffect(() => {
    const currentTimestamp = timeStamps[sliderValue];

    // Always update the base map layer
    if (timeStamps.length > 0) {
      if (itemIds.length > 0) {
        processLoadedLayers(itemIds[sliderValue]);
      }
      const map = mapRef.current as Map;
      changeLayer(map, false, currentTimestamp);
    }
  }, [sliderValue, timeStamps]);

  const currentValue = isDraggingRef.current
  ? pendingSliderValue
  : sliderValue;

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
                <div
                  className="timeMarkerThumb"
                  style={{
                    left: `${
                      timeStamps.length > 1
                        ? Math.min(
                            96,
                            Math.max(
                              4,
                              (currentValue / (timeStamps.length - 1)) * 92 + 4,
                            ),
                          )
                        : 4
                    }%`,
                  }}
                >
                  <span className="timeMarkerText">
                    {timeStamps[currentValue]
                      ? formatTimestamp(timeStamps[currentValue])
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
