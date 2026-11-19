import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getErrorMessage } from '../api/client';
import { ShopSettings } from '../types';

interface SettingsContextType {
  settings: ShopSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (data: Partial<ShopSettings>) => Promise<{ success: boolean; message?: string }>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
        if (res.data.settings.shopName) {
          document.title = `${res.data.settings.shopName} | Exclusive Barbershop`;
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (data: Partial<ShopSettings>) => {
    try {
      const res = await api.put('/settings', data);
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
        if (res.data.settings.shopName) {
          document.title = `${res.data.settings.shopName} | Exclusive Barbershop`;
        }
        return { success: true, message: "Sozlamalar saqlandi va saytda yangilandi!" };
      }
      return { success: false, message: "Xatolik yuz berdi" };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
