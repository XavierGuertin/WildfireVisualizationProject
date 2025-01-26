const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export const fetchTestStacData = async (): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/test-stac`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching test STAC data:', error);
    return { error: 'Failed to fetch data' };
  }
};

export const returnListOfCollectionsFromEndpoint = async (): Promise<{
  error: string;
}> => {
  try {
    const response = await fetch(`${BASE_URL}/api/get-collections`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched collections:', data);
    return data;
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return { error: 'Failed to fetch data' };
  }
};

export const fetchCollectionsFromEndpoint = async (): Promise<string> => {
  try {
    // this will eventually pass a parameter to call the endpoint URL we want
    const response = await fetch(`${BASE_URL}/api/fetch-collections`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}



export const resetCollections = async (): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/reset-collections`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const message = await response.text();
    return message;
  } catch (error: any) {
    console.error('Error resetting collections:', error);
    throw new Error(`Error resetting collections: ${error.message}`);
  }
};

export const fetchMetaData = async (collectionId: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/metadata/${collectionId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();

    const links = JSON.parse(data[0].links.value) 
    let items = {rel: "", href: "", type: ""};
    let parent = {rel: "", href: "", type: ""};
    for(let i = 0; i < links.length; i++){
      const element = links[i];
      if(element.rel === 'items'){
        items = element
      }
      else if(element.rel === 'parent'){
        parent = element
      }
    }
    
    const format = items.type.split('/').pop()

    const sourceLink = parent.href
    let truncatedSource = ""
    if(sourceLink.charAt(sourceLink.length - 1) === '/')
      truncatedSource = sourceLink.substring(0, sourceLink.length - 1);

    const source = truncatedSource.split('/').pop()?.toUpperCase()

    const metadata = {
      date: data[0].datetime,
      enddate: data[0].end_datetime,
      datasetSource: source, 
      description: data[0].description,
      format: format,
      latestAdded: "",
      latestUpdated: "",
      name: data[0].title,
      processes: "",
    }
    return metadata;
  } catch (error: any) {
    console.error("Error fetching MetaData:", error);
    return { error: "Failed to fetch MetaData" };
  }
};