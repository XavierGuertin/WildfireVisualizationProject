import { getConfig, saveConfig } from '../services/configApi';
import { toast } from 'react-toastify';
//import { useTranslation } from 'react-i18next';

//const { t } = useTranslation();

interface Config {
  endpoint?: string; // Optional in case the API doesn't return it
  onlineMode: boolean;
  loadedDataset: string | null;
}

export class ConfigService {
  /** Fetches the latest config from the backend with error handling */
  static async getConfig(): Promise<Config> {
    try {
      const config = await getConfig();
      return {
        endpoint: config?.endpoint ?? "No endpoint saved",
        onlineMode: config?.onlineMode ?? true,
        loadedDataset: config?.loadedDataset ?? null,
      };
    } catch (error) {
      console.error("Error fetching config:", error);
      throw new Error("Failed to fetch config"); // Throw an error instead of returning an object
    }
  }

  /** Retrieves the currently loaded dataset */
  static async getLoadedDataset(): Promise<string | null> {
    try {
      const config = await this.getConfig();
      return config.loadedDataset || null;
    } catch (error) {
      console.error('Error retrieving loaded dataset:', error);
      return null;
    }
  }

  /** Updates the loaded dataset in config and persists it to the backend */
  static async setLoadedDataset(datasetId: string | null): Promise<void> {
    try {
      const config = await this.getConfig(); // Always get the latest version
      config.loadedDataset = datasetId;
      await saveConfig(config);
    } catch (error) {
      console.error('Error updating loadedDataset:', error);
    }
  }

  /** Retrieves the current endpoint */
  static async getEndpoint(): Promise<string> {
    const config = await this.getConfig();
    return config.endpoint ?? 'No endpoint saved';
  }

  /** Updates the endpoint and handles errors properly */
  static async setEndpoint(endpoint: string, t: (key: string) => string): Promise<void> {
    try {
      const config = await this.getConfig();
      config.endpoint = endpoint;
      await saveConfig(config);
      toast.success(t('api_endpoint_saved'));
    } catch (error) {
      console.error("Error updating endpoint:", error);
      toast.error(t("failed_to_update_endpoint"));
    }
  }

  /** Retrieves the current `onlineMode` state */
  static async getOnlineMode(): Promise<boolean> {
    const config = await this.getConfig();
    return config.onlineMode ?? false; // Default to false if undefined
  }

  /** Updates `onlineMode` in config and persists it to the backend */
  static async setOnlineMode(isOnline: boolean): Promise<void> {
    try {
      const config = await this.getConfig();
      config.onlineMode = isOnline;
      await saveConfig(config);
    } catch (error) {
      console.error("Error updating onlineMode:", error);
    }
  }

  /** Resets the config to default values in the backend */
  static async resetConfigSettings(): Promise<void> {
    try {
      const defaultConfig: Config = {
        endpoint: "No endpoint saved",
        onlineMode: true,
        loadedDataset: null,
      };
      await saveConfig(defaultConfig);
    } catch (error) {
      console.error("Error resetting config:", error);
    }
  }
}
