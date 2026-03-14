import type { Order, OrderFormData, ApiResponse } from '../types';

const BASE = 'http://localhost:4000/api';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const ordersApi = {
  getAll: (dateRange?: string) =>
    request<Order[]>(`/orders${dateRange ? `?dateRange=${dateRange}` : ''}`),

  getOne: (id: string) => request<Order>(`/orders/${id}`),

  create: (data: OrderFormData) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: OrderFormData) =>
    request<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<null>(`/orders/${id}`, { method: 'DELETE' }),

  getStats: () => request<Record<string, unknown>>('/orders/stats/summary'),
};
