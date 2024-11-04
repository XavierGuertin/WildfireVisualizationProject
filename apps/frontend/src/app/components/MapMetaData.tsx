import React from "react";
import styled from "styled-components";

const MetaDataContainer = styled.div`
  font-family: 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  width: 400px; /* Increased width */
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 20px;
  top: 20%;
  z-index: 1000;
`;

const Header = styled.div`
  background-color: #00447E;
  color: #ffffff;
  padding: 10px;
  font-size: 1.2em;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const Content = styled.div`
  padding: 12px;
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr; /* Fixed width for labels, flexible width for values */
  align-items: start;
  gap: 8px;
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-weight: bold;
  color: #333;
  text-align: left;
`;

const Value = styled.span`
  color: #666;
  text-align: left;
`;

const MapMetaData = ({ city = '', name = '', description = '', format = '', processes = '', datasetSource = '' }) => {
  return (
    <MetaDataContainer>
      <Header>{city}</Header>
      <Content>
        <DataRow>
          <Label>Name:</Label>
          <Value>{name}</Value>
        </DataRow>
        <DataRow>
          <Label>Description:</Label>
          <Value>{description}</Value>
        </DataRow>
        <DataRow>
          <Label>Format:</Label>
          <Value>{format}</Value>
        </DataRow>
        <DataRow>
          <Label>Processes:</Label>
          <Value>{processes}</Value>
        </DataRow>
        <DataRow>
          <Label>Dataset Source:</Label>
          <Value>{datasetSource}</Value>
        </DataRow>
      </Content>
    </MetaDataContainer>
  );
};

export default MapMetaData;