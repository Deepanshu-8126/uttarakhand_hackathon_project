import { useState, useEffect, useCallback } from 'react';
import { getRentals } from '../api/rentalApi';

export const useRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRentals();
      if (res && res.success) {
        setRentals(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } else {
        setError(res?.message || 'Failed to load rentals.');
      }
    } catch (err) {
      console.warn('[useRentals] Error fetching rentals:', err?.message || err);
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
    fetchRentals();
  }, [fetchRentals]);

  return { rentals, loading, error, refetch: fetchRentals };
};
