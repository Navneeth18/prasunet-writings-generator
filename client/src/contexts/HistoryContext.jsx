
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isSignedIn } = useAuth();

  // Define fetchHistory with useCallback to memoize it
  const fetchHistory = useCallback(async () => {
    if (!isSignedIn || !user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.getUserHistory(user._id);
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, setIsLoading, setError, setHistory]);

  // Fetch history when user is signed in
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // No need for addToHistory as it's automatically added when generating prompts
  // But we'll keep a refresh function to manually update the history
  // Use useCallback to memoize the function and prevent infinite renders
  const refreshHistory = useCallback(async () => {
    if (!isSignedIn || !user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.getUserHistory(user._id);
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Failed to refresh history:', err);
      setError('Failed to refresh history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, setIsLoading, setError, setHistory]);

  // Delete a single history item
  const deleteHistoryItem = useCallback(async (itemId) => {
    if (!isSignedIn || !user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      await userAPI.deleteHistoryItem(itemId);
      // Update local state by removing the deleted item
      setHistory(prevHistory => prevHistory.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      setError('Failed to delete history item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, setIsLoading, setError, setHistory]);

  // Delete history by date range
  const deleteHistoryByDateRange = useCallback(async (startDate, endDate) => {
    if (!isSignedIn || !user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      await userAPI.deleteHistoryByDateRange(user._id, startDate, endDate);
      // Refresh history after deletion
      await refreshHistory();
    } catch (err) {
      console.error('Failed to delete history by date range:', err);
      setError('Failed to delete history by date range. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, setIsLoading, setError, refreshHistory]);

  // Delete all history
  const deleteAllHistory = useCallback(async () => {
    if (!isSignedIn || !user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      await userAPI.deleteAllHistory(user._id);
      // Clear local history state
      setHistory([]);
    } catch (err) {
      console.error('Failed to delete all history:', err);
      setError('Failed to delete all history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, setIsLoading, setError, setHistory]);

  return (
    <HistoryContext.Provider value={{
      history,
      isLoading,
      error,
      refreshHistory,
      deleteHistoryItem,
      deleteHistoryByDateRange,
      deleteAllHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
};
