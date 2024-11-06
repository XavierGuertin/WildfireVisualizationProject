// 'use client';

import React, { useState } from "react";
import '../styles/global.css';

const footer_2 = () => {

    const [sliderValue, setSliderValue] = useState(0);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(Number(event.target.value));
    };

    return (
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
            </div>
            <div className="speedContainer">

            </div>
        </div>
    );
}

export default footer_2;