import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authApi, LoginDto, RegisterDto } from '../api/authApi';
import { storageService } from '../utils/storage';
import { DEMO_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<User>;
  loginAsDemo: (role: UserRole) => Promise<User>;
  register: (dto: RegisterDto) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (dto: LoginDto): Promise<User> => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authApi.login(dto);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const demoUser = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
      storageService.setCurrentUser(demoUser);
      setUser(demoUser);
      return demoUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto): Promise<User> => {
    setIsLoading(true);
    try {
      const { user: newUser } = await authApi.register(dto);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      storageService.setCurrentUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        updateUser,
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
