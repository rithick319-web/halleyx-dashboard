import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from 'recharts';
import type { DashboardWidget, KPIConfig, ChartConfig, PieConfig, TableConfig } from '../types/dashboard';
import type { Order } from '../types';

interface Props {
  widget: DashboardWidget;
  orders: Order[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

function getFieldValue(order: Order, field: string): string | number {
  const map: Record<string, any> = {
    'Product': order.product,
    'Quantity': order.quantity,
    'Unit price': order.unitPrice,
    'Total amount': order.totalAmount,
    'Status': order.status,
    'Created by': order.createdBy.replace(/^Mr\. |^Ms\. /, ''),
    'Duration': new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short' }),
  };
  return map[field] ?? '';
}

function groupBy(orders: Order[], field: string): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  orders.forEach(o => {
    const key = String(getFieldValue(o, field));
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildChartData(orders: Order[], xField: string, yField: string) {
  const map: Record<string, number> = {};
  orders.forEach(o => {
    const x = String(getFieldValue(o, xField));
    const y = getFieldValue(o, yField);
    map[x] = (map[x] || 0) + (typeof y === 'number' ? y : 1);
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function aggregate(orders: Order[], metric: string, agg: string): number {
  const values = orders.map(o => {
    const v = getFieldValue(o, metric);
    return typeof v === 'number' ? v : 1;
  });
  if (agg === 'Count') return orders.length;
  if (agg === 'Sum') return values.reduce((a, b) => a + b, 0);
  if (agg === 'Average') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return 0;
}

const KPIWidget: React.FC<{ widget: DashboardWidget; orders: Order[] }> = ({ widget, orders }) => {
  const cfg = widget.config as KPIConfig;
  const value = aggregate(orders, cfg.metric || 'Total amount', cfg.aggregation || 'Sum');
  const formatted = cfg.dataFormat === 'Currency'
    ? '$' + value.toFixed(cfg.decimalPrecision ?? 0)
    : value.toFixed(cfg.decimalPrecision ?? 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {cfg.metric || 'Total amount'}
      </p>
      <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#111827' }}>{formatted}</p>
      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9CA3AF' }}>{cfg.aggregation || 'Sum'}</p>
    </div>
  );
};

const ChartWidget: React.FC<{ widget: DashboardWidget; orders: Order[] }> = ({ widget, orders }) => {
  const cfg = widget.config as ChartConfig;
  const data = buildChartData(orders, cfg.xAxis || 'Product', cfg.yAxis || 'Total amount');
  const color = cfg.chartColor || '#10B981';
  const showLabel = cfg.showDataLabel;
  const common = { data, margin: { top: 10, right: 10, left: 0, bottom: 40 } };

  return (
    <div style={{ width: '100%', height: '100%', padding: '0.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        {widget.type === 'bar' ? (
          <BarChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]}>
              {showLabel && <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />}
            </Bar>
          </BarChart>
        ) : widget.type === 'line' ? (
          <LineChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color }}>
              {showLabel && <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />}
            </Line>
          </LineChart>
        ) : widget.type === 'area' ? (
          <AreaChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke={color} fill={color + '33'} strokeWidth={2}>
              {showLabel && <LabelList dataKey="value" position="top" style={{ fontSize: 10 }} />}
            </Area>
          </AreaChart>
        ) : (
          <ScatterChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis dataKey="value" tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill={color} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const PieWidget: React.FC<{ widget: DashboardWidget; orders: Order[] }> = ({ widget, orders }) => {
  const cfg = widget.config as PieConfig;
  const data = groupBy(orders, cfg.chartData || 'Status');

  // Fix: percent could be undefined — handle safely
  const renderLabel = ({ name, percent }: { name?: string; percent?: number }) => {
    if (!name || percent === undefined) return '';
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div style={{ width: '100%', height: '100%', padding: '0.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            label={renderLabel}
            labelLine={false}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          {cfg.showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const TableWidget: React.FC<{ widget: DashboardWidget; orders: Order[] }> = ({ widget, orders }) => {
  const cfg = widget.config as TableConfig;
  const cols = cfg.columns?.length ? cfg.columns : ['Customer name', 'Product', 'Total amount', 'Status'];
  const pageSize = cfg.pagination || 5;
  const fontSize = cfg.fontSize || 14;
  const headerBg = cfg.headerBackground || '#54bd95';

  const getCell = (order: Order, col: string): string => {
    const map: Record<string, string> = {
      'Customer ID': order.id.slice(0, 8),
      'Customer name': `${order.firstName} ${order.lastName}`,
      'Email id': order.email,
      'Phone number': order.phone,
      'Address': `${order.city}, ${order.country}`,
      'Order ID': order.orderId,
      'Order date': new Date(order.orderDate).toLocaleDateString(),
      'Product': order.product,
      'Quantity': String(order.quantity),
      'Unit price': `$${order.unitPrice}`,
      'Total amount': `$${order.totalAmount.toFixed(2)}`,
      'Status': order.status,
      'Created by': order.createdBy.replace(/^Mr\. |^Ms\. /, ''),
    };
    return map[col] ?? '';
  };

  const shown = orders.slice(0, pageSize);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${fontSize}px` }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} style={{ padding: '8px 10px', background: headerBg, color: '#fff', textAlign: 'left', fontSize: `${fontSize - 1}px`, whiteSpace: 'nowrap' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((order, i) => (
            <tr key={order.id} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
              {cols.map(col => (
                <td key={col} style={{ padding: '7px 10px', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                  {getCell(order, col)}
                </td>
              ))}
            </tr>
          ))}
          {shown.length === 0 && (
            <tr><td colSpan={cols.length} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const WidgetRenderer: React.FC<Props> = ({ widget, orders }) => {
  if (orders.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '28px', opacity: 0.3 }}>📊</span>
        <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>No data yet</p>
      </div>
    );
  }

  switch (widget.type) {
    case 'kpi':     return <KPIWidget widget={widget} orders={orders} />;
    case 'bar':
    case 'line':
    case 'area':
    case 'scatter': return <ChartWidget widget={widget} orders={orders} />;
    case 'pie':     return <PieWidget widget={widget} orders={orders} />;
    case 'table':   return <TableWidget widget={widget} orders={orders} />;
    default:        return null;
  }
};

