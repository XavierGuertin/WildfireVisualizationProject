import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/SettingsPanel.css';
import {
  IoCheckmark,
  IoLanguage,
  IoSettingsOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { PiArrowClockwiseFill } from 'react-icons/pi';
import {
  fetchCollectionsFromEndpoint,
  resetCollections,
} from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const IS_NOT_FACTORY_RESET = false;
const IS_FACTORY_RESET = true;

const SettingsPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [dropdownState, setDropdownState] = useState<{
    activeButton: string | null;
    isOpen: boolean;
  }>({ activeButton: null, isOpen: false });

  const [newApiEndpoint, setNewApiEndpoint] = useState<string>("https://default-api-endpoint.com");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize language from local storage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Toggles dropdown state
  const toggleDropdown = (buttonName: string) => {
    setDropdownState((prevState) => ({
      activeButton: prevState.activeButton === buttonName ? null : buttonName,
      isOpen: prevState.activeButton !== buttonName,
    }));
  };

  const handleSaveAndFetchEndpoint = async (endpoint: string) => {
    // This section is dependent on the task that
    // enables the user to save the endpoint in the config
    if (isValidUrl(endpoint)) {
      const message = await fetchCollectionsFromEndpoint();
      toast.success(message);

      toast.success(t('api_endpoint_saved'));
      setDropdownState({ activeButton: null, isOpen: false });
    } else {
      toast.error(t('invalid_url'));
    }
  };

  const handleCancelEndpoint = () => {
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleLanguageSelect = (language: string) => {
    try {
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
      setSuccessMessage(t('language_saved'));
    } catch (error) {
      setErrorMessage(t('language_save_error'));
    }
    setDropdownState({ activeButton: null, isOpen: false });
  };

  // Closes the success or error message after 2 seconds
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage(null);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);
      
  const handleReset = () => {
    handleResetDataFromEndpoint(IS_NOT_FACTORY_RESET).then(() =>
      setDropdownState({ activeButton: null, isOpen: false }),
    );
  };

  const handleFactoryReset = () => {
    handleResetDataFromEndpoint(IS_FACTORY_RESET).then(() =>
      setDropdownState({ activeButton: null, isOpen: false }),
    );
  };

  const handleResetDataFromEndpoint = async (isFactoryReset: boolean) => {
    MySwal.fire({
      title: isFactoryReset ? t('factory_reset') : t('reset'),
      text: isFactoryReset
        ? t('confirm_factory_reset_data_from_endpoint')
        : t('confirm_reset_data_from_endpoint'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yes'),
      customClass: {
        popup: 'custom-swal-popup',
      },
    }).then(async (result: { isConfirmed: any }) => {
      if (result.isConfirmed) {
        try {
          if (isFactoryReset) {
            // Phil/Ali you can put your reset config method call here
            // (instead of ResetCollections but make sure to also call
            // the resetCollections endpoint)
            const message = await resetCollections();
            toast.success(message);
          } else {
            const message = await resetCollections();
            toast.success(message);
          }

          MySwal.fire({
            title: t('api_endpoint'),
            input: 'text',
            inputPlaceholder: 'https://default-api-endpoint.com',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            showCancelButton: true,
            confirmButtonText: t('save'),
            cancelButtonText: t('cancel'),
          }).then((result) => {
            if (result.isConfirmed) {
              handleSaveAndFetchEndpoint(result.value);
            }
          });
        } catch (error: any) {
          toast.error(error.message);
        }
      }
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownState({ activeButton: null, isOpen: false });
      }
    };

    if (dropdownState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownState.isOpen]);

  return (
    <div className="button-container" ref={dropdownRef}>
      <ToastContainer />
      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'settings' ? 'active' : ''}`}
          onClick={() => toggleDropdown('settings')}
          aria-expanded={dropdownState.activeButton === 'settings'}
          aria-label="settings"
        >
          <IoSettingsOutline size={32} />
        </button>
        {dropdownState.activeButton === 'settings' && (
          <div className="dropdown-content show">
            <div className="settings-prompt">
              <label htmlFor="api-endpoint-input">{t('api_endpoint')}:</label>
              <div className="settings-prompt-row">
                <input
                  id="api-endpoint-input"
                  type="text"
                  placeholder={t('enter_new_api_endpoint')}
                  value={newApiEndpoint}
                  onChange={(e) => setNewApiEndpoint(e.target.value)}
                />
                <div className="settings-prompt-buttons">
                  <button
                    onClick={() => handleSaveAndFetchEndpoint(newApiEndpoint)}
                  >
                    {t('save')}
                  </button>
                  <button onClick={handleCancelEndpoint}>{t('cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'language' ? 'active' : ''}`}
          onClick={() => toggleDropdown('language')}
          aria-expanded={dropdownState.activeButton === 'language'}
          aria-label="language"
        >
          <IoLanguage size={32} />
        </button>
        {dropdownState.activeButton === 'language' && (
          <div className="dropdown-content show">
            <button onClick={() => handleLanguageSelect('en')}>
              {i18n.language === 'en' ? (
                <IoCheckmark size={24} fill="black" />
              ) : (
                <PiArrowClockwiseFill size={24} fill="none" />
              )}
              {t('english')}
            </button>
            <button onClick={() => handleLanguageSelect('fr')}>
              {i18n.language === 'fr' ? (
                <IoCheckmark size={24} fill="black" />
              ) : (
                <PiArrowClockwiseFill size={24} fill="none" />
              )}
              {t('french')}
            </button>
          </div>
        )}
      </div>

      <div className="dropdown-button">
        <button
          className={`button ${dropdownState.activeButton === 'reset' ? 'active' : ''}`}
          onClick={() => toggleDropdown('reset')}
          aria-expanded={dropdownState.activeButton === 'reset'}
          aria-label="reset"
        >
          <PiArrowClockwiseFill size={32} />
        </button>
        {dropdownState.activeButton === 'reset' && (
          <div className="dropdown-content show">
            <button onClick={handleReset}>
              <PiArrowClockwiseFill size={24} />
              {t('reset')}
            </button>
            <button onClick={handleFactoryReset} style={{ color: '#dc143c' }}>
              <IoTrashOutline size={24} fill="red" />
              {t('factory_reset')}
            </button>
          </div>
        )}
      </div>
      {/* Success/ Error Message */}
      {successMessage && (
        <div className="message success">
          <IoCheckmark size={24} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="message error">
          <IoTrashOutline size={24} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
