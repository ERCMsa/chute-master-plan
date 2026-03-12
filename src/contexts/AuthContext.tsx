import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { getUsers } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PERMISSIONS: Record<UserRole, string[]> = {
  store_manager: ['dashboard', 'inventory', 'add_chute', 'requests', 'approve_request', 'deliver_request', 'users', 'statistics', 'transfer_doc', 'search'],
  production_manager: ['dashboard', 'inventory', 'requests', 'approve_request', 'statistics', 'search'],
  unit1_manager: ['dashboard', 'inventory', 'requests', 'create_request', 'search'],
  unit2_manager: ['dashboard', 'inventory', 'requests', 'create_request', 'search'],
  engineer: ['inventory', 'create_request', 'search', 'requests'],
  worker: ['inventory', 'create_request', 'search', 'requests'],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('ercm_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password && u.active);
    if (found) {
      setUser(found);
      sessionStorage.setItem('ercm_current_user', JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('ercm_current_user');
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
