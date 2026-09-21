import { apiClient } from './client';
import { storageService } from '../utils/storage';
import { User, UserRole } from '../types';

export interface LoginDto {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  organization?: string;
}

export const authApi = {
  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    try {
      const res = await apiClient.post('/auth/login', dto);
      storageService.setCurrentUser(res.data.user);
      if (res.data.token) {
        storageService.setToken(res.data.token);
      }
      return res.data;
    } catch {
      // Fallback to local storage auth
      const users = storageService.getUsers();
      let user = users.find((u) => u.email.toLowerCase() === dto.email.toLowerCase());
      if (!user) {
        user = {
          id: `user-${Date.now()}`,
          name: dto.email.split('@')[0],
          email: dto.email,
          role: dto.role || 'ADMIN',
          organization: 'Apex Organization',
          createdAt: new Date().toISOString(),
        };
      }
      storageService.setCurrentUser(user);
      return { user, token: `token_${user.id}` };
    }
  },

  async register(dto: RegisterDto): Promise<{ user: User; token: string }> {
    try {
      const res = await apiClient.post('/auth/register', dto);
      storageService.setCurrentUser(res.data.user);
      if (res.data.token) {
        storageService.setToken(res.data.token);
      }
      return res.data;
    } catch {
      const user: User = {
        id: `user-${Date.now()}`,
        name: dto.name,
        email: dto.email,
        role: dto.role || 'TEST_CREATOR',
        organization: dto.organization || 'My Academy',
        createdAt: new Date().toISOString(),
      };
      storageService.setCurrentUser(user);
      return { user, token: `token_${user.id}` };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data.user;
    } catch {
      return storageService.getCurrentUser();
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      storageService.setCurrentUser(null);
    }
  },
};
