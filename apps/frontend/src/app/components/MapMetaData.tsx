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
import { useQuery, useMutation, useQueryClient } from 'react-query';

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
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const animationRef = useRef<number | null>(null);
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
    setIsPlaying,
  } = useMapLayerContext();

  // Queries
  const { data: configData } = useQuery(['config'], () => getConfig(), {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data: timestampsData } = useQuery(['timestamps'], () => fetchTimestamps(), {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (data) => setTimeStamps(data),
  });

  const { data: itemIdsData } = useQuery(['itemIds'], () => fetchItemIds(), {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (data) => setItemIds(data),
  });

  // Mutations
  const resetItemsMutation = useMutation(() => resetItems(), {
    onSuccess: () => queryClient.invalidateQueries(['items']),
  });

  const resetItemAssetsMutation = useMutation(() => resetItemAssets(), {
    onSuccess: () => queryClient.invalidateQueries(['itemAssets']),
  });

  const fetchItemsMutation = useMutation((id: string) => fetchItems(id), {
    onSuccess: () => queryClient.invalidateQueries(['items']),
  });

  const loadAssetsMutation = useMutation((id: string) => loadAssets(id), {
    onSuccess: () => queryClient.invalidateQueries(['itemAssets']),
  });

  const saveConfigMutation = useMutation((config: any) => saveConfig(config), {
    onSuccess: (data) => queryClient.setQueryData(['config'], data),
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = containerRef.current.offsetWidth;
    containerRef.current.style.willChange = 'width';
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const dx = e.clientX - startXRef.current;
      let newWidth = startWidthRef.current + dx;
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      containerRef.current.style.width = `${newWidth}px`;
    },
    [isResizing, maxWidth, minWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizing || !containerRef.current) return;
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

    const result = await MySwal.fire({
      title: t('load_dataset'),
      text: t('confirm_deletion_items_from_previous_collection'),
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: t('no'),
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yes'),
      customClass: { popup: 'custom-swal-popup' },
    });

    if (!result.isConfirmed) return;

    try {
      setTargetLoading(t('collection_items'));
      setLoading(true);
      setIsProcessLoading(true);
      localStorage.setItem('sliderValue', '0');
      setSliderValue(0);
      setProgress(0);

      await resetItemsMutation.mutateAsync();
      await resetItemAssetsMutation.mutateAsync();
      setLoadedLayers([]);
      setSelectedAssetLayers([]);
      setIsPlaying(false);

      if (mapRef.current) {
        const map = mapRef.current;
        const layersToRemove = map
          .getLayers()
          .getArray()
          .filter((layer) => {
            const id = layer.get('id');
            return id !== 'baseLayer' && id !== 'dataLayer';
          });
        layersToRemove.forEach((layer) => map.removeLayer(layer));
      }

      const response = await fetchItemsMutation.mutateAsync(id);
      if (response !== 'Fetching started in the background. Check progress separately.') {
        throw new Error(t('timestamps_fetch_error'));
      }
      toast.success(t('timestamps_fetch_success'), { toastId: 'timestamps-success' });

      // Poll progress for items
      const pollProgress = async () => {
        let lastProgress = -1;
        let stableCount = 0;
        const maxStableCount = 10;

        const config = configData || (await queryClient.fetchQuery(['config'], () => getConfig()));
        config.loadedDataset = { id: '', title: '' };
        await saveConfigMutation.mutateAsync(config);
        refreshDatasets?.();

        while (true) {
          const progressResponse = await queryClient.fetchQuery(
            ['progress', id],
            () => fetchProgress(id),
            { staleTime: 1000 } // Short stale time for polling
          );

          if ('progress' in progressResponse) {
            const currentProgress = progressResponse.progress;
            setProgress(currentProgress);

            if (timestampsData) setTimeStamps(timestampsData);
            if (itemIdsData) setItemIds(itemIdsData);
            setCollectionId(id);

            if (currentProgress === lastProgress) {
              stableCount++;
            } else {
              stableCount = 0;
              lastProgress = currentProgress;
            }

            if (currentProgress >= 100 || stableCount >= maxStableCount) {
              if (currentProgress < 100) setProgress(100);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              setLoading(false);
              toast.success(t('items_fetch_success'), { toastId: 'items-success' });
              break;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      };

      await pollProgress();
      setTargetLoading(t('collection_item_assets'));
      setLoading(true);
      setProgress(0);

      await loadAssetsMutation.mutateAsync(id);

      // Poll progress for assets
      const pollAssetProgress = async () => {
        while (true) {
          const progressResponse = await queryClient.fetchQuery(
            ['progress', id + '_assets'],
            () => fetchProgress(id + '_assets'),
            { staleTime: 1000 }
          );

          if ('progress' in progressResponse) {
            setProgress(progressResponse.progress);
            if (progressResponse.progress >= 100) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              setLoading(false);
              toast.success(t('assets_fetch_success'), { toastId: 'assets-success' });

              const config = configData || (await queryClient.fetchQuery(['config'], () => getConfig()));
              config.loadedDataset = { id, title: name };
              await saveConfigMutation.mutateAsync(config);
              refreshDatasets?.();
              setIsProcessLoading(false);
              break;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      };

      await pollAssetProgress();
    } catch (error) {
      toast.error(`Error loading dataset: ${error.message}`, {
        toastId: 'loading-dataset-error',
      });
      setLoading(false);
      setIsProcessLoading(false);
    }
  };

  if (!visible) return null;

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
          { label: t('description'), value: description, testId: 'dataset-description' },
          { label: t('format'), value: format, testId: 'dataset-format' },
          { label: t('processes'), value: processes, testId: 'dataset-processes' },
          { label: t('dataset_source'), value: datasetSource, testId: 'dataset-datasource' },
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
      <div className="resize-handle" ref={resizeRef} onMouseDown={handleMouseDown} title="Drag to resize" />
    </div>
  );

  return <>{isCollapsed ? CollapsedMetaData : NonCollapsedMetaData}</>;
};

export default MapMetaData;
