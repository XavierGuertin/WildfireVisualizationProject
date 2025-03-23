import React, { useState } from 'react';
import { FaAngleUp, FaAngleRight, FaWind, FaRegCompass } from 'react-icons/fa';
import { BsDropletFill } from 'react-icons/bs';
import { IoIosSettings } from 'react-icons/io';
import { useMapLayerContext } from '../context/MapContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toggleAssetLayer } from './MapView';
import { Map } from 'ol';
import '../styles/AssetsDropdown.css';

const AssetsDropdown = () => {
  const [assetsMenuOpen, setAssetsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const {
    mapRef,
    loadedLayers,
    selectedAssetLayers,
    setSelectedAssetLayers,
    loadedDatasetId,
  } = useMapLayerContext();

  // Function to get the appropriate icon for a layer
  const getLayerIcon = (layerName: string) => {
    switch (layerName) {
      case 'humidity':
        return <BsDropletFill className="layerButtonIcon" />;
      case 'wind_force':
        return <FaWind className="layerButtonIcon" />;
      case 'wind_direction':
        return <FaRegCompass className="layerButtonIcon" />;
      default:
        return <IoIosSettings className="layerButtonIcon" />;
    }
  };

  // Function to format layer name
  const formatLayerName = (name: string): string => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleLayerClick = (layerName: string) => {
    const map = mapRef.current as Map;
    if (!map) {
      toast.error('Map not initialized');
      return;
    }

    // Find the layer data
    const layerData = loadedLayers.find(
      (layer) => layer.asset_name === layerName,
    );
    if (!layerData || !layerData.layer_url) {
      toast.error(`Layer URL not found for ${layerName}`);
      return;
    }

    // Check if this layer is already selected
    const isSelected = selectedAssetLayers.includes(layerName);

    if (isSelected) {
      // Remove from selected layers
      setSelectedAssetLayers((prev) =>
        prev.filter((name) => name !== layerName),
      );
      // Remove from map
      toggleAssetLayer(map, layerName, layerData.layer_url, false);
    } else {
      // Add to selected layers
      setSelectedAssetLayers((prev) => [...prev, layerName]);
      // Add to map
      toggleAssetLayer(map, layerName, layerData.layer_url, true);
    }
  };

  return (
    <>
      {/* isLoadingAssets || !(loadedLayers.length > 0) */}
      {false ? (
        <></>
      ) : (
        <div className="weather-dropdown">
          {/* Clickable header that ONLY toggles the menu */}
          <div
            className="menuHeader"
            onClick={() => setAssetsMenuOpen(!assetsMenuOpen)}
          >
            <span>{t('weather_assets_label')}</span>
            {loadedDatasetId ? (
              <span className="loadedAssetDataset">{loadedDatasetId}</span>
            ) : (
              <></>
            )}
            {assetsMenuOpen ? (
              <FaAngleUp className="dropdown-icon" size={20} />
            ) : (
              <FaAngleRight className="dropdown-icon" size={20} />
            )}
          </div>

          {/* Asset list: Clicking these should NOT close the menu */}
          {assetsMenuOpen && (
            <div className="assets-list-container">
              {loadedLayers.length > 0 &&
                [...loadedLayers]
                  .sort((a, b) => a.asset_name.localeCompare(b.asset_name))
                  .map((layer, index) => (
                    <button
                      key={index}
                      className={`layerButton ${selectedAssetLayers.includes(layer.asset_name) ? 'active' : ''}`}
                      data-testid={`layerButton-${layer.asset_name}`}
                      onClick={() => handleLayerClick(layer.asset_name)}
                    >
                      {getLayerIcon(layer.asset_name)}
                      {formatLayerName(layer.asset_name)}
                    </button>
                  ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AssetsDropdown;
