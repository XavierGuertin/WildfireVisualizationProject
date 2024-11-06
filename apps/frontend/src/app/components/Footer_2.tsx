// 'use client';

import React, { useState } from "react";
import '../styles/footer.css';
import { FaPlayCircle, FaPauseCircle, FaStopCircle } from "react-icons/fa";

const footer_2 = () => {

    const [sliderValue, setSliderValue] = useState(0);
    const [play, setPlay] = useState(false);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(Number(event.target.value));
    };

    const handlePlayPress = () => {
        setPlay(true);
    };

    const handlePausePress = () => {
        setPlay(false);
    };

    const handleStopPress = () => {
        setPlay(false);
        setSliderValue(0);
    };

    return (
        <>
        <div className="footerContainer" >
            <div className="sliderContainer">
                <input
                    className='simulationSlider'
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                />
                <button className="iconButton" onClick={handlePlayPress}><FaPlayCircle className="controlIcon" size={25} /></button>
                <button className="iconButton" onClick={handlePausePress}><FaPauseCircle className="controlIcon" size={25} /></button>
                <button className="iconButton" onClick={handleStopPress}><FaStopCircle className="controlIcon" size={25} /></button>
            </div>
            <div className="speedContainer">
                <p>Speed:</p>
                <p>0.25x</p>
                <p>0.5x</p>
                <p>1x</p>
                <p>1.25x</p>
                <p>1.5x</p>
                <p>2x</p>
            </div>
        </div>
        </>
    );
}

export default footer_2;