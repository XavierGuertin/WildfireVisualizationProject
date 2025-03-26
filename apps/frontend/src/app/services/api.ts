import i18n from '../resources/i18n';
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

/**
 * Fetches collections from the backend, optionally filtered by bounding box (BBOX).
 *
 * @param bbox Optional bounding box filter [minX, minY, maxX, maxY].
 * @returns A promise resolving to an array of collections or an error object.
 */
export const returnListOfCollectionsFromEndpoint = async (
  bbox?: number[]
): Promise<
  | {
  id: string;
  key: number;
  bbox: number[][];
}[]
  | { error: string }
> => {
  try {
    const url = new URL(`${BASE_URL}/api/get-collections`);
    if (bbox) {
      url.searchParams.set('bbox', bbox.join(','));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`${i18n.t('error_http_status')}: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_collections'), error.message);
    return { error: i18n.t('error_failed_fetch_data') };
  }
};

export const fetchCollectionsFromEndpoint = async (
  endpoint_url: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/fetch-collections?endpointUrl=${endpoint_url}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error(i18n.t('error_fetching_collections'), error);
    throw new Error(`${i18n.t('error_failed_fetch_data')}: ${error.message}`);
  }
};

export const verifyIfEndpointHasCollections = async (
  endpoint_url: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/verify-collections?endpointUrl=${encodeURIComponent(endpoint_url)}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error(i18n.t('error_checking_collections'), error);
    throw new Error(`${i18n.t('error_checking_collections')}: ${error.message}`);
  }
};

export const resetCollections = async (): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/reset-collections`);
    if (!response.ok) {
      throw new Error(`${i18n.t('error_http_status')}: ${response.status}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error(i18n.t('error_resetting_collections'), error);
    throw new Error(`${i18n.t('error_resetting_collections')}: ${error.message}`);
  }
};

export const resetItems = async (): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/reset-items`);
    if (!response.ok) {
      throw new Error(`${i18n.t('error_http_status')}: ${response.status}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error(i18n.t('error_resetting_items'), error);
    throw new Error(`${i18n.t('error_resetting_items')}: ${error.message}`);
  }
};

export const fetchMetaData = async (collectionId: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/metadata/${collectionId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();

    const links = JSON.parse(data[0].links.value);
    let items = { rel: '', href: '', type: '' };
    let parent = { rel: '', href: '', type: '' };
    for (const element of links) {
      if (element.rel === 'items') {
        items = element;
      } else if (element.rel === 'parent') {
        parent = element;
      }
    }

    const format = items.type.split('/').pop();

    const sourceLink = parent.href;
    let truncatedSource = '';
    if (sourceLink.endsWith('/'))
      truncatedSource = sourceLink.substring(0, sourceLink.length - 1);

    const source = truncatedSource.split('/').pop()?.toUpperCase();

    const metadata = {
      id: collectionId,
      date: data[0].datetime,
      enddate: data[0].end_datetime,
      datasetSource: source,
      description: data[0].description,
      format: format,
      latestAdded: '',
      latestUpdated: '',
      name: data[0].title,
      processes: ''
    };
    return metadata;
  } catch (error: any) {
    console.error(i18n.t('error_fetching_metadata'), error);
    return { error: i18n.t('error_fetching_metadata') };
  }
};

export const returnCollectionsFromEndpoint = async (): Promise<
  | {
  id: string;
  key: number;
}[]
  | { error: string }
> => {
  try {
    const response = await fetch(`${BASE_URL}/api/get-collections`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_collections'), error);
    return { error: i18n.t('error_failed_fetch_data') };
  }
};

/**
 * Fetches collections from the backend, optionally filtered by bounding box (BBOX), and sorted by name.
 *
 * @param bbox Optional bounding box filter [minX, minY, maxX, maxY].
 * @param sortDirection Optional sort direction ('asc' or 'desc'), defaults to 'asc'.
 * @returns A promise resolving to an array of collections or an error object.
 */
export const fetchCollectionsFromEndpointByName = async (
  bbox?: number[],
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<
  | {
  id: string;
  key: number;
  bbox: number[][];
}[]
  | { error: string }
> => {
  try {
    const url = new URL(`${BASE_URL}/api/get-collections-by-name`);
    if (bbox) {
      url.searchParams.set('bbox', bbox.join(','));
    }
    url.searchParams.set('sortDirection', sortDirection);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`${i18n.t('error_http_status')}: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_data_by_name'), error.message);
    return { error: i18n.t('error_fetching_data_by_name') };
  }
};

/**
 * Fetches collections from the backend, optionally filtered by bounding box (BBOX), and sorted by date.
 *
 * @param bbox Optional bounding box filter [minX, minY, maxX, maxY].
 * @param sortDirection Optional sort direction ('asc' or 'desc'), defaults to 'asc'.
 * @returns A promise resolving to an array of collections or an error object.
 */
export const fetchCollectionsFromEndpointByDate = async (
  bbox?: number[],
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<
  | {
  id: string;
  key: number;
  bbox: number[][];
}[]
  | { error: string }
> => {
  try {
    const url = new URL(`${BASE_URL}/api/get-collections-by-date`);
    if (bbox) {
      url.searchParams.set('bbox', bbox.join(','));
    }
    url.searchParams.set('sortDirection', sortDirection);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`${i18n.t('error_http_status')}: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_data_by_date'), error.message);
    return { error: i18n.t('error_fetching_data_by_date') };
  }
};

export const fetchItems = async (collectionId: string): Promise<any> => {
  try {
    const url = `${BASE_URL}/api/fetch-collections-items/${collectionId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_items'), error);
    return { error: i18n.t('error_fetching_items') };
  }
};

/**
 * Fetches the progress of item fetching for a given collection.
 *
 * @param collectionId The ID of the collection.
 * @returns A promise resolving to the progress percentage or an error object.
 */
export const fetchProgress = async (
  collectionId: string
): Promise<
  | { collectionId: string; progress: number }
  | {
  error: string;
}
> => {
  try {
    const url = `${BASE_URL}/api/fetch-progress/${collectionId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_progress'), error.message);
    return { error: i18n.t('error_fetching_progress') };
  }
};

export const fetchTimestamps = async (): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/api/fetch-items-timestamps`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_timestamps'), error.message);
    throw new Error(`${i18n.t('error_fetching_timestamps')}: ${error.message}`);
  }
};

export const fetchItemIds = async (): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/api/fetch-item-ids`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_ids'), error.message);
    throw new Error(`${i18n.t('error_fetching_ids')}: ${error.message}`);
  }
};

export const fetchItem = async (
  itemId: string,
  collectionId?: string
): Promise<any> => {
  try {
    const url = `${BASE_URL}/api/get-item/${itemId}${collectionId !== null ? '/' + collectionId : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();

    return data;
  } catch (error: any) {
    console.error(i18n.t('error_fetching_metadata'), error);
    return { error: i18n.t('error_fetching_metadata') };
  }
};

export const insertDatalayerView = async (
  collectionId: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/set-datalayer-geometry/${collectionId}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error(i18n.t('error_inserting_view'), error);
    return { error: i18n.t('error_inserting_view') };
  }
};

/**
 * Resets datalayer view
 */
export const resetDatalayerView = async (): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/reset-datalayer-view`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error(i18n.t('error_resetting_datalayer_view'), error);
    return { error: i18n.t('error_resetting_datalayer_view') };
  }
};

export const verifyInternetConnection = async (
  endpoint_url: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/verify-internet-connection?endpointUrl=${encodeURIComponent(endpoint_url)}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error(i18n.t('error_verifying_connection'), error);
    throw new Error(`${i18n.t('error_verifying_connection')}: ${error.message}`);
  }
};

export const loadAssets = async (collectionId: string) : Promise<any> => {
  try {
    const url = `${BASE_URL}/api/load-assets/${collectionId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_assets'), error);
    return { error: i18n.t('error_fetching_assets') };
  }
};

export const getLoadedLayers = async (): Promise<any> => {
  try {
    const url = `${BASE_URL}/api/get-loaded-layers`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_loaded_layers'), error);
    return { error: i18n.t('error_fetching_loaded_layers') };
  }
};

export const resetItemAssets = async (): Promise<string | { error: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/reset-item-assets`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`${i18n.t('error_http_status')}: ${response.status}`);
    }

    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error(i18n.t('error_resetting_item_assets'), error);
    return { error: i18n.t('error_resetting_item_assets') + ': ' + error.message };
  }
};

export const loadAssetLayers = async (itemId: string) : Promise<any> => {
  try {
    const url = `${BASE_URL}/api/load-asset-layers/${itemId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.text();
  } catch (error: any) {
    console.error(i18n.t('error_fetching_assets'), error);
    return { error: i18n.t('error_fetching_assets') };
  }
};
