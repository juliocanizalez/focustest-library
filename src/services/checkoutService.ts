import api from './api';
import { Checkout } from '../types';

interface CheckoutCreateParams {
  book: string;
}

interface ReturnBookParams {
  checkoutId: string;
}

class CheckoutService {
  async getCheckouts(): Promise<Checkout[]> {
    const response = await api.get<Checkout[]>('/checkouts');
    return response.data;
  }

  async getCheckoutById(id: string): Promise<Checkout> {
    const response = await api.get<Checkout>(`/checkouts/${id}`);
    return response.data;
  }

  async createCheckout(params: CheckoutCreateParams): Promise<Checkout> {
    const response = await api.post<Checkout>('/checkouts', params);
    return response.data;
  }

  async returnBook(params: ReturnBookParams): Promise<Checkout> {
    const response = await api.post<Checkout>('/checkouts/return', params);
    return response.data;
  }

  async getStudentCheckouts(): Promise<Checkout[]> {
    const response = await api.get<Checkout[]>('/checkouts/me');
    return response.data;
  }
}

export default new CheckoutService();
