'use client';

import React from "react";
import styled from "styled-components";
import SimulationControls from "./SimulationControls";

const FooterDiv = styled.div`
    position:fixed;
    width:100%;
    left:0;
    bottom:0;
    text-align:flex;
`;

const Footer = () => {
    return (
        <>
            <FooterDiv className="louis">
                <SimulationControls />
            </FooterDiv>
        </>
    );
}

export default Footer;