import api from './api';
import { User, UserRole } from '../types';

interface UserCreateParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UserUpdateParams extends Partial<Omit<UserCreateParams, 'password'>> {
  _id: string;
}

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(params: UserCreateParams): Promise<User> {
    const response = await api.post<User>('/users', params);
    return response.data;
  }

  async updateUser(params: UserUpdateParams): Promise<User> {
    const { _id, ...userData } = params;
    const response = await api.put<User>(`/users/${_id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

export default new UserService();
