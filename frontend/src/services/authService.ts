import api from './api';

export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', {
    email: credentials.email,
    password: credentials.password
  });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', {
    name: userData.full_name || userData.name,
    email: userData.email,
    password: userData.password
  });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};
