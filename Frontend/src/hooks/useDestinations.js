import { useState, useEffect, useCallback } from 'react';
import { getDestinations } from '../api/destinationApi';

export const useDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDestinations();
      if (res && res.success) {
        setDestinations(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } else {
        setError(res?.message || 'Failed to load destinations.');
      }
    } catch (err) {
      console.warn('[useDestinations] Error fetching destinations:', err?.message || err);
      if (!err.response) {
        setError('Unable to connect to server. Check your connection or retry.');
      } else if (err.response.status === 404) {
        setError('Requested item was not found.');
      } else if (err.response.status >= 500) {
        setError('Server Error. Please try again in a moment.');
      } else {
        setError(err.response.data?.message || 'An error occurred while loading data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  return { destinations, loading, error, refetch: fetchDestinations };
};
