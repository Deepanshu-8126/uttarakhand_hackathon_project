import { useState, useEffect, useCallback } from 'react';
import { getStays } from '../api/stayApi';

export const useStays = () => {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStays();
      if (res && res.success) {
        setStays(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } else {
        setError(res?.message || 'Failed to load stays.');
      }
    } catch (err) {
      console.warn('[useStays] Error fetching stays:', err?.message || err);
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
    fetchStays();
  }, [fetchStays]);

  return { stays, loading, error, refetch: fetchStays };
};
