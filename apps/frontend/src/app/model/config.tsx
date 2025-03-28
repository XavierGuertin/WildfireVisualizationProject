import { getConfig, saveConfig } from '../services/configApi';
import { toast } from 'react-toastify';

interface LoadedDataset {
  id: string;
  title: string;
}

interface Config {
  endpoint?: string;
  onlineMode: boolean;
  loadedDataset: LoadedDataset | null;
}

export class ConfigService {
  /** Fetches the latest config from the backend with error handling */
  static async getConfig(t: (key: string) => string): Promise<Config | null> {
    try {
      const config = await getConfig();
      return {
        endpoint: config?.endpoint ?? 'No endpoint saved',
        onlineMode: config?.onlineMode ?? true,
        loadedDataset: config?.loadedDataset ?? null,
      };
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error(t('error_fetching_config_file'));
      return null;
    }
  }

  /** Retrieves the currently loaded dataset */
  static async getLoadedDataset(t: (key: string) => string): Promise<LoadedDataset | null> {
    const config = await this.getConfig(t);
    return config?.loadedDataset ?? null;
  }

  /** Updates the loaded dataset in config and persists it to the backend */
  static async setLoadedDataset(dataset: LoadedDataset | null, t: (key: string) => string): Promise<void> {
    const config = await this.getConfig(t);
    if (!config) return;

    try {
      config.loadedDataset = dataset;
      await saveConfig(config);
    } catch (error) {
      console.error('Error updating loadedDataset:', error);
    }
  }

  /** Retrieves the current endpoint */
  static async getEndpoint(t: (key: string) => string): Promise<string> {
    const config = await this.getConfig(t);
    return config?.endpoint ?? 'No endpoint saved';
  }

  /** Updates the endpoint and handles errors properly */
  static async setEndpoint(endpoint: string, t: (key: string) => string): Promise<void> {
    const config = await this.getConfig(t);
    if (!config) return;

    try {
      config.endpoint = endpoint;
      await saveConfig(config);
      toast.success(t('api_endpoint_saved'));
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast.error(t('failed_to_update_endpoint'));
    }
  }

  /** Retrieves the current `onlineMode` state */
  static async getOnlineMode(t: (key: string) => string): Promise<boolean> {
    const config = await this.getConfig(t);
    return config?.onlineMode ?? false;
  }

  /** Updates `onlineMode` in config and persists it to the backend */
  static async setOnlineMode(isOnline: boolean, t: (key: string) => string): Promise<void> {
    const config = await this.getConfig(t);
    if (!config) return;

    try {
      config.onlineMode = isOnline;
      await saveConfig(config);
      toast.success(t('online_mode_saved'));
    } catch (error) {
      console.error('Error updating onlineMode:', error);
      toast.error(t('failed_to_update_online_mode'));
    }
  }

  /** Updates the endpoint and optionally sets the loaded dataset, called for factory reset */
  static async setEndpointAndLoadedDataset(
    endpoint: string,
    t: (key: string) => string,
    dataset: { id: string; title: string } = { id: '', title: '' },
  ): Promise<boolean> {
    const config = await this.getConfig(t);
    if (!config) return false;

    try {
      config.endpoint = endpoint;
      config.loadedDataset = dataset;
      await saveConfig(config);
      toast.success(t('api_endpoint_saved'));
      return true;
    } catch (error) {
      console.error('Error updating endpoint and dataset:', error);
      toast.error(t('failed_to_update_endpoint'));
      return false;
    }
  }

  /** Retrieves both endpoint and onlineMode */
  static async getEndpointAndOnlineMode(t: (key: string) => string): Promise<{
    endpoint: string;
    onlineMode: boolean;
  }> {
    const config = await this.getConfig(t);
    return {
      endpoint: config?.endpoint ?? 'No endpoint saved',
      onlineMode: config?.onlineMode ?? false,
    };
  }

  /** Resets the config to default values in the backend */
  static async resetConfigSettings(t: (key: string) => string): Promise<void> {
    try {
      const defaultConfig: Config = {
        endpoint: 'No endpoint saved',
        onlineMode: true,
        loadedDataset: null,
      };
      await saveConfig(defaultConfig);
      toast.success(t('config_reset_success'));
    } catch (error) {
      console.error('Error resetting config:', error);
      toast.error(t('config_reset_failed'));
    }
  }
}
