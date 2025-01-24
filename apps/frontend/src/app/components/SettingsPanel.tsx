import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/SettingsPanel.css';
import { IoSettingsOutline, IoLanguage, IoCheckmark, IoTrashOutline, IoDownloadOutline } from 'react-icons/io5';
import { PiArrowClockwiseFill } from "react-icons/pi";
import { resetCollections } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const SettingsPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [dropdownState, setDropdownState] = useState<{
    activeButton: string | null;
    isOpen: boolean;
  }>({ activeButton: null, isOpen: false });

  const [newApiEndpoint, setNewApiEndpoint] = useState<string>("https://default-api-endpoint.com");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (buttonName: string) => {
    setDropdownState((prevState) => ({
      activeButton: prevState.activeButton === buttonName ? null : buttonName,
      isOpen: prevState.activeButton !== buttonName,
    }));
  };

  const handleSaveEndpoint = () => {
    if (isValidUrl(newApiEndpoint)) {
      toast.success(`${t('api_endpoint')} ${t('save')}: ${newApiEndpoint}`);
      setDropdownState({ activeButton: null, isOpen: false });
    } else {
      toast.error(t('invalid_url'));
    }
  };

  const handleCancelEndpoint = () => {
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleLanguageSelect = (language: string) => {
    i18n.changeLanguage(language);
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleReset = () => {
    toast.info(t('reset_initiated'));
    setDropdownState({ activeButton: null, isOpen: false });
  };

  const handleResetDataFromEndpoint = async () => {
    MySwal.fire({
      title: t('reset_data_from_endpoint'),
      text: t('confirm_reset_data_from_endpoint'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t('yes')
    }).then(async (result: { isConfirmed: any }) => {
      if (result.isConfirmed) {
        try {
          const message = await resetCollections();
          toast.success(message);
        } catch (error: any) {
          toast.error(error.message);
        }
      }
    });
  };

  const handleFactoryReset = () => {
    toast.warn(t('factory_reset_initiated'));
    setDropdownState({ activeButton: null, isOpen: false });
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
                  <button onClick={handleSaveEndpoint}>{t('save')}</button>
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
        >
          <IoLanguage size={32} />
        </button>
        {dropdownState.activeButton === 'language' && (
          <div className="dropdown-content show">
            <button onClick={() => handleLanguageSelect('en')}>
              {i18n.language === 'en' ? <IoCheckmark size={24} fill="black" /> : <PiArrowClockwiseFill size={24} fill="none" />}
              {t('english')}
            </button>
            <button onClick={() => handleLanguageSelect('fr')}>
              {i18n.language === 'fr' ? <IoCheckmark size={24} fill="black" /> : <PiArrowClockwiseFill size={24} fill="none" />}
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
        >
          <PiArrowClockwiseFill size={32} />
        </button>
        {dropdownState.activeButton === 'reset' && (
          <div className="dropdown-content show">
            <button onClick={handleReset}>
              <PiArrowClockwiseFill size={24} />
              {t('reset')}
            </button>
            <button onClick={handleResetDataFromEndpoint} style={{ color: '#dc143c' }}>
              <IoDownloadOutline size={24} />
              {t('reset_data_from_endpoint')}
            </button>
            <button onClick={handleFactoryReset} style={{ color: '#dc143c' }}>
              <IoTrashOutline size={24} fill="red" />
              {t('factory_reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
