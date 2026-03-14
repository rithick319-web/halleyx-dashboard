// ─── Order Types ────────────────────────────────────────────────────────────

export type Country = 'United States' | 'Canada' | 'Australia' | 'Singapore' | 'Hong Kong';
export type Product =
  | 'Fiber Internet 300 Mbps'
  | '5G Unlimited Mobile Plan'
  | 'Fiber Internet 1 Gbps'
  | 'Business Internet 500 Mbps'
  | 'VoIP Corporate Package';
export type OrderStatus = 'Pending' | 'In progress' | 'Completed';
export type CreatedBy =
  | 'Mr. Michael Harris'
  | 'Mr. Ryan Cooper'
  | 'Ms. Olivia Carter'
  | 'Mr. Lucas Martin';

export interface Order {
  id: string;
  orderId: string;
  orderDate: string;
  // Customer
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: Country;
  // Order
  product: Product;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: CreatedBy;
  createdAt: string;
  updatedAt: string;
}

export type OrderFormData = Omit<Order, 'id' | 'orderId' | 'orderDate' | 'totalAmount' | 'createdAt' | 'updatedAt'>;

// ─── Dashboard Types ─────────────────────────────────────────────────────────

export type WidgetType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KPIConfig {
  metric: string;
  aggregation: 'Sum' | 'Average' | 'Count';
  dataFormat: 'Number' | 'Currency';
  decimalPrecision: number;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  chartColor: string;
  showDataLabel: boolean;
}

export interface PieConfig {
  chartData: string;
  showLegend: boolean;
}

export interface TableConfig {
  columns: string[];
  sortBy?: 'Ascending' | 'Descending' | 'Order date';
  pagination?: 5 | 10 | 15;
  applyFilter: boolean;
  fontSize: number;
  headerBackground: string;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  config: KPIConfig | ChartConfig | PieConfig | TableConfig | Record<string, unknown>;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
  dateRange: 'all' | 'today' | '7d' | '30d' | '90d';
  createdAt: string;
  updatedAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}
