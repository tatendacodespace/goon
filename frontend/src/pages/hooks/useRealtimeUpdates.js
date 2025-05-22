import { useState, useEffect, useCallback, useRef } from 'react';

// Cache to store data and timestamps
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache duration

export const useRealtimeUpdates = (initialData = null, fetchFunction, interval = 30000) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const retryCount = useRef(0);
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay
  const lastFetchTime = useRef(0);
  const minTimeBetweenRequests = 5000; // Minimum 5 seconds between requests

  const getCacheKey = useCallback(() => {
    // Create a unique cache key based on the function name and arguments
    return fetchFunction.toString();
  }, [fetchFunction]);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    const cacheKey = getCacheKey();
    const cachedData = cache.get(cacheKey);

    // Check if we have valid cached data and it's not a forced refresh
    if (!force && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      setData(cachedData.data);
      setLoading(false);
      return;
    }

    // Check if we're making requests too frequently
    if (now - lastFetchTime.current < minTimeBetweenRequests) {
      console.log('Throttling request - too soon since last fetch');
      return;
    }

    try {
      setError('');
      lastFetchTime.current = now;
      const result = await fetchFunction();
      
      // Update cache
      cache.set(cacheKey, {
        data: result,
        timestamp: now
      });
      
      setData(result);
      retryCount.current = 0;
    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (retryCount.current < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount.current);
        retryCount.current += 1;
        
        console.log(`Retrying in ${delay}ms (attempt ${retryCount.current}/${maxRetries})`);
        setTimeout(() => fetchData(true), delay);
      } else {
        setError(err.message || 'Failed to fetch data after multiple attempts');
        retryCount.current = 0;
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, getCacheKey]);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const scheduleNextFetch = () => {
      if (isMounted) {
        timeoutId = setTimeout(() => {
          fetchData().finally(() => {
            if (isMounted) {
              scheduleNextFetch();
            }
          });
        }, interval);
      }
    };

    // Initial fetch
    fetchData().finally(() => {
      if (isMounted) {
        scheduleNextFetch();
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchData, interval]);

  // Function to force a refresh
  const forceRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refetch: forceRefresh };
}; 