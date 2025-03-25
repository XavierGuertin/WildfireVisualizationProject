import i18n from '../resources/i18n';
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export const getConfig = async (): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/config`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`${i18n.t('error_fetching_config')}:`, error);
    return { error: i18n.t('error_failed_fetch_config') };
  }
};

export const saveConfig = async (config: any): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error(`${i18n.t('error_saving_config')}:`, error);
    throw new Error(`${i18n.t('error_saving_config')}: ${error.message}`);
  }
};
