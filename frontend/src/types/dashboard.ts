export type WidgetType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi';

export interface WidgetLayout {
  i: string;
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
  sortBy: string;
  pagination: number;
  fontSize: number;
  headerBackground: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  layout: WidgetLayout;
  config: KPIConfig | ChartConfig | PieConfig | TableConfig | Record<string, any>;
}

export const WIDGET_DEFAULTS: Record<WidgetType, { w: number; h: number }> = {
  kpi:     { w: 2, h: 2 },
  bar:     { w: 5, h: 5 },
  line:    { w: 5, h: 5 },
  area:    { w: 5, h: 5 },
  scatter: { w: 5, h: 5 },
  pie:     { w: 4, h: 4 },
  table:   { w: 4, h: 4 },
};

export const AXIS_OPTIONS = ['Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by'];
export const METRIC_OPTIONS = ['Customer ID', 'Customer name', 'Email id', 'Address', 'Order date', 'Product', 'Created by', 'Status', 'Total amount', 'Unit price', 'Quantity'];
export const NUMERIC_METRICS = ['Total amount', 'Unit price', 'Quantity'];
export const TABLE_COLUMNS = ['Customer ID', 'Customer name', 'Email id', 'Phone number', 'Address', 'Order ID', 'Order date', 'Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by'];
export const PIE_OPTIONS = ['Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by'];
