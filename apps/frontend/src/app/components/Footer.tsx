import React, { useEffect, useRef, useState } from 'react';
import '../styles/footer.css';
import { FaPauseCircle, FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useMapLayerContext } from '../context/MapContext';
import { toast } from 'react-toastify';
import { changeLayer } from './MapView';
import { Map } from 'ol';
import 'react-toastify/dist/ReactToastify.css';
import { fetchTimestamps } from '../services/api';

const Footer = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const { speed, setSpeed } = useMapLayerContext();
  const [speedInitialized, setSpeedInitialized] = useState(false); // Flag to track if speed has been initialized
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const { mapRef, timeStamps, sliderValue, setSliderValue, setTimeStamps } =
    useMapLayerContext();

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
        intitializeTimestampIfItemsPresent();
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
    toast.success(t('speed_changed') + newSpeed + 'x', {
      toastId: 'speed-changed',
    });
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

    // Format the date (YYYY-MM-DD)
    const dateStr = date.toISOString().split('T')[0];

    // Format the time (HH:MM:SS)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
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
  const intitializeTimestampIfItemsPresent = async () => {
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

  /**
   * Add layer if the timeStamps list is populated
   */
  useEffect(() => {
    if (timeStamps.length > 0) {
      const map = mapRef.current as Map;
      changeLayer(map, false, timeStamps[sliderValue]);
    }
  }, [sliderValue, timeStamps]); // Runs whenever sliderValue or timeStamps change

  return (
    <div className="footerContainer" data-testid="footer-container">
      {/* Speed controls */}
      <div className="speedContainer">
        {[0.5, 1, 1.5, 2, 4].map((s) => (
          <button
            className={`speedButton ${speed === s ? 'border-[#00467E]' : 'border-white'}`}
            key={s}
            onClick={() => handleSpeedChange(s)}
            data-testid={`speed-button-${s}`}
            aria-label={`Set speed to ${s}x`}
          >
            {s}x
          </button>
        ))}
      </div>
      {/* Playback controls */}
      <div className="sliderContainer">
        <div
          className="customSliderContainer"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
        >
          <div className="sliderTrack">
            {timeStamps.length > 0 && (
              <div
                className="timeMarkerThumb"
                style={{
                  left: `${timeStamps.length > 1 ?
                    (sliderValue / (timeStamps.length - 1)) * 94 + 3 : 5}%`,
                }}
              >
                <span className="timeMarkerText">
                  {timeStamps[sliderValue]
                    ? formatTimestamp(timeStamps[sliderValue])
                    : ''}
                </span>
              </div>
            )}
          </div>
          <div
            className="sliderThumb"
            style={{
              left: `${timeStamps.length > 1 ? (sliderValue / (timeStamps.length - 1)) * 100 : 0}%`,
            }}
          ></div>
        </div>

        <button
          className="iconButton"
          onClick={handlePlayPause}
          data-testid="play-pause-button"
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {!isPlaying ? (
            <FaPlayCircle
              className="controlIcon"
              size={30}
              data-testid="play-icon"
            />
          ) : (
            <FaPauseCircle
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
          <FaStopCircle
            className="controlIcon"
            size={30}
            data-testid="stop-icon"
          />
        </button>
      </div>
    </div>
  );
};

export default Footer;
