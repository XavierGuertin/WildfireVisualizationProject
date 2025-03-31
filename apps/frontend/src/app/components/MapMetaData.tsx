import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/MapMetaData.css';
import { IoInformationCircle } from 'react-icons/io5';
import { RiCollapseDiagonalFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import {
  fetchItems,
  fetchProgress,
  fetchTimestamps,
  resetItemAssets,
  resetItems,
  loadAssets,
  fetchItemIds,
} from '../services/api';
import { useMapLayerContext } from '../context/MapContext';
import LoadingModule from './LoadingModule';
import { toast } from 'react-toastify';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { getConfig, saveConfig } from '../services/configApi';
import AssetsDropdown from './AssetsDropdown';

interface MapMetaDataProps {
  id?: string;
  name?: string;
  description?: string;
  format?: string;
  processes?: string;
  datasetSource?: string;
  onClose: () => void;
  visible: boolean;
  refreshDatasets: () => void;
}

const MapMetaData: React.FC<MapMetaDataProps> = ({
                                                   id = '',
                                                   name = '',
                                                   description = '',
                                                   format = '',
                                                   processes = '',
                                                   datasetSource = '',
                                                   visible,
                                                   refreshDatasets,
                                                 }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const animationRef = useRef<number | null>(null); // Initialize as null
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targetLoading, setTargetLoading] = useState(name);

  const maxWidth = typeof window !== 'undefined' ? window.innerWidth / 3 : 500;
  const minWidth = 300;

  const MySwal = withReactContent(Swal);
  const {
    setTimeStamps,
    isOnline,
    setSliderValue,
    setCollectionId,
    setLoadedLayers,
    setItemIds,
    setIsProcessLoading,
    setSelectedAssetLayers,
    mapRef,
    setIsPlaying
  } = useMapLayerContext();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = containerRef.current.offsetWidth;

    // Hint browser about upcoming changes for better performance
    if (containerRef.current) {
      containerRef.current.style.willChange = 'width';
    }

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const dx = e.clientX - startXRef.current;
    let newWidth = startWidthRef.current + dx;

    // Apply constraints
    newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

    // DIRECT DOM UPDATE (no React state lag)
    containerRef.current.style.width = `${newWidth}px`;
  }, [isResizing, maxWidth, minWidth]);

  const handleMouseUp = useCallback(() => {
    if (!isResizing || !containerRef.current) return;

    // Only update React state AFTER dragging finishes
    setWidth(containerRef.current.offsetWidth);
    containerRef.current.style.willChange = 'auto';
    setIsResizing(false);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const onLoadDataset = async () => {
    if (!isOnline) {
      toast.error(`${t('disabled')} - ${t('no_internet_access')}`, {
        toastId: 'online-disabled',
      });
      return;
    }

    try {
      const result = await MySwal.fire({
        title: t('load_dataset'),
        text: t('confirm_deletion_items_from_previous_collection'),
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: t('no'),
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('yes'),
        customClass: {
          popup: 'custom-swal-popup',
        },
      });

      if (result.isConfirmed) {
        setTargetLoading(t('collection_items'));
        setLoading(true); // Show loading overlay
        setIsProcessLoading(true);
        localStorage.setItem('sliderValue', '0');
        setSliderValue(0);
        setProgress(0);
        await resetItems();
        await resetItemAssets();
        setLoadedLayers([]);
        setSelectedAssetLayers([]);
        setIsPlaying(false);
        if (mapRef.current) {
          const map = mapRef.current;

          // Remove all layers except those with ID 'baseLayer' or 'dataLayer'
          const layersToRemove = map.getLayers().getArray().filter((layer) => {
            const id = layer.get('id');
            return id !== 'baseLayer' && id !== 'dataLayer';
          });

          layersToRemove.forEach((layer) => {
            map.removeLayer(layer);
          });
        }

        try {
          // Start fetching items asynchronously
          const response = await fetchItems(id);
          if (
            response !=
            'Fetching started in the background. Check progress separately.'
          ) {
            throw new Error(t('timestamps_fetch_error'));
          }
          toast.success(t('timestamps_fetch_success'), {
            toastId: 'timestamps-success',
          });

          const pollProgress = async () => {
            let lastProgress = -1;
            let stableCount = 0;
            const maxStableCount = 10; // e.g., 10 seconds with 1s interval

            // Set the config attribute for loadedDataset and refreshDatasets list to update state
            try {
              const config = await getConfig();
              config.loadedDataset = { id: "", title: "" };
              await saveConfig(config);
              refreshDatasets?.();
            } catch (err) {
              console.error(
                'Error updating loadedDataset in config:',
                err,
              );
            }

            while (true) {
              const progressResponse = await fetchProgress(id);

              if ('progress' in progressResponse) {
                const currentProgress = progressResponse.progress;
                setProgress(currentProgress);

                const timestamps = await fetchTimestamps();
                setTimeStamps(timestamps);
                const itemIds = await fetchItemIds();
                setItemIds(itemIds);
                setCollectionId(id);

                if (currentProgress === lastProgress) {
                  stableCount++;
                } else {
                  stableCount = 0;
                  lastProgress = currentProgress;
                }

                // Consider done if stable for too long or if progress reaches 100
                if (currentProgress >= 100 || stableCount >= maxStableCount) {
                  // Optional: Set progress to 100 if stuck
                  if (currentProgress < 100) {
                    setProgress(100);
                  }

                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  setLoading(false);
                  toast.success(t('items_fetch_success'), {
                    toastId: 'items-success',
                  });

                  return;
                }
              }

              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          };

          await pollProgress();
          setTargetLoading(t('collection_item_assets'));
          setLoading(true);
          setProgress(0);

          await loadAssets(id); // triggers backend async processing

          // Now start polling for progress on the asset load
          const pollAssetProgress = async () => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
              const progressResponse = await fetchProgress(id + '_assets');

              if ('progress' in progressResponse) {
                setProgress(progressResponse.progress);

                if (progressResponse.progress >= 100) {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  setLoading(false);
                  toast.success(t('assets_fetch_success'), {
                    toastId: 'assets-success',
                  });

                  // Set the config attribute for loadedDataset and refreshDatasets list to update state
                  try {
                    const config = await getConfig();
                    config.loadedDataset = { id: id, title: name };
                    await saveConfig(config);
                    refreshDatasets?.();
                    setIsProcessLoading(false);
                  } catch (err) {
                    console.error(
                      'Error updating loadedDataset in config:',
                      err,
                    );
                  }

                  return;
                }
              }

              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          };

          pollAssetProgress();
        } catch (error) {
          toast.error(`Error loading dataset: ${error}`, {
            toastId: 'loading-dataset-error'
          });
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading dataset:', error);
      setLoading(false);
    }
  };

  if (!visible) return null; // Return null if not visible

  const CollapsedMetaData = (
    <div
      data-testid="collapsedMetaData"
      className="metadata-container-collapsed"
      onClick={toggleCollapse}
    >
      <IoInformationCircle size={36} fill="white" />
      <span className="collapsed-name">{t('metadata')}</span>
    </div>
  );

  const NonCollapsedMetaData = (
    <div
      className="metadata-container"
      ref={containerRef}
      style={{ width: `${width}px` }}
      data-testid="metadata-container"
    >
      <div className="header" onClick={toggleCollapse} data-testid="name-div">
        {name || t('unknown_name')}
        <span className="collapse-icon">
          <RiCollapseDiagonalFill size={20} />
        </span>
      </div>
      <div className="content">
        {[
          {
            label: t('description'),
            value: description,
            testId: 'dataset-description',
          },
          { label: t('format'), value: format, testId: 'dataset-format' },
          {
            label: t('processes'),
            value: processes,
            testId: 'dataset-processes',
          },
          {
            label: t('dataset_source'),
            value: datasetSource,
            testId: 'dataset-datasource',
          },
        ].map(({ label, value, testId }) => (
          <div className="data-row" key={label}>
            <div className="label">{label}:</div>
            <div
              className={`value ${testId === 'dataset-description' ? 'scrollable-description' : ''}`}
              data-testid={testId}
            >
              {value || t('n_a')}
            </div>
          </div>
        ))}
        <button
          className="load-dataset-button"
          onClick={onLoadDataset}
          data-testid="load-dataset-button"
        >
          {t('load_dataset')}
        </button>
        <LoadingModule
          progress={progress}
          isVisible={loading}
          datasetBeingLoaded={targetLoading}
          data-testid="loading-module"
        />
        <AssetsDropdown />
      </div>
      {/* Resize handle */}
      <div
        className="resize-handle"
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  );

  return <>{isCollapsed ? CollapsedMetaData : NonCollapsedMetaData}</>;
};

export default MapMetaData;
