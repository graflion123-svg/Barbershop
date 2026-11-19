import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { User, Admin } from '../types';

interface AuthContextType {
  // Customer State
  customer: User | null;
  isCustomerAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  identifyCustomer: (fullName: string, phone: string) => Promise<User>;
  logoutCustomer: () => void;

  // Admin State
  admin: Admin | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Customer
  const [customer, setCustomer] = useState<User | null>(() => {
    const saved = localStorage.getItem('barber_customer');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Admin
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const saved = localStorage.getItem('barber_admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Verify Admin Token on load
  useEffect(() => {
    const adminToken = localStorage.getItem('barber_admin_token');
    if (!adminToken) {
      setIsAdminLoading(false);
      return;
    }

    api.get('/auth/admin/profile')
      .then(res => {
        if (res.data.success) {
          setAdmin(res.data.admin);
          localStorage.setItem('barber_admin', JSON.stringify(res.data.admin));
        }
      })
      .catch(() => {
        localStorage.removeItem('barber_admin_token');
        localStorage.removeItem('barber_admin');
        setAdmin(null);
      })
      .finally(() => {
        setIsAdminLoading(false);
      });
  }, []);

  // Customer Identify
  const identifyCustomer = async (fullName: string, phone: string): Promise<User> => {
    const res = await api.post('/auth/customer/identify', { fullName, phone });
    if (res.data.success) {
      const user = res.data.user;
      setCustomer(user);
      localStorage.setItem('barber_customer', JSON.stringify(user));
      localStorage.setItem('barber_user_token', res.data.token);
      setIsAuthModalOpen(false);
      return user;
    }
    throw new Error(res.data.message || 'Xatolik yuz berdi');
  };

  const logoutCustomer = () => {
    setCustomer(null);
    localStorage.removeItem('barber_customer');
    localStorage.removeItem('barber_user_token');
  };

  // Admin Login
  const loginAdmin = async (email: string, password: string) => {
    const res = await api.post('/auth/admin/login', { email, password });
    if (res.data.success) {
      setAdmin(res.data.admin);
      localStorage.setItem('barber_admin_token', res.data.token);
      localStorage.setItem('barber_admin', JSON.stringify(res.data.admin));
      return;
    }
    throw new Error(res.data.message || 'Kirishda xatolik');
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('barber_admin_token');
    localStorage.removeItem('barber_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isCustomerAuthenticated: !!customer,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        identifyCustomer,
        logoutCustomer,
        admin,
        isAdminAuthenticated: !!admin,
        isAdminLoading,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
