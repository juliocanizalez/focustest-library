import api from './api';
import { AuthResponse } from '../types';

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams extends LoginParams {
  firstName: string;
  lastName: string;
  role?: string;
}

class AuthService {
  async login(params: LoginParams): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', params);
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  async register(params: RegisterParams): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', params);
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  async validateToken(): Promise<AuthResponse> {
    // The token is automatically added to the request by the api interceptor
    const response = await api.get<AuthResponse>('/auth/me');
    // Update token in localStorage if a new one was returned
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    // Also clear any session storage to prevent maintaining old navigation state
    sessionStorage.clear();
  }
}

export default new AuthService();
