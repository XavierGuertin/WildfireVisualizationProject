import React, { useState } from 'react';
import { returnListOfCollectionsFromEndpoint } from '../services/api';

// Define the structure of the data being fetched
interface StacData {
  [key: string]: any; // Adjust this based on the exact structure of your STAC data
}

const TestStac: React.FC = () => {
  const [stacData, setStacData] = useState<StacData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const result = await returnListOfCollectionsFromEndpoint();
      if (result.error) {
        setError(result.error);
      } else {
        setStacData(result);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
    setLoading(false);
  };

  // Inline CSS for the container
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999999,
    backgroundColor: '#ffffff',
    padding: '20px',
    border: '2px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    maxWidth: '80%',
    overflowWrap: 'break-word',
  };

  return (
    <div style={containerStyle}>
      <h2>Test STAC Endpoint</h2>
      <button onClick={handleFetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {stacData && (
        <pre
          style={{
            marginTop: '10px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {JSON.stringify(stacData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestStac;
