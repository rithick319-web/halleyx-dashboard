import type { Country, Product, OrderStatus, CreatedBy } from '../types';

export const COUNTRIES: Country[] = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];

export const PRODUCTS: Product[] = [
  'Fiber Internet 300 Mbps',
  '5G Unlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package',
];

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'In progress', 'Completed'];

export const CREATED_BY: CreatedBy[] = [
  'Mr. Michael Harris',
  'Mr. Ryan Cooper',
  'Ms. Olivia Carter',
  'Mr. Lucas Martin',
];

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  Pending:     { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  'In progress': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  Completed:   { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
};

export const DATE_RANGE_OPTIONS = [
  { label: 'All time',    value: 'all' },
  { label: 'Today',       value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days',value: '30d' },
  { label: 'Last 90 Days',value: '90d' },
];
