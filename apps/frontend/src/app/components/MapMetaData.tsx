import React, { useState } from "react";
import "../styles/MapMetaData.css"

interface MapMetaDataProps {
  city: string;
  name: string;
  description: string;
  format: string;
  processes: string;
  datasetSource: string;
  onLoadDataset: () => void;
}

const MapMetaData: React.FC<MapMetaDataProps> = ({
  city,
  name,
  description,
  format,
  processes,
  datasetSource,
  onLoadDataset,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const nonCollapsedMetaData = 
    <div className="metadata-container">
      <div className="header" onClick={() => setIsCollapsed(!isCollapsed)} data-testid="city-div">{city}</div >
      <div className="content">
        <div className="data-row">
          <div className="label">Name:</div>
          <div className="value" data-testid="dataset-name">{name}</div>
        </div>
        <div className="data-row">
          <div className="label">Description:</div>
          <div className="value" data-testid="dataset-description">{description}</div>
        </div>
        <div className="data-row">
          <div className="label">Format:</div>
          <div className="value" data-testid="dataset-format">{format}</div>
        </div>
        <div className="data-row">
          <div className="label">Processes:</div>
          <div className="value" data-testid="dataset-processes">{processes}</div>
        </div>
        <div className="data-row">
          <div className="label">Dataset Source:</div>
          <div className="value" data-testid="dataset-datasource">{datasetSource}</div>
        </div>
        <button 
        className="load-dataset-button" onClick={onLoadDataset} data-testid="load-dataset-button"> Load Dataset
        </button>
      </div>
    </div>  

  const collapsedMetaData = 
      <div data-testid="collapsedMetaData" className="metadata-container-collapsed" onClick={() => setIsCollapsed(!isCollapsed)}>
              <svg className="collapsed-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              {/* <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
              <path fill="white" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
              <span className="collapsed-name">Metadata</span>
      </div>
      
  return (
  <>
    {isCollapsed ? collapsedMetaData: nonCollapsedMetaData}
  </>
  );
};

export default MapMetaData;