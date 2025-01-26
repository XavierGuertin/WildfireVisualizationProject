import React, { useState, useEffect, useRef } from 'react';
import '../styles/footer.css';
import { FaPlayCircle, FaPauseCircle, FaStopCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Footer = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [speedInitialized, setSpeedInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load speed from localStorage if available
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
          setSpeed(parseFloat(savedSpeed));
          toast.success(t('speed_retrieved'));
        } else {
          toast.info(t('default_speed_retrieved'));
        }
        setSpeedInitialized(true);
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
  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSliderValue((prev) => (prev < 100 ? prev + 1 : 0));
      }, 1000 / speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isPlaying, speed]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSliderValue(Number(event.target.value));

  const handleStopPress = () => {
    setIsPlaying(false);
    setSliderValue(0);
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

  return (
    <div className="footerContainer" data-testid="footer-container">
      {/* Speed controls */}
      <div className="speedContainer">
        {[0.5, 1, 1.5, 2, 4].map((s) => (
          <button
            className={`speedButton {speed === s ? 'border-[#00467E]' : 'border-white'}`}
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
        <input
          className="simulationSlider"
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          data-testid="slider"
        />
        <button
          className="iconButton"
          onClick={handlePlayPause}
          data-testid="play-pause-button"
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {!isPlaying ? (
            <FaPlayCircle
              className="controlIcon"
              size={25}
              data-testid="play-icon"
            />
          ) : (
            <FaPauseCircle
              className="controlIcon"
              size={25}
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
            size={25}
            data-testid="stop-icon"
          />
        </button>
      </div>
    </div>
  );
};

export default Footer;
