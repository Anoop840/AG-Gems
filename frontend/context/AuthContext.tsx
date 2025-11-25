'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User, LoginData, RegisterData } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useWallet } from './WalletConnect';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {disconnectWallet}=useWallet();
  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser(response.user);
      } else {
        authAPI.logout();
      }
    } catch (error) {
      authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      if (response.success) {
        setUser(response.user);
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });
        router.push('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      if (response.success) {
        setUser(response.user);
        toast({
          title: 'Success',
          description: 'Account created successfully!',
        });
        router.push('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    disconnectWallet();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}