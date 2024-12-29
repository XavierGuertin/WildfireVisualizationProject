import React, { useEffect, useState } from "react";
import { fetchTestStacData } from "../services/api";

// Define the structure of the data being fetched
interface StacData {
  [key: string]: any; // Adjust this based on the exact structure of your STAC data
}

const TestStac: React.FC = () => {
  const [stacData, setStacData] = useState<StacData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchTestStacData();
      if (result.error) {
        setError(result.error);
      } else {
        setStacData(result);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Inline CSS for the container
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 999999,
    backgroundColor: "#ffffff",
    padding: "20px",
    border: "2px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "80%",
    overflowWrap: "break-word",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1>Test STAC Endpoint</h1>
      <pre>{JSON.stringify(stacData, null, 2)}</pre>
    </div>
  );
};

export default TestStac;
