import React, { useState } from "react";
import "../styles/MapMetaData.css"
import { IoInformationCircle  } from "react-icons/io5";

interface MapMetaDataProps {
  city?: string;
  name?: string;
  description?: string;
  format?: string;
  processes?: string;
  datasetSource?: string;
}

const MapMetaData: React.FC<MapMetaDataProps> = ({
  city = "",
  name = "",
  description = "",
  format = "",
  processes = "",
  datasetSource = "",
}) => {
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const CollapsedMetaData = (
    <div data-testid="collapsedMetaData" className="metadata-container-collapsed" onClick={toggleCollapse}>
        <IoInformationCircle size={36} fill="white"/>
        <span className="collapsed-name">Metadata</span>
    </div>
  );

  const NonCollapsedMetaData = (
    <div className="metadata-container">
      <div
        className="header"
        onClick={toggleCollapse}
        data-testid="city-div"
      >
        {city}
      </div>
      <div className="content">
        {[
          { label: "Name", value: name, testId: "dataset-name" },
          { label: "Description", value: description, testId: "dataset-description" },
          { label: "Format", value: format, testId: "dataset-format" },
          { label: "Processes", value: processes, testId: "dataset-processes" },
          { label: "Dataset Source", value: datasetSource, testId: "dataset-datasource" },
        ].map(({ label, value, testId }) => (
          <div className="data-row" key={label}>
            <div className="label">{label}:</div>
            <div className="value" data-testid={testId}>
              {value || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
  <>
    {isCollapsed ? CollapsedMetaData: NonCollapsedMetaData}
  </>
  );
};

export default MapMetaData;