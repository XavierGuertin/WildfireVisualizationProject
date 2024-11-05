'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
// import { FaPlayCircle } from "react-icons/fa";
// const PlayPauseButton = './assets/next-button-svgrepo-com.svg';

const playIcon = './assets/play.png';
const pauseIcon = './assets/pause.png';


const SimulationControls = () => {
    const [sliderValue, setSliderValue] = useState(0);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(Number(event.target.value));
    };

    const SliderContainer = styled.div`
    width: 100%;
    display: 
    flex-direction: column;
    align-items: center;
  `;

    const IconButton = styled.button`
    color: #005ea6;
    background: none;
    border: none;
    cursor: pointer;
    //display: flex;
    align-items: center;
    outline: none;
  `;

    const Icon = styled.img`
    width: 30px;
    height: 30px;
    color: #005ea6;
  `;

    return (
            <div style={{width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                <div><input
                    className='louislouis'
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    style={{ width: '80%', marginTop: '10px' }}
                />
                </div>
                {/* <PlayPauseButton></PlayPauseButton> */}
                <div>
                <button style={{color: '#005ea6', background: 'none', cursor: 'pointer', alignItems: 'center'}}>
              
                </button>
                <button style={{color: '#005ea6', background: 'none', cursor: 'pointer', alignItems: 'center'}}>
                    <Icon src={pauseIcon} />
                </button>
                </div>
            {/* </SliderContainer> */}
            </div>
    );
};

export default SimulationControls;
