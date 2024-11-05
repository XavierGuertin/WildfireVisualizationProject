'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import {MatProgressBar} from '@angular/material/progress-bar';

const SimulationControls = () => {

    const [sliderValue, setSliderValue] = useState(0);

    const handleSliderChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(Number(event.target.value));
    };

    return (
        <div >
            <div style={{ width: '100%', backgroundColor: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    style={{ width: '100%', marginTop: '10px' }}
                    />
            </div>
        </div>
    );
};

export default SimulationControls;