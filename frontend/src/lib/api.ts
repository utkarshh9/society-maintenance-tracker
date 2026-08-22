import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 60000, // 60 seconds timeout (was 30s)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
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
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await this.api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Complaint endpoints
  async createComplaint(data: { category: string; description: string; photo_url?: string }) {
    const response = await this.api.post('/complaints/', data);
    return response.data;
  }

  async getComplaints(params?: { status?: string; category?: string; priority?: string }) {
    const response = await this.api.get('/complaints/', { params });
    return response.data;
  }

  async getComplaint(id: number) {
    const response = await this.api.get(`/complaints/${id}`);
    return response.data;
  }

  async updateStatus(id: number, status: string, note?: string) {
    const response = await this.api.patch(`/complaints/${id}/status`, { status, note });
    return response.data;
  }

  async updatePriority(id: number, priority: string) {
    const response = await this.api.patch(`/complaints/${id}/priority`, { priority });
    return response.data;
  }

  async getComplaintHistory(id: number) {
    const response = await this.api.get(`/complaints/${id}/history`);
    return response.data;
  }

  // Notice endpoints
  async getNotices() {
    const response = await this.api.get('/notices/');
    return response.data;
  }

  async createNotice(data: { title: string; content: string; is_important: boolean }) {
    const response = await this.api.post('/notices/', data);
    return response.data;
  }

  async deleteNotice(id: number) {
    const response = await this.api.delete(`/notices/${id}`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getOverdueComplaints() {
    const response = await this.api.get('/dashboard/overdue');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;