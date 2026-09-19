import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserStats: (collectedAmount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('@fintrack_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userId: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(userId, pin);
      if (res.success && res.user) {
        setUser(res.user);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@fintrack_auth_user');
    await AsyncStorage.removeItem('@fintrack_auth_token');
    setUser(null);
  };

  const updateUserStats = (collectedAmount: number) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        todayCollected: (prev.todayCollected || 0) + collectedAmount,
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserStats }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
