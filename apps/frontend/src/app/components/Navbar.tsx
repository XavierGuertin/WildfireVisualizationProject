'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

// interface NavbarProps {
//   updateWildfireLayer: (layerName: string) => void;
// }

// Styled components for styling the navbar
const NavbarContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: #030303;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  height: 50px;
  width: 50px;
`;

const ProjectTitle = styled.span`
  color: white;
  margin-left: 10px;
  font-size: 18px;
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
`;

const SearchBar = styled.input`
  padding: 8px;
  margin-right: 1px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
  background-color: transparent;
  color: white;

  &::placeholder {
    color: white;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 10px;
  color: white;

  img {
    height: 30px;
    width: 30px;
    margin-right: 5px;
  }
`;

const Navbar = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

//   const closeSidebar = () => {
//     setSidebarVisible(false);
//   };

  return (
    <>
      <NavbarContainer>
        <LogoContainer>
          <Logo src="/assets/WildFireLogo.png" alt="Logo" />
          <ProjectTitle>Wildfire Visualization Project</ProjectTitle>
        </LogoContainer>
        <NavSection>
          <SearchBar type="text" placeholder="Search for a location..." />
           <NavButton>
            <img src="/assets/location_white.png" alt="Locate Me" />
          </NavButton> 
        </NavSection>
        <NavSection>
          <NavButton onClick={toggleSidebar}>
            <img src="/assets/layers_white.png" alt="Layers" />Layers
          </NavButton>
          <NavButton>
            <img src="/assets/filter_white.png" alt="Filter" />Filter
          </NavButton>
          <NavButton>
            <img src="/assets/user_white.png" alt="Account" />Account
          </NavButton>
        </NavSection>
      </NavbarContainer>
      {isSidebarVisible && <Sidebar />}
    </>
  );
};

export default Navbar;