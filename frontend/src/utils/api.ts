import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userAPI = {
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/users/register', userData),
  
  login: (credentials: { username: string; password: string }) =>
    api.post('/users/login', credentials),
  
  getProfile: () =>
    api.get('/users/me'),
  
  getAllUsers: () =>
    api.get('/users'),
};

// 训练相关API
export const trainingAPI = {
  getScenarios: () =>
    api.get('/training/scenarios'),
  
  getScenario: (type: string) =>
    api.get(`/training/scenarios/${type}`),
  
  submitTraining: (data: {
    scenarioType: string;
    score: number;
    duration: number;
    stepsData: any[];
  }) =>
    api.post('/training/submit', data),
  
  getRecords: (page: number = 1, limit: number = 10) =>
    api.get(`/training/records?page=${page}&limit=${limit}`),
  
  getBestScores: () =>
    api.get('/training/best-scores'),
  
  getAllRecords: (page: number = 1, limit: number = 20) =>
    api.get(`/training/records?page=${page}&limit=${limit}`),
};

// 统计相关API
export const statsAPI = {
  getOverview: () =>
    api.get('/stats/overview'),
  
  getPersonal: () =>
    api.get('/stats/personal'),
  
  getLeaderboard: (scenario?: string, timeframe?: string) =>
    api.get('/stats/leaderboard', { 
      params: { scenario, timeframe } 
    }),
};

export default api;