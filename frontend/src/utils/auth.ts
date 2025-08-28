import { User } from '../types';

export const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthData = (user: User, token: string): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export const clearAuthData = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'admin';
};