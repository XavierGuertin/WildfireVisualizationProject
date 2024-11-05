'use client';

import React from "react";
import styled from "styled-components";
import SimulationControls from "./SimulationControls";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import { config } from "@fortawesome/fontawesome-svg-core";
// import '@fortawesome/fontawesome-svg-core/styles.css'
// config.autoAddCss = false;

const playIcon = './assets/play.png';
const pauseIcon = './assets/pause.png';

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

const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  //display: flex;
  align-items: center;
  outline: none;
`;

const Footer = () => {
    return (
        <>
            <FooterContainer className="louis">
                <SimulationControls />
            </FooterContainer>
        </>
    );
}

export default Footer;