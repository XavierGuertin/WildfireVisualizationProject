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
    console.error("Error fetching test STAC data:", error);
    return { error: "Failed to fetch data" };
  }
};
