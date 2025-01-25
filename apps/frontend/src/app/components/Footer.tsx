import React, { useState, useEffect, useRef } from 'react';
import '../styles/footer.css';
import { FaPlayCircle, FaPauseCircle, FaStopCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [speed, setSpeed] = useState(() => {
    // Load speed from local storage or default to 1
    try {
      const savedSpeed = localStorage.getItem('playbackSpeed');
      return savedSpeed ? parseFloat(savedSpeed) : 1;
    } catch (e) {
      console.error('Error reading playback speed from localStorage', e);
      return 1;  // default speed
    }
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
          setSpeed(parseFloat(savedSpeed));
        }
      } catch (e) {
        console.error('Error reading playback speed from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    // Store speed in localStorage whenever it changes
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('playbackSpeed', speed.toString());
      } catch (e) {
        console.error('Error saving playback speed to localStorage', e);
        setErrorMessage('Failed to save playback speed.');
      }
    }
  }, [speed]);

  const handlePlayPause = () => setIsPlaying((prev) => !prev);
  const handleSpeedChange = (newSpeed: number) => {
    if (newSpeed > 0) {
      setSpeed(newSpeed);
      setSuccessMessage(t('speed_saved'));
    } else {
      setErrorMessage(t('speed_saved_error'));
    }
  };
  // Clear success and error messages after a timeout
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(""), 1000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(""), 1000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

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
      {successMessage && (
        <div className="message success">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="message error">
          {errorMessage}
        </div>
      )}
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
