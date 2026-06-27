'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user_profile');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string, remember = true) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass, rememberLogin: remember });
      const { user: userData, accessToken } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user_profile', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      // Mock login fallback jika backend belum nyala
      if (email.includes('@smart.id')) {
        let roleName: 'Admin' | 'Manager' | 'Staff' | 'Viewer' = 'Admin';
        if (email.includes('manager')) roleName = 'Manager';
        if (email.includes('staff')) roleName = 'Staff';
        const mockUser: User = {
          id: `USR-${Math.floor(Math.random() * 100)}`,
          email,
          name: roleName + ' Smart Notes',
          roleId: 'ROLE-1',
          roleName,
          phone: '081234567890',
        };
        localStorage.setItem('token', 'mock-jwt-token-2026');
        localStorage.setItem('user_profile', JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      throw new Error(error.response?.data?.message || 'Gagal login');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setUser(null);
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.some((r) => r.toLowerCase() === user.roleName.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
};
