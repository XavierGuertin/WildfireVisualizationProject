import React, { useState } from 'react';
import '../styles/MapMetaData.css';
import { IoInformationCircle } from 'react-icons/io5';
import { RiCollapseDiagonalFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import {
  fetchItems,
  fetchProgress,
  fetchTimestamps,
  resetItems,
} from '../services/api';
import { useMapLayerContext } from '../context/MapContext';
import LoadingModule from './LoadingModule';
import { toast } from 'react-toastify';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { getConfig, saveConfig } from '../services/configApi';

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
})  => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const MySwal = withReactContent(Swal);
  const { setTimeStamps, isOnline, setSliderValue } = useMapLayerContext();

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
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('yes'),
        customClass: {
          popup: 'custom-swal-popup',
        },
      });

      if (result.isConfirmed) {
        setLoading(true); // Show loading overlay
        localStorage.setItem('sliderValue', '0');
        setSliderValue(0);
        setProgress(0);
        await resetItems();

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
            while (true) {
              const progressResponse = await fetchProgress(id);

              if ('progress' in progressResponse) {
                setProgress(progressResponse.progress);
                const timestamps = await fetchTimestamps();
                setTimeStamps(timestamps);
                // Stop the loop when progress reaches 100%
                if (progressResponse.progress >= 100) {
                  // sleep for 1 second to allow the items to be loaded
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  setLoading(false);
                  toast.success(t("items_fetch_success"), {toastId: 'items-success',});

                  try {
                    const config = await getConfig();
                    config.loadedDataset = id;
                    await saveConfig(config);
                    refreshDatasets?.();
                  } catch (err) {
                    console.error("Error updating loadedDataset in config:", err);
                  }
                  return;
                }
              }

              // Increase the polling interval to 1 second (1000ms)
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          };

          pollProgress(); // Call the async function for polling
        } catch (error) {
          toast.error('Error loading dataset: ' + error),
            { toastId: 'loading-dataset-error' };
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
    <div className="metadata-container">
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
          <LoadingModule
            progress={progress}
            isVisible={loading}
            datasetBeingLoaded={name}
            data-testid="loading-module"
          />
          {t('load_dataset')}
        </button>
      </div>
    </div>
  );

  return <>{isCollapsed ? CollapsedMetaData : NonCollapsedMetaData}</>;
};

export default MapMetaData;
