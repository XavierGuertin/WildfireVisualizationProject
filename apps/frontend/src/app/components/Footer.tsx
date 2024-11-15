import React, { useState, useEffect, useRef } from 'react';
import '../styles/footer.css';
import { FaPlayCircle, FaPauseCircle, FaStopCircle } from 'react-icons/fa';

const Footer = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

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

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(event.target.value));
  };

  const handleStopPress = () => {
    setIsPlaying(false);
    setSliderValue(0);
  };

  return (
    <div className="footerContainer" data-testid="footer-container">
      <div className="speedContainer">
        {[0.5, 1, 1.5, 2, 4].map((s) => (
          <button
            className="speedButton"
            key={s}
            onClick={() => handleSpeedChange(s)}
            style={{ borderColor: speed === s ? '#00467E' : 'white' }}
            data-testid={`speed-button-${s}`}
          >
            {s}x
          </button>
        ))}
      </div>
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
