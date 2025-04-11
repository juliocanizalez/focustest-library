import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchQueries {
  title: string;
  author: string;
  genre: string;
}

interface UseThrottledSearchProps {
  delay?: number;
  onSearch: (queries: SearchQueries) => void;
  initialQueries?: SearchQueries;
}

export function useThrottledSearch({
  delay = 500,
  onSearch,
  initialQueries = { title: '', author: '', genre: '' },
}: UseThrottledSearchProps) {
  const [searchQueries, setSearchQueries] =
    useState<SearchQueries>(initialQueries);
  const timeoutRef = useRef<number | null>(null);
  const hasActiveSearch = useRef<boolean>(false);
  const isTyping = useRef<boolean>(false);
  const isInitialMount = useRef<boolean>(true);
  const prevValueRef = useRef<SearchQueries>(initialQueries);
  const hasResetSearch = useRef<boolean>(false);

  // Memoize the utility functions to avoid dependency issues
  const checkQueryValues = useCallback(() => {
    return Object.values(searchQueries).some((value) => value.trim() !== '');
  }, [searchQueries]);

  const checkValuesChanged = useCallback(() => {
    return (
      prevValueRef.current.title !== searchQueries.title ||
      prevValueRef.current.author !== searchQueries.author ||
      prevValueRef.current.genre !== searchQueries.genre
    );
  }, [searchQueries]);

  useEffect(() => {
    // Skip the effect on initial mount to prevent unnecessary API calls
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // If values haven't changed, don't trigger a search
    if (!checkValuesChanged() && !isTyping.current) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const hasValues = checkQueryValues();

    // If all search fields are empty and we had an active search before,
    // immediately trigger a search to reset/show all books, but only once
    if (!hasValues && hasActiveSearch.current && !hasResetSearch.current) {
      onSearch(searchQueries);
      hasActiveSearch.current = false;
      prevValueRef.current = { ...searchQueries };
      hasResetSearch.current = true; // Mark that we've reset the search
      return;
    }

    // If we have at least one query, we're not in a "reset" state anymore
    if (hasValues) {
      hasResetSearch.current = false;
    }

    // Only set a timeout to trigger search if the user is typing and has query values
    if (hasValues && isTyping.current) {
      timeoutRef.current = window.setTimeout(() => {
        onSearch(searchQueries);
        hasActiveSearch.current = true;
        isTyping.current = false; // Reset typing state after search is triggered
        prevValueRef.current = { ...searchQueries };
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQueries, delay, onSearch, checkQueryValues, checkValuesChanged]);

  const updateSearchQuery = (field: keyof SearchQueries, value: string) => {
    // Only set typing flag if value actually changes
    if (searchQueries[field] !== value) {
      isTyping.current = true;
    }

    setSearchQueries((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearSearchQueries = () => {
    // When explicitly clearing, we should trigger a search
    isTyping.current = true;
    // Reset the hasResetSearch flag when explicitly clearing
    hasResetSearch.current = false;
    setSearchQueries({ title: '', author: '', genre: '' });
  };

  // Expose a method to force a search (useful when component mounts with initial queries)
  const triggerSearch = useCallback(() => {
    if (checkQueryValues()) {
      onSearch(searchQueries);
      hasActiveSearch.current = true;
      prevValueRef.current = { ...searchQueries };
    }
  }, [checkQueryValues, onSearch, searchQueries]);

  return {
    searchQueries,
    updateSearchQuery,
    clearSearchQueries,
    triggerSearch,
  };
}
