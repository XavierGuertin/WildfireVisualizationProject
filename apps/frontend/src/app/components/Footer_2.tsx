// 'use client';

import React, { useState } from "react";
import styled from "styled-components";

const playIcon = './assets/play.png';
const pauseIcon = './assets/pause.png';

const footer_2 = () => {

    const [sliderValue, setSliderValue] = useState(0);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(Number(event.target.value));
    };

    const FooterContainer = styled.div`
    width: 90%;
    background: white;
    color: #005ea6;
    position: fixed;
    bottom: 0;
    left: 4%;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    // overflow-y: auto;
    z-index: 1000;
    // border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SliderContainer = styled.div`
    width: 100%;
    display: 
    flex-direction: column;
    align-items: center;
  `;
const Icon = styled.img`
    width: 30px;
    height: 30px;
    color: #005ea6;
`;

const SlideInput = styled.input`
    width: 80%;
    margin-top:
`;

    return (
        <FooterContainer className="footerContainer" 
            // style={{width: '90%', 
            // background: 'white', 
            // color: '#005ea6', 
            // position: 'fixed', 
            // bottom: '0', 
            // left: '4%', 
            // padding: '20px',
            // boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', 
            // display: 'flex',
            // flexDirection: 'row',
            // alignItems: 'center'}}
            >
            <div className="sliderContainer" style={{width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                <input
                    className='SimulationSlider'
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    style={{ width: '80%', marginTop: '10px' }}
                />
                {/* <Icon src={playIcon}/>
                <Icon src={pauseIcon}/> */}
            </div>
            <div className="speedContainer">

            </div>
        </FooterContainer>
    );
}

export default footer_2;