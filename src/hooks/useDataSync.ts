import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api/data';

interface SyncOptions<T> {
  key: string;          // Key for both localStorage and API
  defaultValue: T;      // Default value if nothing is stored
  debounceMs?: number;  // Debounce time for server sync
}

export function useDataSync<T>({ key, defaultValue, debounceMs = 1000 }: SyncOptions<T>) {
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState<T[]>([]);

  // Load initial data from server
  useEffect(() => {
    let isMounted = true;
    const loadFromServer = async () => {
      try {
        const response = await fetch(`${API_URL}/${key}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data: serverData } = await response.json();
        if (serverData !== null && isMounted) {
          setData(serverData);
          localStorage.setItem(key, JSON.stringify(serverData));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
        if (isMounted) {
          setError(`Failed to load ${key} from server`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFromServer();
    return () => {
      isMounted = false;
    };
  }, [key]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, data]);

  // Sync with server with debounce
  useEffect(() => {
    if (syncQueue.length === 0) return;

    let isMounted = true;
    const syncWithServer = async () => {
      if (isSyncing) return;
      setIsSyncing(true);

      try {
        const response = await fetch(`${API_URL}/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: syncQueue[syncQueue.length - 1] }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (isMounted) {
          // Clear sync queue on successful sync
          setSyncQueue([]);
          setError(null);
        }
      } catch (error) {
        console.error(`Error syncing ${key}:`, error);
        if (isMounted) {
          setError(`Failed to sync ${key} with server`);
        }
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    const timeoutId = setTimeout(syncWithServer, debounceMs);
    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [key, syncQueue, isSyncing, debounceMs]);

  // Update function that handles both local and server updates
  const updateData = (newData: T | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData;
      setSyncQueue(queue => [...queue, updated]);
      return updated;
    });
  };

  return {
    data,
    setData: updateData,
    error,
    isLoading,
    isSyncing
  };
} 