import { useState, useEffect, useCallback } from 'react';

export const useRealtimeUpdates = (initialData, fetchFunction, interval = 30000) => {
  // Minimum interval: 2 minutes (120000 ms)
  const safeInterval = Math.max(interval, 120000);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();

    // Set up interval for real-time updates
    const intervalId = setInterval(fetchData, safeInterval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchData, safeInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};