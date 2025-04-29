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

/**
 * A dropdown menu for displaying and toggling weather-related asset layers
 * like humidity, wind force, and wind direction on the map.
 *
 * This component is conditionally rendered when a dataset is loaded
 * and no processing is ongoing.
 */
const AssetsDropdown = () => {
  const [assetsMenuOpen, setAssetsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const {
    mapRef,
    loadedLayers,
    selectedAssetLayers,
    setSelectedAssetLayers,
    loadedDataset,
    itemIds,
    sliderValue,
    isProcessLoading,
  } = useMapLayerContext();

  /**
   * Returns an appropriate icon based on the layer name.
   *
   * @param layerName - The name of the asset layer
   * @returns A React icon component for the layer
   */
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

  /**
   * Formats asset layer names by replacing underscores with spaces
   * and capitalizing the first letter of each word.
   *
   * @param name - The raw layer name string
   * @returns A formatted layer name
   */
  const formatLayerName = (name: string): string => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /**
   * Handles the user clicking an asset layer button.
   * Toggles the visibility of the layer on the map.
   *
   * @param layerName - The name of the asset layer to toggle
   */
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
    if (!layerData?.layer_url) {
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
      toggleAssetLayer(
        map,
        layerName,
        layerData.layer_url,
        false,
        layerData.min,
        layerData.max,
      );
    } else {
      // Add to selected layers
      setSelectedAssetLayers((prev) => [...prev, layerName]);
      // Add to map
      toggleAssetLayer(
        map,
        layerName,
        layerData.layer_url,
        true,
        layerData.min,
        layerData.max,
      );
    }
  };

  return (
    <>
      {/* Only show weather assets menu if assets loaded and no process is loading */}
      {loadedDataset.title && !isProcessLoading ? (
        <div className="weather-dropdown">
          {/* Clickable header that toggles the menu */}
          <div
            className="menuHeader"
            onClick={() => setAssetsMenuOpen(!assetsMenuOpen)}
          >
            <span>{t('weather_assets_label')}</span>
            <span className="loadedAssetDataset">{loadedDataset.title}</span>
            {assetsMenuOpen ? (
              <FaAngleUp className="dropdown-icon" size={20} />
            ) : (
              <FaAngleRight className="dropdown-icon" size={20} />
            )}
          </div>
          {/* Render the asset options when menu is open, orelse show loading spinner */}
          {assetsMenuOpen && (
            <div className="assets-list-container">
              {loadedLayers.length > 0 ? (
                [...loadedLayers]
                  .sort((a, b) => a.asset_name.localeCompare(b.asset_name))
                  .filter((a) => a.item_id === itemIds[sliderValue])
                  .map((layer) => (
                    <button
                      key={layer.asset_name}
                      className={`layerButton ${selectedAssetLayers.includes(layer.asset_name) ? 'active' : ''}`}
                      data-testid={`layerButton-${layer.asset_name}`}
                      onClick={() => handleLayerClick(layer.asset_name)}
                    >
                      {getLayerIcon(layer.asset_name)}
                      {formatLayerName(layer.asset_name)}
                    </button>
                  ))
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    borderRadius: '4px',
                  }}
                >
                  <div className="spinner"></div>
                  <span>{t('loading_label')}</span>
                </div>

              )}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default AssetsDropdown;
