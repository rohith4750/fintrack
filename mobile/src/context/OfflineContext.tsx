import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';

interface OfflineContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<number>;
  refreshPendingCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(() => {
      refreshPendingCount();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshPendingCount = async () => {
    try {
      const queueStr = await AsyncStorage.getItem('@fintrack_offline_collections_queue');
      if (queueStr) {
        const queue = JSON.parse(queueStr);
        setPendingCount(queue.length);
      } else {
        setPendingCount(0);
      }
    } catch (e) {
      setPendingCount(0);
    }
  };

  const syncNow = async (): Promise<number> => {
    setIsSyncing(true);
    try {
      const synced = await ApiService.syncOfflineQueue();
      await refreshPendingCount();
      return synced;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        syncNow,
        refreshPendingCount,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
};
