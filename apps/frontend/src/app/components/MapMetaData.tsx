import React from "react";
import styled from "styled-components";

const MetaDataComponentDiv = styled.div`
    display:flex;
    flex-direction:column;
    outline: 2px solid black;
    border-radius: 10px;
    width: 300px;
`;

const CityDiv = styled.div`
    display:flex;
    flex-direction:column;
    flex-wrap: wrap;
    height:auto;
    align-items:flex-start;
    padding-left: 10px;
    border-bottom-style: solid;
    border-bottom-width: 2px;
    background-color:yellow;
`;

const CityHeader = styled.p`
    width:100%;
    font-size: 20px;
    font-weight:bold;
    margin-top:9px;
    white-space:normal;
    flex-shrink:1;
    overflow-wrap: break-word;
`;

const DefinitionDiv = styled.div`
    display: flex;
    flex-direction: column;
    padding-left: 10px;
    padding-bottom:5px;

`;

const DefinitionParameterDiv = styled.div`
    display:grid;
    grid-template-columns: 120px auto;
    height:auto;
`;

const DefinitionParameterHeader = styled.p`
    margin-top:2px;
    margin-bottom:2px;
    font-size: 15px;
    font-weight: bold;
    width:120px;
    overflow-wrap: break-word;
`;

const DefinitionParameterValue = styled.p`
    margin-top:2px;
    margin-bottom:2px;
    font-size: 15px;
    width:120px;
    overflow-wrap: break-word;
`;
const MapMetaData = ({city = '', name = '', description = '', format = '', processes = '', datasetSource = '' }) => {

    return <>
    <MetaDataComponentDiv className="metadata-component-div">    
        <CityDiv className="city-div">
            <CityHeader id="city-name">{city}</CityHeader>
        </CityDiv>
        <DefinitionDiv className="definition-div">
            <DefinitionParameterDiv className="definition-name">
                <DefinitionParameterHeader id="definition-name-descriptor">Name:</DefinitionParameterHeader>
                <DefinitionParameterValue id="definition-name-value">{name}</DefinitionParameterValue>
            </DefinitionParameterDiv>
            <DefinitionParameterDiv className="definition-description">
                <DefinitionParameterHeader id="definition-description-descriptor">Description:</DefinitionParameterHeader>
                <DefinitionParameterValue id="definition-description-value">{description}</DefinitionParameterValue>
            </DefinitionParameterDiv>
            <DefinitionParameterDiv className="definition-format">
                <DefinitionParameterHeader id="definition-format-descriptor">Format:</DefinitionParameterHeader>
                <DefinitionParameterValue id="definition-format-value">{format}</DefinitionParameterValue>
            </DefinitionParameterDiv>
            <DefinitionParameterDiv className="definition-processes">
                <DefinitionParameterHeader id="definition-processes-descriptor">Processes:</DefinitionParameterHeader>
                <DefinitionParameterValue id="definition-processes-value">{processes}</DefinitionParameterValue>
            </DefinitionParameterDiv>
            <DefinitionParameterDiv className="definition-datasetSource">
                <DefinitionParameterHeader id="definition-datasetSource-descriptor">Dataset Source:</DefinitionParameterHeader>
                <DefinitionParameterValue id="definition-datasetSource-value">{datasetSource}</DefinitionParameterValue>
            </DefinitionParameterDiv>
        </DefinitionDiv>
    </MetaDataComponentDiv>

    </>
}

export default MapMetaData;