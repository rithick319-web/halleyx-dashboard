import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderFormData } from '../types';
import { ordersApi } from '../utils/api';

export function useOrders(dateRange: string = 'all') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getAll(dateRange);
      setOrders(res.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const createOrder = async (data: OrderFormData) => {
    const res = await ordersApi.create(data);
    setOrders(prev => [res.data, ...prev]);
    return res.data;
  };

  const updateOrder = async (id: string, data: OrderFormData) => {
    const res = await ordersApi.update(id, data);
    setOrders(prev => prev.map(o => (o.id === id ? res.data : o)));
    return res.data;
  };

  const deleteOrder = async (id: string) => {
    await ordersApi.delete(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return { orders, loading, error, refetch: fetchOrders, createOrder, updateOrder, deleteOrder };
}
